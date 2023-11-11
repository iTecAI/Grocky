from pymongo import MongoClient
from dotenv import load_dotenv
from os import environ, getenv
from dataclasses import dataclass
from typing import Any, Optional, AsyncIterator
from models.auth import Session
from open_groceries import OpenGrocery
from datetime import datetime, timedelta
from minio import Minio
from minio.tagging import Tags
import io
from litestar.channels import ChannelsPlugin
from uuid import uuid4
from datetime import timedelta
from .time_conversions import Time
import contextlib
import asyncio

EXPIRE_WORKERS = 3600


@dataclass
class DatabaseOptions:
    host: str
    port: int
    database: str
    user: Optional[str]
    password: Optional[str]


@dataclass
class SecurityOptions:
    session_timeout: int


@dataclass
class StoreOptions:
    stores: list[str]
    default_location: str
    workers: int


@dataclass
class StorageOptions:
    host: str
    access_key: str
    secret_key: str
    bucket_name: str
    secure: bool


@dataclass
class ContextOptions:
    db: DatabaseOptions
    security: SecurityOptions
    groceries: StoreOptions
    storage: StorageOptions


@dataclass
class GroceryWorker:
    locks: int
    location: str
    created_at: datetime
    worker: OpenGrocery

    @classmethod
    def create(cls, location: str, adapters: list[str]) -> "GroceryWorker":
        worker = OpenGrocery(features=adapters)
        worker.set_nearest_stores(location)
        return GroceryWorker(
            locks=0, location=location, created_at=Time().utc, worker=worker
        )


class Context:
    def __init__(self, channels: ChannelsPlugin) -> None:
        self.options: ContextOptions = self.get_options()
        self.client = MongoClient(
            host=self.options.db.host,
            port=self.options.db.port,
            authSource=self.options.db.database,
            username=self.options.db.user,
            password=self.options.db.password,
        )
        self.database = self.client[self.options.db.database]
        self.grocery_workers: dict[int, GroceryWorker] = {
            0: GroceryWorker.create(
                self.options.groceries.default_location,
                self.options.groceries.stores,
            )
        }
        self.s3 = Minio(
            self.options.storage.host,
            access_key=self.options.storage.access_key,
            secret_key=self.options.storage.secret_key,
            secure=self.options.storage.secure,
        )

        if not self.s3.bucket_exists(self.options.storage.bucket_name):
            self.s3.make_bucket(self.options.storage.bucket_name)

        self.event_channels = channels

    @contextlib.asynccontextmanager
    async def get_grocery_worker(self, location: str = None) -> AsyncIterator[OpenGrocery]:
        select: int = None
        while select == None:
            for k, v in list(self.grocery_workers.items()):
                if v.created_at + timedelta(seconds=EXPIRE_WORKERS) < Time().utc:
                    if v.locks <= 0:
                        del self.grocery_workers[k]
                    continue

                if v.location == location or location == None:
                    select = k
                    break

            if select == None:
                for k, v in self.grocery_workers.items():
                    if v.locks <= 0:
                        v.locks += 1
                        v.location = location
                        v.worker.set_nearest_stores(location)
                        v.locks -= 1
                        select = k
                        break

            if (
                select == None
                and len(self.grocery_workers.keys()) < self.options.groceries.workers
            ):
                new_id = max(list(self.grocery_workers.keys()), default=-1) + 1
                self.grocery_workers[new_id] = GroceryWorker.create(
                    location, self.options.groceries.stores
                )
                select = new_id

            if select == None:
                await asyncio.sleep(1)

        self.grocery_workers[select].locks += 1
        try:
            yield self.grocery_workers[select].worker
        finally:
            self.grocery_workers[select].locks = max(
                0, self.grocery_workers[select].locks - 1
            )

    def get_options(self) -> ContextOptions:
        # load_dotenv()
        return ContextOptions(
            db=DatabaseOptions(
                host=environ["MONGO_HOST"],
                port=int(getenv("MONGO_PORT", "27017")),
                database=getenv("MONGO_DATABASE", None),
                user=getenv("MONGO_USER", None),
                password=getenv("MONGO_PASSWORD"),
            ),
            security=SecurityOptions(
                session_timeout=int(getenv("SESSION_TIMEOUT", "3600"))
            ),
            groceries=StoreOptions(
                stores=getenv("STORES", "wegmans,costco").split(","),
                default_location=getenv("DEFAULT_LOCATION", "Times Square NYC"),
                workers=int(getenv("GROCERY_WORKERS", "10")),
            ),
            storage=StorageOptions(
                host=environ["S3_HOST"],
                access_key=environ["S3_ACCESS_KEY"],
                secret_key=environ["S3_SECRET_KEY"],
                bucket_name=getenv("S3_BUCKET", "s3-grocky"),
                secure=getenv("S3_SECURE", "no") == "yes",
            ),
        )

    def check_session(self, session: Session) -> bool:
        if (
            session.last_request
            + timedelta(seconds=self.options.security.session_timeout)
            < Time().utc
        ):
            session.destroy()
            return False
        else:
            session.last_request = Time().utc
            return True

    def store_object(
        self,
        object_name: str,
        data: bytes,
        mime: str = "application/octet-stream",
        tags: dict[str, Any] = {},
    ) -> None:
        self.s3.put_object(
            self.bucket,
            object_name,
            io.BytesIO(data),
            len(data),
            content_type=mime,
        )

    def get_object(self, object_name: str) -> tuple[bytes, str]:
        obj = self.s3.get_object(self.bucket, object_name)

        return obj.data, obj.info().get("Content-Type", "application/octet-stream")

    def get_object_tags(self, object_name: str) -> Tags:
        return self.s3.get_object_tags(self.bucket, object_name)

    def delete_object(self, object_name: str) -> None:
        self.s3.remove_object(self.bucket, object_name)

    @property
    def bucket(self) -> str:
        return self.options.storage.bucket_name

    def post_event(
        self, targets: list[str], event_type: str, event_data: dict = {}
    ) -> None:
        self.event_channels.publish(
            dict(id=uuid4().hex, event=event_type, data=event_data),
            [f"ws.{t}" for t in targets],
        )

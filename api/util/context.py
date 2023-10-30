from pymongo import MongoClient
from dotenv import load_dotenv
from os import environ, getenv
from dataclasses import dataclass
from typing import Any, Optional
from asyncio.queues import Queue
from models import Event, Session
from open_groceries import OpenGrocery
import time
from minio import Minio
import io


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
    stores: str
    default_location: str


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


class Context:
    def __init__(self) -> None:
        self.options: ContextOptions = self.get_options()
        self.event_queue: Queue[Event] = Queue()
        self.client = MongoClient(
            host=self.options.db.host,
            port=self.options.db.port,
            authSource=self.options.db.database,
            username=self.options.db.user,
            password=self.options.db.password,
        )
        self.database = self.client[self.options.db.database]
        self.groceries = OpenGrocery(features=self.options.groceries.stores)
        self.groceries.set_nearest_stores(near=self.options.groceries.default_location)
        self.s3 = Minio(
            self.options.storage.host,
            access_key=self.options.storage.access_key,
            secret_key=self.options.storage.secret_key,
            secure=self.options.storage.secure
        )

        if not self.s3.bucket_exists(self.options.storage.bucket_name):
            self.s3.make_bucket(self.options.storage.bucket_name)

    def get_options(self) -> ContextOptions:
        load_dotenv()
        return ContextOptions(
            db=DatabaseOptions(
                host=environ["MONGO_HOST"],
                port=int(getenv("MONGO_PORT", "27017")),
                database=getenv("MONGO_DATABASE", "grocy"),
                user=getenv("MONGO_USER", "grocy"),
                password=getenv("MONGO_PASSWORD"),
            ),
            security=SecurityOptions(
                session_timeout=int(getenv("SESSION_TIMEOUT", "3600"))
            ),
            groceries=StoreOptions(
                stores=getenv("STORES", "wegmans,costco").split(","),
                default_location=getenv("DEFAULT_LOCATION", "Times Square NYC"),
            ),
            storage=StorageOptions(
                host=environ["S3_HOST"],
                access_key=environ["S3_ACCESS_KEY"],
                secret_key=environ["S3_SECRET_KEY"],
                bucket_name=getenv("S3_BUCKET", "s3-grocy"),
                secure=getenv("S3_SECURE", "no") == "yes"
            )
        )

    def check_session(self, session: Session) -> bool:
        if session.last_request + self.options.security.session_timeout < time.time():
            session.destroy()
            return False
        else:
            session.last_request = time.time()
            return True

    def store_object(
        self,
        object_name: str,
        data: bytes,
        mime: str = "application/octet-stream"
    ) -> None:
        self.s3.put_object(self.bucket, object_name, io.BytesIO(data), len(data), content_type=mime)

    def get_object(
        self,
        object_name: str
    ) -> bytes:
        return self.s3.get_object(self.bucket, object_name).data
        
    @property
    def bucket(self) -> str:
        return self.options.storage.bucket_name

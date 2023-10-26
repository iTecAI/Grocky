from pymongo import MongoClient
from dotenv import load_dotenv
from os import environ, getenv
from dataclasses import dataclass
from typing import Optional
from asyncio.queues import Queue
from models import Event, Session
from open_groceries import OpenGrocery
import time

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
class ContextOptions:
    db: DatabaseOptions
    security: SecurityOptions
    groceries: StoreOptions

class Context:
    def __init__(self) -> None:
        self.options: ContextOptions = self.get_options()
        self.event_queue: Queue[Event] = Queue()
        self.client = MongoClient(host=self.options.db.host, port=self.options.db.port, authSource=self.options.db.database, username=self.options.db.user, password=self.options.db.password)
        self.database = self.client[self.options.db.database]
        self.groceries = OpenGrocery(features=self.options.groceries.stores)
        self.groceries.set_nearest_stores(near=self.options.groceries.default_location)

    def get_options(self) -> ContextOptions:
        load_dotenv()
        return ContextOptions(
            db=DatabaseOptions(
                host=environ["MONGO_HOST"],
                port=int(getenv("MONGO_PORT", "27017")),
                database=getenv("MONGO_DATABASE", "grocy"),
                user=getenv("MONGO_USER", "grocy"),
                password=getenv("MONGO_PASSWORD")
            ),
            security=SecurityOptions(
                session_timeout=int(getenv("SESSION_TIMEOUT", "3600"))
            ),
            groceries=StoreOptions(
                stores=getenv("STORES", "wegmans,costco").split(","),
                default_location=getenv("DEFAULT_LOCATION", "Times Square NYC")
            )
        )
    
    def check_session(self, session: Session) -> bool:
        if session.last_request + self.options.security.session_timeout < time.time():
            session.destroy()
            return False
        else:
            session.last_request = time.time()
            return True
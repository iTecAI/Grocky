from pymongo import MongoClient
from dotenv import load_dotenv
from os import environ, getenv
from dataclasses import dataclass
from typing import Optional
from asyncio.queues import Queue
from models import Event

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
class ContextOptions:
    db: DatabaseOptions
    security: SecurityOptions

class Context:
    def __init__(self) -> None:
        self.options: ContextOptions = self.get_options()
        self.event_queue: Queue[Event] = Queue()
        self.client = MongoClient(host=self.options.db.host, port=self.options.db.port, authSource=self.options.db.database, username=self.options.db.user, password=self.options.db.password)
        self.database = self.client[self.options.db.database]

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
            )
        )
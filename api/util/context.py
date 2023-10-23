from pymongo import MongoClient
from dotenv import load_dotenv
from os import environ, getenv
from dataclasses import dataclass
from typing import Optional
from asyncio.queues import Queue
from typings import Event

@dataclass
class DatabaseOptions:
    host: str
    port: int
    database: str
    user: Optional[str]
    password: Optional[str]


@dataclass
class ContextOptions:
    db: DatabaseOptions

class Context:
    def __init__(self) -> None:
        self.options: ContextOptions = self.get_options()
        self.event_queue: Queue[Event] = Queue()

    def get_options(self) -> ContextOptions:
        load_dotenv()
        return ContextOptions(
            db=DatabaseOptions(
                host=environ["MONGO_HOST"],
                port=int(getenv("MONGO_PORT", "27017")),
                database=getenv("MONGO_DATABASE", "grocy"),
                user=getenv("MONGO_USER", "grocy"),
                password=getenv("MONGO_PASSWORD")
            )
        )
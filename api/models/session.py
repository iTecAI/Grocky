from dataclasses import dataclass
from pymongo.database import Database
from util.orm import Record
from typing import Optional
import time

@dataclass
class Session(Record):
    collection_name = "sessions"
    last_request: float
    user: Optional[str]

    @classmethod
    def create(cls, database: Database) -> "Session":
        new_session = Session(id=cls._id(), database=database, last_request=time.time(), user=None)
        new_session.save()
        return new_session
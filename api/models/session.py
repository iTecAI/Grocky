from dataclasses import dataclass
from pymongo.database import Database
from util.orm import Record
from .user import User
from typing import Optional
import time


@dataclass
class Session(Record):
    collection_name = "sessions"
    last_request: float
    user: Optional[str]

    @classmethod
    def create(cls, database: Database) -> "Session":
        new_session = Session(
            id=cls._id(), database=database, last_request=time.time(), user=None
        )
        new_session.save()
        return new_session

    @property
    def json(self) -> "SessionModel":
        SessionModel(
            id=self.id,
            last_request=self.last_request,
            user=self.user_data.redacted if self.user else None,
        )

    @property
    def user_data(self) -> User:
        return User.load_id(self.database, self.user) if self.user else None


@dataclass
class SessionModel:
    id: str
    last_request: float
    user: Optional[User]

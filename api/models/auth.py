from dataclasses import dataclass
from pymongo.database import Database
from util.orm import Record
from util.time_conversions import Time
from typing import Optional
import time, datetime
from hashlib import pbkdf2_hmac, sha256
from secrets import token_hex


@dataclass
class Session(Record):
    collection_name = "sessions"
    last_request: datetime.datetime
    user: Optional[str]

    @classmethod
    def create(cls, database: Database) -> "Session":
        new_session = Session(
            id=cls._id(), database=database, last_request=Time().utc, user=None
        )
        new_session.save()
        return new_session

    @property
    def json(self) -> "SessionModel":
        return SessionModel(
            id=self.id,
            last_request=self.last_request,
            user=self.user_data.redacted if self.user else None,
        )

    @property
    def user_data(self) -> "User":
        return User.load_id(self.database, self.user) if self.user else None

    def notify(self, context, event_subtype: str, data: dict = {}):
        context.post_event([self.id], f"session.{event_subtype}", event_data=data)


@dataclass
class SessionModel:
    id: str
    last_request: float
    user: Optional["User"]


ITERS = 200000


@dataclass
class User(Record):
    collection_name = "users"
    username: str
    display_name: str
    profile_image: str
    password_hash: str
    password_salt: str

    @classmethod
    def derive(cls, password: str, salt: str) -> str:
        return pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt.encode("utf-8"), ITERS
        ).hex()

    @classmethod
    def create(cls, database: Database, username: str, password: str) -> "User":
        salt = token_hex(32)
        key = cls.derive(password, salt)
        created = User(
            id=cls._id(),
            database=database,
            username=username,
            display_name=username,
            profile_image=f"https://gravatar.com/avatar/{sha256(username.strip().encode()).hexdigest()}?d=retro",
            password_hash=key,
            password_salt=salt,
        )
        created.save()
        return created

    def check(self, password: str) -> bool:
        derived = self.derive(password, self.password_salt)
        return derived == self.password_hash

    @property
    def redacted(self) -> "RedactedUser":
        return RedactedUser(
            id=self.id,
            username=self.username,
            display_name=self.display_name,
            profile_image=self.profile_image,
        )

    @property
    def sessions(self) -> list[Session]:
        return Session.load_query(self.database, {"user": self.id})

    def notify(self, context, event_subtype: str, data: dict):
        context.post_event(
            [i.id for i in self.sessions], f"user.{event_subtype}", event_data=data
        )

    def notify_self(self, context, event_subtype: str, data: dict):
        context.post_event(
            [i.id for i in self.sessions], f"user.{self.id}.{event_subtype}", event_data=data
        )


@dataclass
class UserCreationModel:
    username: str
    password: str


@dataclass
class RedactedUser:
    id: str
    username: str
    display_name: str
    profile_image: str

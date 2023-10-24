from pymongo.database import Database
from util.orm import Record
from dataclasses import dataclass
from hashlib import pbkdf2_hmac
from secrets import token_hex

ITERS = 200000

@dataclass
class User(Record):
    collection_name = "users"
    username: str
    password_hash: str
    password_salt: str

    @classmethod
    def derive(cls, password: str, salt: str) -> str:
        return pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), ITERS).hex()

    @classmethod
    def create(cls, database: Database, username: str, password: str) -> "User":
        salt = token_hex(32)
        key = cls.derive(password, salt)
        created = User(
            id=cls._id(),
            database=database,
            username=username,
            password_hash=key,
            password_salt=salt
        )
        created.save()
        return created
    
    def check(self, password: str) -> bool:
        derived = self.derive(password, self.password_salt)
        return derived == self.password_hash
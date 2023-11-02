from dataclasses import dataclass
from typing import ClassVar, Union, Any
from pymongo.collection import Collection
from pymongo.database import Database
from uuid import uuid4
from .context import Context

@dataclass
class Record:
    collection_name: ClassVar[str] = None
    id: str
    database: Database

    @classmethod
    def _id(cls) -> str:
        return uuid4().hex

    @classmethod
    def create(cls, database: Database, *args, **kwargs) -> "Record":
        raise NotImplementedError
    
    @classmethod
    def load_id(cls, database: Database, id: str) -> Union["Record", None]:
        collection = database[cls.collection_name]
        result = collection.find_one({"id": id})
        if result:
            return cls(database=database, **{k:v for k, v in result.items() if k != "_id"})
        else:
            return None
        
    @classmethod
    def load_query(cls, database: Database, query: dict) -> list["Record"]:
        collection = database[cls.collection_name]
        result = collection.find(query)
        return [cls(database=database, **{k:v for k, v in r.items() if k != "_id"}) for r in result]
    
    @classmethod
    def deserialize(cls, database: Database, data: dict) -> "Record":
        return Record(database=database, **data)
    
    @property
    def collection(self) -> Collection:
        return self.database[self.collection_name]
    
    @property
    def json(self) -> dict:
        return {k:v for k, v in self.__dict__.items() if not k in ["database", "_id"]}
    
    def save(self):
        self.collection.replace_one({"id": self.id}, {k:v for k, v in self.__dict__.items() if not k in ["database", "_id"]}, upsert=True)
    
    def destroy(self):
        self.collection.delete_one({"id": self.id})

    def notify(self, context: Context, event_subtype: str, data: dict):
        raise NotImplementedError()

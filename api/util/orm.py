from dataclasses import dataclass
from typing import ClassVar, Union
from pymongo.collection import Collection
from pymongo.database import Database
from uuid import uuid4

@dataclass
class Record:
    collection_name: ClassVar[str] = None
    type: str
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
            return cls(database=database, **result)
        else:
            return None
        
    @classmethod
    def load_query(cls, database: Database, query: dict) -> list["Record"]:
        collection = database[cls.collection_name]
        result = collection.find(query)
        return [cls(database=database, **r) for r in result]
    
    @classmethod
    def deserialize(cls, database: Database, data: dict) -> "Record":
        return Record(database=database, **data)
    
    @property
    def collection(self) -> Collection:
        return self.database[self.collection_name]
    
    def serialize(self) -> dict:
        return {k:v for k, v in self.__dict__.items() if not k in ["database"]}
    
    def save(self):
        self.collection.update_one({"id": self.id}, self.serialize(), upsert=True)
    
    def destroy(self):
        self.collection.delete_one({"id": self.id})

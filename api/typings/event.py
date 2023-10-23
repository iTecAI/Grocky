from dataclasses import dataclass
from typing_extensions import TypedDict
from typing import Literal, Any
from uuid import uuid4

class EventTarget(TypedDict):
    type: Literal["user", "session", "group"]
    id: str

class EventPacket(TypedDict):
    id: str
    type: str
    data: Any

@dataclass
class Event:
    id: str
    type: str
    targets: list[EventTarget]
    data: Any

    @classmethod
    def create(cls, type: str, targets: list[EventTarget], data: Any = None) -> "Event":
        return Event(uuid4().hex, type, targets, data)
    
    @property
    def packet(self) -> EventPacket:
        return {
            "id": self.id,
            "type": self.type,
            "data": self.data
        }
from dataclasses import dataclass
from datetime import datetime
from util.orm import Record
from util.time_conversions import Time
from .auth import Session, User
from open_groceries import GroceryItem
from typing import Literal, Union
from typing_extensions import TypedDict


@dataclass
class Group(Record):
    collection_name = "groups"
    name: str
    description: str
    owner: str
    members: list[str]

    @property
    def users(self) -> list[User]:
        results: list[User] = User.load_query(
            self.database, {"$or": [{"id": {"$in": self.members}}, {"id": self.owner}]}
        )
        return results

    @property
    def lists(self) -> list["GrockyList"]:
        results: list[GrockyList] = GrockyList.load_query(
            self.database, {"owned_by.type": "group", "owned_by.id": self.id}
        )
        return results

    @property
    def sessions(self) -> list[Session]:
        return Session.load_query(
            self.database, {"user": {"$in": [i.id for i in self.users]}}
        )

    def notify(self, context, event_subtype: str, data: dict):
        context.post_event(
            [i.id for i in self.sessions], f"group.{event_subtype}", event_data=data
        )

    def notify_self(self, context, event: str, data: dict):
        context.post_event(
            [i.id for i in self.sessions], f"group.{self.id}.{event}", event_data=data
        )


class OwnerDescriptor(TypedDict):
    type: Literal["group", "user"]
    id: str


@dataclass
class LinkedGroceryItem:
    item: GroceryItem
    last_update: datetime
    linked: bool

    def update(self, context):
        try:
            result = context.groceries.adapter(self.item.type).get_grocery_item(
                self.item.id
            )
            self.item = result
            self.linked = True
        except:
            self.linked = False

        self.last_update = Time().utc


@dataclass
class ListItem(Record):
    collection_name = "lists_items"
    type: Literal["general"]
    added_by: str
    checked: bool
    list_id: str
    parent_id: Union[str, None]
    image: Union[str, None]
    title: str
    notes: str

    @property
    def author(self) -> User:
        return User.load_id(self.database, self.added_by)

    @property
    def parent(self) -> Union[None, "ListItem"]:
        return (
            ListItem.load_id(self.database, self.parent_id) if self.parent_id else None
        )

    @property
    def children(self) -> list["ListItem"]:
        return ListItem.load_query(self.database, {"parent_id": self.id})


@dataclass
class GroceryListItem(ListItem):
    type: Literal["grocery"]
    linked: Union[None, LinkedGroceryItem]
    quantity: datetime

    @property
    def alternative_to(self) -> Union[None, "GroceryListItem"]:
        return self.parent

    @property
    def alternatives(self) -> list["GroceryListItem"]:
        return self.children


@dataclass
class TaskListItem(ListItem):
    type: Literal["task"]
    assigned_to: list[str]
    deadline: Union[float, None]

    @property
    def assignees(self) -> list[User]:
        return User.load_query(self.database, {"id": {"$in": self.assigned_to}})

@dataclass
class AssembledList:
    id: str
    name: str
    description: str
    owner_type: Literal["group", "user"]
    owner: Union[Group, User]
    type: Literal["grocery", "task", "general"]
    options: dict
    items: list[Union[ListItem, GroceryListItem, TaskListItem]]

@dataclass
class GrockyList(Record):
    collection_name = "lists"
    name: str
    description: str
    owned_by: OwnerDescriptor
    type: Literal["grocery", "task", "general"]
    options: dict

    @property
    def owner(self) -> Union[Group, User]:
        if self.owned_by["type"] == "group":
            return Group.load_id(self.database, self.owned_by["id"])
        return User.load_id(self.database, self.owned_by["id"])

    @property
    def sessions(self) -> list[Session]:
        return self.owner.sessions
    
    @property
    def users(self) -> list[User]:
        if self.owned_by["type"] == "group":
            return self.owner.users
        return [self.owner]

    @property
    def items(self) -> list[Union[ListItem, GroceryListItem, TaskListItem]]:
        match self.type:
            case "general":
                return ListItem.load_query(
                    self.database, {"list_id": self.id, "parent_id": None}
                )
            case "grocery":
                return GroceryListItem.load_query(
                    self.database, {"list_id": self.id, "parent_id": None}
                )
            case "task":
                return TaskListItem.load_query(
                    self.database, {"list_id": self.id, "parent_id": None}
                )

    def notify(self, context, event_subtype: str, data: dict):
        context.post_event(
            [i.id for i in self.sessions], f"list.{event_subtype}", event_data=data
        )

    @property
    def assembled(self) -> AssembledList:
        return AssembledList(
            id=self.id,
            name=self.name,
            description=self.description,
            owner_type=self.owned_by["type"],
            owner=self.owner,
            type=self.type,
            options=self.options,
            items=self.items
        )

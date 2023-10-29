from dataclasses import dataclass
from util import Record, Context
from .user import User, RedactedUser
from open_groceries import GroceryItem
from typing import Literal, Union
from typing_extensions import TypedDict
from time import time

@dataclass
class Group(Record):
    collection_name = "groups"
    name: str
    description: str
    owner: str
    members: list[str]

    @property
    def users(self) -> list[RedactedUser]:
        results: list[User] = User.load_query(self.database, {"id": {"$in": self.members}})
        return [u.redacted for u in results]
    
    @property
    def lists(self) -> list["GrocyList"]:
        results: list[GrocyList] = GrocyList.load_query(self.database, {"owned_by.type": "group", "owned_by.id": self.id})
        return results
    
@dataclass
class GroupMessage(Record):
    collection_name = "groups_messages"
    group_id: str
    time: float
    author_id: str
    content: str

    @property
    def group(self) -> Group:
        return Group.load_id(self.database, self.group_id)
    
    @property
    def author(self) -> User:
        return User.load_id(self.database, self.author_id)

class OwnerDescriptor(TypedDict):
    type: Literal["group", "user"]
    id: str

@dataclass
class LinkedGroceryItem:
    item: GroceryItem
    last_update: float
    linked: bool

    def update(self, context: Context):
        try:
            result = context.groceries.adapter(self.item.type).get_grocery_item(self.item.id)
            self.item = result
            self.linked = True
        except:
            self.linked = False
        
        self.last_update = time()

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
        return ListItem.load_id(self.database, self.parent_id) if self.parent_id else None
    
    @property
    def children(self) -> list["ListItem"]:
        return ListItem.load_query(self.database, {"parent_id": self.id})

@dataclass
class GroceryListItem(ListItem):
    type: Literal["grocery"]
    linked: Union[None, LinkedGroceryItem]

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
class GrocyList(Record):
    collection_name = "lists"
    name: str
    description: str
    owned_by: OwnerDescriptor
    type: Literal["grocery", "task", "general"]

    @property
    def owner(self) -> Union[Group, User]:
        if self.owned_by["type"] == "group":
            return Group.load_id(self.database, self.owned_by["id"])
        return User.load_id(self.database, self.owned_by["id"])
    
    @property
    def items(self) -> list[Union[ListItem, GroceryListItem, TaskListItem]]:
        match self.type:
            case "general":
                return ListItem.load_query(self.database, {"list_id": self.id, "parent_id": None})
            case "grocery":
                return GroceryListItem.load_query(self.database, {"list_id": self.id, "parent_id": None})
            case "task":
                return TaskListItem.load_query(self.database, {"list_id": self.id, "parent_id": None})
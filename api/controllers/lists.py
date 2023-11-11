from litestar import Controller, get, post
from litestar.di import Provide
from util import (
    Context,
    guard_logged_in,
    guard_session,
    depends_session,
    depends_user,
    ApiException,
    Time,
)
from models import (
    GrockyList,
    TaskListItem,
    GroceryListItem,
    ListItem,
    OwnerDescriptor,
    User,
    AssembledList,
    LinkedGroceryItem,
)
from dataclasses import dataclass
from typing import Optional, Union, Literal
from open_groceries import GroceryItem
import requests


@dataclass
class ListCreationModel:
    name: str
    description: str
    type: str
    owner: OwnerDescriptor
    options: Optional[dict]


@dataclass
class GroceryItemCreationModel:
    type: Literal["grocery"]
    name: str
    linked: Optional[dict]
    quantity: int
    price: float
    location: Optional[str]
    categories: list[str]
    parent: Optional[str] = None


@dataclass
class GeneralItemCreationModel:
    type: Literal["general"]
    name: str
    notes: str
    parent: Optional[str] = None


async def depends_list(list_id: str, context: Context, user: User) -> GrockyList:
    load_attempt: GrockyList = GrockyList.load_id(context.database, list_id)
    if not load_attempt:
        raise ApiException("list.not_found", status_code=404)

    if not user.id in [i.id for i in load_attempt.users]:
        raise ApiException("list.not_found", status_code=404)

    return load_attempt


class ListsController(Controller):
    path = "/lists"
    guards = [guard_logged_in, guard_logged_in]
    dependencies = {"user": Provide(depends_user)}

    @post("/")
    async def create_list(
        self, data: ListCreationModel, context: Context
    ) -> GrockyList:
        new_list = GrockyList(
            id=GrockyList._id(),
            database=context.database,
            name=data.name,
            description=data.description,
            owned_by=data.owner,
            type=data.type,
            options=data.options,
        )
        new_list.save()
        new_list.notify(context, "update", data={"reason": "list_creation"})
        new_list.owner.notify_self(context, "lists", data={"reason": "list_creation"})
        return new_list.json

    @get("/for/user")
    async def get_user_lists(self, context: Context, user: User) -> list[GrockyList]:
        lists: list[GrockyList] = GrockyList.load_query(
            context.database, {"owned_by": {"type": "user", "id": user.id}}
        )
        return [i.json for i in lists]

    @get("/{list_id:str}", dependencies={"list_item": Provide(depends_list)})
    async def get_list(self, list_item: GrockyList) -> AssembledList:
        return list_item.assembled

    @get("/{list_id:str}/items", dependencies={"list_item": Provide(depends_list)})
    async def get_list_items(
        self, list_item: GrockyList
    ) -> list[Union[TaskListItem, GroceryListItem, ListItem]]:
        return [i.json for i in list_item.items]

    @post(
        "/{list_id:str}/items/grocery",
        dependencies={"list_item": Provide(depends_list)},
    )
    async def add_grocery_item(
        self,
        context: Context,
        user: User,
        list_item: GrockyList,
        data: GroceryItemCreationModel,
    ) -> list[Union[TaskListItem, GroceryListItem, ListItem]]:
        if data.linked:
            data.linked = GroceryItem(**data.linked)
        item_id = GroceryListItem._id()
        if data.linked and len(data.linked.images) > 0:
            img = requests.get(data.linked.images[0])
            if img.ok:
                context.store_object(
                    f"lists.images.{item_id}",
                    img.content,
                    mime=img.headers.get("Content-Type", "application/octet-stream"),
                )
            image = f"/storage/lists/images/{item_id}"
        else:
            image = None

        new_item = GroceryListItem(
            id=item_id,
            database=context.database,
            type="grocery",
            added_by=user.id,
            checked=False,
            list_id=list_item.id,
            parent_id=data.parent,
            image=image,
            title=data.name,
            notes="",
            linked=LinkedGroceryItem(
                item=data.linked, last_update=Time().utc, linked=True
            )
            if data.linked
            else None,
            quantity=data.quantity,
            price=data.price,
            categories=data.categories,
            location=data.location,
        )

        new_item.save()
        list_item.notify_self(context, "update", {"reason": "item.added"})
        return [i.json for i in list_item.items]

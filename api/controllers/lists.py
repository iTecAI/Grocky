from litestar import Controller, get, post
from litestar.di import Provide
from util import (
    Context,
    guard_logged_in,
    guard_session,
    depends_session,
    depends_user,
    ApiException,
)
from models import (
    GrockyList,
    TaskListItem,
    GroceryListItem,
    ListItem,
    OwnerDescriptor,
    User,
    AssembledList,
)
from dataclasses import dataclass
from typing import Optional, Union


@dataclass
class ListCreationModel:
    name: str
    description: str
    type: str
    owner: OwnerDescriptor
    options: Optional[dict]


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

from litestar.controller import Controller
from litestar import get, post, delete
from litestar.params import Parameter
from litestar.status_codes import *
from litestar.di import Provide
from util import Context, ApiException, guard_session, guard_logged_in, depends_user
from models import User, Group, RedactedUser, GrockyList
from typing import Annotated, Optional
import time
from dataclasses import dataclass


async def depends_group(id: str, context: Context) -> Group:
    result = Group.load_id(context.database, id)
    if result:
        return result
    raise ApiException("groups.not_found", status_code=404)


@dataclass
class GroupCreationModel:
    name: str
    desc: str
    members: list[str]


class GroupsController(Controller):
    path = "/groups"
    guards = [guard_session, guard_logged_in]
    dependencies = {"user": Provide(depends_user)}

    @post("/")
    async def create_group(
        self, context: Context, user: User, data: GroupCreationModel
    ) -> Group:
        new_group = Group(
            id=Group._id(),
            database=context.database,
            name=data.name,
            description=data.desc,
            owner=user.id,
            members=data.members,
        )
        new_group.save()
        new_group.notify(context, "update", data={"reason": "group_creation"})
        return new_group.json

    @get("/")
    async def get_user_groups(self, context: Context, user: User) -> list[Group]:
        results = Group.load_query(
            context.database, {"$or": [{"owner": user.id}, {"members": user.id}]}
        )
        return [r.json for r in results]

    @get("/{id:str}", dependencies={"group": Provide(depends_group)})
    async def get_group(self, group: Group, user: User) -> Group:
        if not user.id in [*group.members, group.owner]:
            raise ApiException("group.not_found", status_code=404)
        return group.json

    @get("/{id:str}/users", dependencies={"group": Provide(depends_group)})
    async def get_group_users(self, group: Group, user: User) -> list[RedactedUser]:
        if not user.id in [*group.members, group.owner]:
            raise ApiException("group.not_found", status_code=404)
        return [u.redacted for u in group.users]

    @get("/{id:str}/lists", dependencies={"group": Provide(depends_group)})
    async def get_group_lists(self, group: Group, user: User) -> list[GrockyList]:
        if not user.id in [*group.members, group.owner]:
            raise ApiException("group.not_found", status_code=404)
        return [l.json for l in group.lists]

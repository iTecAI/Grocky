from litestar.controller import Controller
from litestar import get, post, delete
from litestar.params import Parameter
from litestar.status_codes import *
from litestar.di import Provide
from util import Context, ApiException, guard_session, guard_logged_in, depends_user
from models import User, Group
from typing import Annotated, Optional
import time
from dataclasses import dataclass

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
    async def create_group(self, context: Context, user: User, data: GroupCreationModel) -> Group:
        new_group = Group(id=Group._id(), database=context.database, name=data.name, description=data.desc, owner=user.id, members=data.members)
        new_group.save()
        return new_group.json

    @get("/")
    async def get_user_groups(self, context: Context, user: User) -> list[Group]:
        results = Group.load_query(context.database, {"$or": [{"owner": user.id}, {"members": user.id}]})
        return [r.json for r in results]
from litestar import Controller, get, post, delete
from litestar.di import Provide
from util import (
    guard_logged_in,
    guard_session,
    depends_user,
    depends_session,
    Context,
    ApiException,
)
from models import RedactedUser, User, Session
from dataclasses import dataclass
from secrets import token_hex


@dataclass
class PasswordChangeModel:
    current: str
    new: str


class UserController(Controller):
    path = "/user"
    guards = [guard_logged_in, guard_session]
    dependencies = {"session": Provide(depends_session), "user": Provide(depends_user)}

    @get("/")
    async def get_self(self, user: User) -> RedactedUser:
        return user.redacted

    @get("/{id:str}")
    async def get_user(self, id: str, context: Context) -> RedactedUser:
        result: User = User.load_id(context.database, id)
        if not result:
            raise ApiException("users.not_found", status_code=404)
        return result.redacted

    @post("/settings")
    async def update_user_settings(
        self, user: User, data: dict, context: Context
    ) -> RedactedUser:
        resolved_updates = RedactedUser(
            id=user.id,
            username=data.get("username", user.username),
            display_name=data.get("display_name", user.display_name),
            profile_image=data.get("profile_image", user.profile_image),
        )

        if resolved_updates.username != user.username:
            existence_check = User.load_query(
                context.database, {"username": resolved_updates.username}
            )
            if len(existence_check) != 0:
                raise ApiException("users.self.update.username_exists", status_code=405)

            if len(resolved_updates.username) < 4:
                raise ApiException("users.self.update.username_length", status_code=400)

        if (
            resolved_updates.display_name != user.display_name
            and len(resolved_updates.display_name) == 0
        ):
            raise ApiException("users.self.update.display_name_length", status_code=400)

        user.username = resolved_updates.username
        user.display_name = resolved_updates.display_name
        user.profile_image = resolved_updates.profile_image
        user.save()
        return user.redacted

    @post("/password")
    async def change_user_password(
        self, user: User, data: PasswordChangeModel
    ) -> RedactedUser:
        if not user.check(data.current):
            raise ApiException("users.self.password.invalid", status_code=401)

        new_salt = token_hex(32)
        new_password = user.derive(data.new, new_salt)
        user.password_hash = new_password
        user.password_salt = new_salt
        user.save()
        return user.redacted

    @get("/search")
    async def search_users(
        self, user: User, q: str, context: Context
    ) -> list[RedactedUser]:
        if len(q) == 0:
            raise ApiException("users.search.query", status_code=400)
        return [
            i.redacted
            for i in User.load_query(
                context.database,
                {
                    "$or": [
                        {"username": {"$regex": q, "$options": "i"}},
                        {"display_name": {"$regex": q, "$options": "i"}},
                    ]
                },
            )
        ]

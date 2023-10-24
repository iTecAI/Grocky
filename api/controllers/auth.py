from litestar.controller import Controller
from litestar import get, post, delete
from litestar.params import Parameter
from litestar.status_codes import *
from litestar.di import Provide
from util import Context, ApiException, guard_session, depends_session, guard_logged_in
from models import Session, User, UserCreationModel, RedactedUser, SessionModel
from typing import Annotated, Optional
import time


class AuthController(Controller):
    path = "/auth"

    @get(path="/session")
    async def get_session(
        self,
        context: Context,
        authorization: Annotated[
            Optional[str], Parameter(header="Authorization")
        ] = None,
    ) -> SessionModel:
        if authorization:
            result: Session = Session.load_id(context.database, authorization)
            if result:
                if (
                    result.last_request + context.options.security.session_timeout
                    < time.time()
                ):
                    result.destroy()
                    return Session.create(context.database).json
                else:
                    result.last_request = time.time()
                    return result.json
            else:
                return Session.create(context.database).json
        else:
            return Session.create(context.database).json

    @post(
        path="/user/create",
        guards=[guard_session],
        dependencies={"session": Provide(depends_session)},
    )
    async def create_user(
        self, context: Context, data: UserCreationModel, session: Session
    ) -> RedactedUser:
        exists = User.load_query(context.database, {"username": data.username})
        if len(exists) != 0:
            raise ApiException(
                error_code="auth.account.creation.exists",
                status_code=HTTP_405_METHOD_NOT_ALLOWED,
            )
        new_user = User.create(context.database, data.username, data.password)
        session.user = new_user.id
        session.save()
        return new_user.redacted

    @post(
        path="/login",
        guards=[guard_session],
        dependencies={"session": Provide(depends_session)},
    )
    async def login(
        self, context: Context, data: UserCreationModel, session: Session
    ) -> RedactedUser:
        users: list[User] = User.load_query(
            context.database, {"username": data.username}
        )
        if len(users) == 0:
            raise ApiException(
                error_code="auth.account.invalid", status_code=HTTP_404_NOT_FOUND
            )

        valid_password = users[0].check(data.password)
        if not valid_password:
            raise ApiException(
                error_code="auth.account.invalid", status_code=HTTP_404_NOT_FOUND
            )

        session.user = users[0].id
        session.save()
        return users[0].redacted
    
    @delete("/login", guards=[guard_logged_in], dependencies={"session": Provide(depends_session)},)
    async def logout(self, context: Context, session: Session) -> None:
        session.user = None
        session.save()
        return None

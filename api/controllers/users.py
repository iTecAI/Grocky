from litestar import Controller, get, post, delete
from litestar.di import Provide
from util import guard_logged_in, guard_session, depends_user, depends_session, Context
from models import RedactedUser, User, Session

class UserController(Controller):
    path = "/user"
    guards = [guard_logged_in, guard_session]
    dependencies = {"session": Provide(depends_session), "user": Provide(depends_user)}

    @get("/")
    async def get_self(self, session: Session, user: User) -> RedactedUser:
        return user.redacted
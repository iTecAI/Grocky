from litestar.controller import Controller
from litestar import get, post
from litestar.params import Parameter
from util import Context
from models import Session
from typing import Annotated, Optional

class AuthController(Controller):
    path = "/auth"

    @get(path="/session")
    async def get_session(self, context: Context, authorization: Annotated[Optional[str], Parameter(header="Authorization")] = None) -> Session:
        if authorization:
            pass
        else:
            return Session.create(context.database).json

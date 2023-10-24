from litestar.controller import Controller
from litestar import get, post
from litestar.params import Parameter
from util import Context, ApiException
from models import Session
from typing import Annotated, Optional
import time

class AuthController(Controller):
    path = "/auth"

    @get(path="/session")
    async def get_session(self, context: Context, authorization: Annotated[Optional[str], Parameter(header="Authorization")] = None) -> Session:
        if authorization:
            result: Session = Session.load_id(context.database, authorization)
            if result:
                if result.last_request + context.options.security.session_timeout < time.time():
                    result.destroy()
                    return Session.create(context.database).json
                else:
                    result.last_request = time.time()
                    return result.json
            else:
                return Session.create(context.database).json
        else:
            return Session.create(context.database).json

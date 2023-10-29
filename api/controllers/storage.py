from litestar.controller import Controller
from litestar import get, post, delete
from litestar.params import Parameter
from litestar.status_codes import *
from litestar.di import Provide
from util import Context, ApiException, guard_session, depends_session, guard_logged_in, depends_user
from dataclasses import dataclass

class StorageController(Controller):
    path = "/storage"
    guards = [guard_session, guard_logged_in]
    dependencies = {"session": Provide(depends_session), "user": Provide(depends_user)}
from litestar import Litestar, Request, Response, get
from litestar.datastructures import State
from litestar.di import Provide
from util import Context, ApiException, EndpointFilter
from controllers import *
from litestar.status_codes import *
from time import ctime
import logging

logging.getLogger("uvicorn.access").addFilter(EndpointFilter(["/"]))

async def dep_context(state: State) -> Context:
    return state.context

def server_exception_handler(req: Request, exc: Exception) -> Response:
    """Default handler for exceptions subclassed from HTTPException."""
    status_code = getattr(exc, "status_code", HTTP_500_INTERNAL_SERVER_ERROR)
    detail = getattr(exc, "detail", "")
    req.app.logger.exception("Encountered server error:\n")

    return Response(
        content={
            "code": "error.server.unspecified",
            "data": {
                "detail": detail
            }
        },
        status_code=status_code,
    )

def api_exception_handler(req: Request, exc: ApiException) -> Response:
    status_code = getattr(exc, "status_code", HTTP_500_INTERNAL_SERVER_ERROR)
    req.app.logger.warning(f"Handled error: {exc.error_code}")

    return Response(
        content={
            "code": exc.error_code,
            "data": exc.error_data
        },
        status_code=status_code,
    )

@get("/")
async def get_root(context: Context) -> dict:
    return {
        "server_time": ctime()
    }

context = Context()

app = Litestar(
    route_handlers=[
        get_root,
        AuthController,
        StorageController,
        UserController,
        GroupsController,
        EventsController
    ],
    state=State({"context": context}),
    dependencies={"context": Provide(dep_context)},
    exception_handlers={
        500: server_exception_handler,
        ApiException: api_exception_handler
    }
)

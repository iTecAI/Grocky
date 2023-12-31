from litestar import Litestar, Request, Response, get
from litestar.datastructures import State
from litestar.di import Provide
from litestar.channels import ChannelsPlugin
from litestar.channels.backends.memory import MemoryChannelsBackend
from litestar.config.cors import CORSConfig
from util import Context, ApiException, EndpointFilter, ErrorFilter, Time
from controllers import *
from litestar.status_codes import *
import logging

logging.getLogger("uvicorn.access").addFilter(EndpointFilter(["/"]))
logging.getLogger("uvicorn.error").addFilter(ErrorFilter())


async def dep_context(state: State) -> Context:
    return state.context


def server_exception_handler(req: Request, exc: Exception) -> Response:
    """Default handler for exceptions subclassed from HTTPException."""
    status_code = getattr(exc, "status_code", HTTP_500_INTERNAL_SERVER_ERROR)
    detail = getattr(exc, "detail", str(exc))
    req.app.logger.exception("Encountered server error:\n")

    return Response(
        content={"code": "error.server.unspecified", "data": {"detail": detail}},
        status_code=status_code,
    )


def api_exception_handler(req: Request, exc: ApiException) -> Response:
    status_code = getattr(exc, "status_code", HTTP_500_INTERNAL_SERVER_ERROR)
    req.app.logger.warning(f"Handled error: {exc.error_code}")

    return Response(
        content={"code": exc.error_code, "data": exc.error_data},
        status_code=status_code,
    )


def ws_exception_handler(req: Request, exc: Exception) -> Response:
    """Default handler for exceptions subclassed from HTTPException."""
    status_code = getattr(exc, "status_code", HTTP_500_INTERNAL_SERVER_ERROR)
    detail = getattr(exc, "detail", "")

    return Response(
        content={"code": "error.server.unspecified", "data": {"detail": detail}},
        status_code=status_code,
    )


@get("/")
async def get_root() -> dict:
    return {"server_time": Time().utc}


channels_plugin = ChannelsPlugin(
    backend=MemoryChannelsBackend(),
    arbitrary_channels_allowed=True,
    ws_handler_base_path="/events",
    create_ws_route_handlers=True,
    ws_handler_send_history=5,
)

context = Context(channels_plugin)

app = Litestar(
    route_handlers=[
        get_root,
        AuthController,
        StorageController,
        UserController,
        GroupsController,
        ListsController,
        GroceryController,
    ],
    state=State({"context": context}),
    dependencies={"context": Provide(dep_context)},
    exception_handlers={
        500: server_exception_handler,
        ApiException: api_exception_handler,
    },
    plugins=[channels_plugin],
    cors_config=CORSConfig(allow_origins=["*"]),
)

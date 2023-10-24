from litestar import Litestar, MediaType, Request, Response, get
from litestar.datastructures import State
from litestar.di import Provide
from util import Context
from controllers import *
from litestar.status_codes import *
from time import ctime


async def dep_context(state: State) -> Context:
    return state.context

def plain_text_exception_handler(req: Request, exc: Exception) -> Response:
    """Default handler for exceptions subclassed from HTTPException."""
    status_code = getattr(exc, "status_code", HTTP_500_INTERNAL_SERVER_ERROR)
    detail = getattr(exc, "detail", "")
    req.app.logger.exception("Encountered server error:\n")

    return Response(
        media_type=MediaType.TEXT,
        content=detail,
        status_code=status_code,
    )

@get("/")
async def get_root() -> dict:
    return {
        "server_time": ctime()
    }

app = Litestar(
    route_handlers=[
        get_root,
        AuthController
    ],
    state=State({"context": Context()}),
    dependencies={"context": Provide(dep_context)},
    exception_handlers={
        500: plain_text_exception_handler
    }
)

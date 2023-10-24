from typing import Annotated
from litestar.params import Parameter
from .context import Context
from models import Session


async def depends_session(
    context: Context, token: Annotated[str, Parameter(header="Authorization")]
) -> Session:
    return Session.load_id(context.database, token)

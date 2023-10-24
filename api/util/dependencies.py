from typing import Annotated, Optional
from litestar.params import Parameter
from .context import Context
from models import Session, User


async def depends_session(
    context: Context, token: Annotated[str, Parameter(header="Authorization")]
) -> Session:
    return Session.load_id(context.database, token)

async def depends_user(
    context: Context, token: Annotated[str, Parameter(header="Authorization")]
) -> Optional[User]:
    session: Session = Session.load_id(context.database, token)
    return session.user_data

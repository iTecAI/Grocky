from models import Session
from litestar.connection import ASGIConnection
from litestar.handlers import BaseRouteHandler
from litestar.status_codes import *
from util import ApiException, Context

def guard_session(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    context: Context = connection.app.state.context
    token = connection.headers.get("Authorization")
    if not token:
        raise ApiException(error_code="auth.session.not_present", status_code=HTTP_403_FORBIDDEN)
    result = Session.load_id(context.database, token)
    if not result:
        raise ApiException(error_code="auth.session.invalid", status_code=HTTP_401_UNAUTHORIZED)
    valid = context.check_session(result)
    if not valid:
        raise ApiException(error_code="auth.session.invalid", status_code=HTTP_401_UNAUTHORIZED)
    
def guard_logged_in(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    context: Context = connection.app.state.context
    token = connection.headers.get("Authorization")
    if not token:
        raise ApiException(error_code="auth.session.not_present", status_code=HTTP_403_FORBIDDEN)
    result: Session = Session.load_id(context.database, token)
    if not result:
        raise ApiException(error_code="auth.session.invalid", status_code=HTTP_401_UNAUTHORIZED)
    valid = context.check_session(result)
    if not valid:
        raise ApiException(error_code="auth.session.invalid", status_code=HTTP_401_UNAUTHORIZED)
    
    if not result.user:
        raise ApiException(error_code="auth.session.logged_out", status_code=HTTP_401_UNAUTHORIZED)
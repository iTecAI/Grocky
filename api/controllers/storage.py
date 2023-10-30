from litestar.controller import Controller
from litestar import get, post, delete
from litestar.params import Parameter
from litestar.status_codes import *
from litestar.di import Provide
from litestar.response import Response
from util import (
    Context,
    ApiException,
    guard_session,
    depends_session,
    guard_logged_in,
    depends_user,
)
from models import Session, User
from dataclasses import dataclass
from typing import Optional, Any, Literal
from urllib.request import DataHandler, urlopen
from typing_extensions import TypedDict
import json


class ObjectRestriction(TypedDict):
    type: Literal["user", "group", "list"]
    id: str


@dataclass
class NewStoredObjectModel:
    data_url: str
    additional_tags: Optional[dict[str, Any]]
    restrict: Optional[list[ObjectRestriction]]


@dataclass
class StoredObjectReference:
    path: str


class StorageController(Controller):
    path = "/storage"

    @post(
        "/{object_path:path}",
        guards=[guard_session, guard_logged_in],
        dependencies={
            "session": Provide(depends_session),
            "user": Provide(depends_user),
        },
    )
    async def put_object(
        self,
        object_path: str,
        context: Context,
        session: Session,
        user: User,
        data: NewStoredObjectModel,
    ) -> StoredObjectReference:
        if not data.data_url.startswith("data:"):
            raise ApiException(
                error_code="storage.invalid_uri",
                error_data={"uri": data.data_url},
                status_code=400,
            )
        
        # TODO: Restriction impl.

        normalized_path = ".".join(object_path.strip("/").lower().split("/"))
        data_request = urlopen(data.data_url)
        decoded_data = data_request.read()

        context.store_object(
            normalized_path,
            decoded_data,
            mime=data_request.info().get_content_type(),
            tags=dict(
                tags=json.dumps(getattr(data, "restrict", [])),
                owner=user.id,
                **getattr(data, "additional_tags", {})
            ),
        )

        return StoredObjectReference(
            path=f"/storage/{object_path}"
        )

    @get("/{object_path:path}")
    async def get_object(self, object_path: str, context: Context) -> Response:
        normalized_path = ".".join(object_path.strip("/").lower().split("/"))
        try:
            data, mime_type = context.get_object(normalized_path)
            return Response(
                data,
                media_type=mime_type
            )
        except:
            raise ApiException(error_code="storage.not_found", status_code=404)
        
    @delete("/{object_path:path}", 
            guards=[guard_session, guard_logged_in],
        dependencies={
            "session": Provide(depends_session),
            "user": Provide(depends_user),
        })
    async def remove_object(self, context: Context, object_path: str) -> None:
        normalized_path = ".".join(object_path.strip("/").lower().split("/"))

        # TODO: Restriction impl.

        try:
            context.delete_object(normalized_path)
            return None
        except:
            raise ApiException(error_code="storage.not_found", status_code=404)

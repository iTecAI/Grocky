from litestar import Controller, get, Request
from litestar.di import Provide
from litestar.response import Stream
from litestar.serialization import encode_json
from models import Event, EventPacket, EventTarget, Session
from util import Context, guard_session, depends_session
from collections.abc import AsyncGenerator
from asyncio import Queue

HANDLE_RESET = 100

async def event_generator(context: Context, session: Session, request: Request) -> AsyncGenerator[bytes, None]:
    if not session.id in context.event_queues.keys():
        context.event_queues[session.id] = Queue()
    handled_count = 0

    while handled_count <= HANDLE_RESET:
        next_event: Event = await context.event_queues[session.id].get()
        yield encode_json(next_event.packet) + b"\n"
        handled_count += 1

    if not request.is_connected:
        del context.event_queues[session.id]


class EventsController(Controller):
    path = "/events"
    guards = [guard_session]
    dependencies = {"session": Provide(depends_session)}

    @get("/")
    async def get_event_stream(self, context: Context, session: Session, request: Request) -> Stream:
        return Stream(event_generator(context, session, request))
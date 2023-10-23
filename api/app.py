from litestar import Litestar
from litestar.datastructures import State
from litestar.di import Provide
from util import Context


async def dep_context(state: State) -> Context:
    return state.context


app = Litestar(
    route_handlers=[],
    state=State({"context": Context()}),
    dependencies={"context": Provide(dep_context)},
)

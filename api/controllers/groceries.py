from litestar import Controller, get
from util import Context
from typing import Optional
from open_groceries import GroceryItem


class GroceryController(Controller):
    path = "/groceries"

    @get("/search")
    async def search_groceries(
        self,
        context: Context,
        search: str,
        location: Optional[str] = None,
        stores: Optional[str] = None,
    ) -> list[GroceryItem]:
        _location = location if location else context.options.groceries.default_location
        _stores = stores.split(",") if stores else context.options.groceries.stores

        async with context.get_grocery_worker(location=_location) as grocery:
            return grocery.search(search, include=_stores)

    @get("/auto")
    async def autocomplete_groceries(
        self,
        context: Context,
        search: str,
        location: Optional[str] = None,
        stores: Optional[str] = None,
    ) -> list[str]:
        _location = location if location else context.options.groceries.default_location
        _stores = stores.split(",") if stores else context.options.groceries.stores

        async with context.get_grocery_worker(location=_location) as grocery:
            return grocery.suggest(search, include=_stores)

    @get("/item/{store:str}/{item:str}")
    async def get_item_data(
        self, context: Context, store: str, item: str
    ) -> Optional[GroceryItem]:
        async with context.get_grocery_worker() as grocery:
            try:
                return grocery.adapter(store).get_grocery_item(item)
            except:
                return None

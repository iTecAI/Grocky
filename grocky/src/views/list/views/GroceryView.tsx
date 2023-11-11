import { useCallback, useState } from "react";
import { GroceryListItemType, ListType } from "../../../types/list";
import { ViewingInfo } from "../util";
import { ViewLayout } from "./ViewLayout";

/*
const [viewing, setViewing] = useState<ViewingInfo | null>(null);

const view = useCallback((item: GroceryListItemType) => setViewing({
    data: item,
    body: <></>,
    onClose: () => setViewing(null)
}), []);
*/

export function GroceryView({
    list,
    items,
}: {
    list: ListType;
    items: GroceryListItemType[];
}) {
    const [viewing, setViewing] = useState<ViewingInfo | null>(null);

    const view = useCallback(
        (item: GroceryListItemType) =>
            setViewing({
                data: item,
                body: <></>,
                onClose: () => setViewing(null),
            }),
        [],
    );

    return (
        <ViewLayout list={list} items={items} viewing={viewing}></ViewLayout>
    );
}

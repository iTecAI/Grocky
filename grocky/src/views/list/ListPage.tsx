import { useParams } from "react-router-dom";
import { useApi } from "../../util/api";
import { useCallback, useEffect, useState } from "react";
import {
    GeneralListItemType,
    GroceryListItemType,
    ListItem,
    ListType,
    TaskListItemType,
} from "../../types/list";
import { useServerEvent } from "../../util/events";
import { GeneralView } from "./views/GeneralView";
import { GroceryView } from "./views/GroceryView";
import { TaskView } from "./views/TaskView";
import { Divider, Group, Stack, Text } from "@mantine/core";
import { MdCheckBox, MdListAlt, MdShoppingBag } from "react-icons/md";

function ListSubView({
    list,
    items,
}: {
    list: ListType | null;
    items: ListItem[];
}) {
    if (list) {
        switch (list.type) {
            case "general":
                return (
                    <GeneralView
                        list={list}
                        items={items as GeneralListItemType[]}
                    />
                );
            case "grocery":
                return (
                    <GroceryView
                        list={list}
                        items={items as GroceryListItemType[]}
                    />
                );
            case "task":
                return (
                    <TaskView list={list} items={items as TaskListItemType[]} />
                );
        }
    } else {
        return <></>;
    }
}

export function ListPage() {
    const { listId } = useParams();
    const { lists } = useApi();

    const [list, setList] = useState<ListType | null>(null);
    const [items, setItems] = useState<ListItem[]>([]);

    const loadData = useCallback(() => {
        if (listId) {
            lists.get_list_by_id(listId).then(setList);
            lists.get_list_items(listId).then(setItems);
        }
    }, [listId]);

    useServerEvent("list.update", loadData);
    useServerEvent(`list.${listId ?? "null"}.update`, loadData);

    useEffect(() => loadData(), [listId]);

    return (
        <Stack gap="sm" style={{ height: "100%" }}>
            <Group
                gap="sm"
                style={{
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    overflow: "hidden",
                    flexFlow: "row",
                }}
            >
                {list &&
                    (list.type === "general" ? (
                        <MdListAlt size="1.3em" />
                    ) : list.type === "grocery" ? (
                        <MdShoppingBag size="1.3em" />
                    ) : list.type === "task" ? (
                        <MdCheckBox size="1.3em" />
                    ) : (
                        <></>
                    ))}
                <Text fw={500} style={{ display: "inline-block" }}>
                    {list?.name}
                </Text>
                <Divider
                    orientation="vertical"
                    style={{ display: "inline-block" }}
                />
                <Text
                    c="dimmed"
                    style={{
                        flexGrow: 1,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                        overflow: "hidden",
                    }}
                >
                    {list?.description}
                </Text>
            </Group>
            <Divider />
            <ListSubView list={list} items={items} />
        </Stack>
    );
}

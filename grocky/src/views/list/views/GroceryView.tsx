import { memo, useCallback, useState } from "react";
import { GroceryListItemType, ListType } from "../../../types/list";
import { ViewingInfo } from "../util";
import { ViewLayout } from "./ViewLayout";
import {
    ActionIcon,
    Divider,
    Paper,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { MdAdd, MdSearch } from "react-icons/md";
import { useTranslation } from "react-i18next";

/*
const [viewing, setViewing] = useState<ViewingInfo | null>(null);

const view = useCallback((item: GroceryListItemType) => setViewing({
    data: item,
    body: <></>,
    onClose: () => setViewing(null)
}), []);
*/

const RenderedGroceryItem = memo(
    ({
        view,
        item,
    }: {
        view: (item: GroceryListItemType) => void;
        item: GroceryListItemType;
    }) => {
        return (
            <Paper
                p="sm"
                radius="sm"
                shadow="sm"
                className="list-item grocery"
            ></Paper>
        );
    },
);

export function GroceryView({
    list,
    items,
}: {
    list: ListType;
    items: GroceryListItemType[];
}) {
    const [viewing, setViewing] = useState<ViewingInfo | null>(null);
    const [search, setSearch] = useInputState("");
    const { t } = useTranslation();

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
        <ViewLayout list={list} items={items} viewing={viewing}>
            <Stack
                gap="sm"
                style={{ width: "100%", height: "calc(100% - 24px)" }}
                className="body-root"
            >
                <TextInput
                    value={search}
                    onChange={setSearch}
                    leftSection={<MdSearch size="1.5em" />}
                    size="lg"
                    placeholder={t("views.list.common.search")}
                />
                <Paper
                    withBorder
                    p="sm"
                    style={{ flexGrow: 1, overflow: "auto" }}
                    className="item-list"
                >
                    <Stack gap="sm"></Stack>
                </Paper>
                <ActionIcon size="xl" radius="xl" className="new-item-btn">
                    <MdAdd size="1.5em" />
                </ActionIcon>
            </Stack>
        </ViewLayout>
    );
}

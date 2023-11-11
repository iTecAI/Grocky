import { memo, useCallback, useEffect, useState } from "react";
import {
    GroceryItem,
    GroceryListItemType,
    ListType,
} from "../../../types/list";
import { ViewingInfo } from "../util";
import { ViewLayout } from "./ViewLayout";
import {
    ActionIcon,
    Autocomplete,
    Avatar,
    Center,
    Divider,
    Fieldset,
    Group,
    Loader,
    Paper,
    Space,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useDebouncedValue, useInputState } from "@mantine/hooks";
import { MdAdd, MdSearch, MdShoppingBag } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { openModal } from "@mantine/modals";
import { useApi, useUser } from "../../../util/api";
import { useForm } from "@mantine/form";
import { startCase } from "lodash";

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

const NewGroceryItemModal = memo(({ list }: { list: ListType }) => {
    const [user] = useUser();
    const { groceries } = useApi();

    const form = useForm<{
        name: string;
        linkedItem: null | GroceryItem;
    }>({
        initialValues: {
            name: "",
            linkedItem: null,
        },
    });

    const [debouncedSearch] = useDebouncedValue(form.values.name, 250);
    const [debouncedForSuggestion] = useDebouncedValue(form.values.name, 750);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [results, setResults] = useState<GroceryItem[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        if (debouncedSearch.length > 1) {
            groceries
                .suggest(
                    debouncedSearch,
                    "Rochester Institute of Technology",
                    list.options.stores,
                )
                .then(setSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [debouncedSearch]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (debouncedForSuggestion.length > 2) {
            setLoading(true);
            groceries
                .search(
                    debouncedSearch,
                    "Rochester Institute of Technology",
                    list.options.stores,
                )
                .then((result) => {
                    setResults(result);
                    setLoading(false);
                });
        } else {
            setResults([]);
        }
    }, [debouncedForSuggestion]);

    const ItemResult = useCallback(
        ({
            item,
            onTrigger,
        }: {
            item: GroceryItem;
            onTrigger: (item: GroceryItem | null) => void;
        }) => {
            return (
                <Paper
                    className="grocery-item-result"
                    p="sm"
                    bg="dark"
                    style={{
                        border:
                            form.values.linkedItem &&
                            item.id === form.values.linkedItem.id
                                ? "1px solid var(--mantine-color-grape-filled)"
                                : undefined,
                        cursor: "pointer",
                        display: "inline-block",
                        maxWidth: "100%",
                    }}
                    onClick={() =>
                        onTrigger(
                            form.values.linkedItem &&
                                item.id === form.values.linkedItem.id
                                ? null
                                : item,
                        )
                    }
                >
                    <Group
                        justify="space-between"
                        gap="sm"
                        style={{ maxWidth: "100%" }}
                    >
                        <Group
                            gap="sm"
                            style={{
                                flexDirection: "row",
                                whiteSpace: "nowrap",
                                maxWidth: "100%",
                                flexGrow: 1,
                            }}
                        >
                            {item.images.length > 0 ? (
                                <Avatar
                                    size="md"
                                    radius="sm"
                                    src={item.images[0]}
                                />
                            ) : (
                                <Avatar size="md" radius="sm">
                                    <MdShoppingBag />
                                </Avatar>
                            )}
                            <Stack
                                gap={2}
                                style={{ maxWidth: "calc(100% - 64px)" }}
                            >
                                <Text
                                    style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: "100%",
                                    }}
                                >
                                    {startCase(item.name)}
                                </Text>
                                <Text
                                    size="sm"
                                    style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: "100%",
                                    }}
                                    c="dimmed"
                                >
                                    {startCase(item.type)}
                                </Text>
                            </Stack>
                        </Group>
                    </Group>
                </Paper>
            );
        },
        [form.values.linkedItem],
    );

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Stack gap="sm">
                <Autocomplete
                    label={t("views.list.groceries.create.name.label")}
                    placeholder={t(
                        "views.list.groceries.create.name.placeholder",
                    )}
                    leftSection={<MdShoppingBag />}
                    limit={5}
                    data={suggestions}
                    {...form.getInputProps("name")}
                />
                {(form.values.linkedItem || results.length > 0) && (
                    <Paper
                        withBorder
                        p="sm"
                        style={{
                            maxHeight: "384px",
                            overflow: "auto",
                            maxWidth: "100%",
                        }}
                    >
                        <Stack gap="sm">
                            {form.values.linkedItem && (
                                <>
                                    <ItemResult
                                        item={form.values.linkedItem}
                                        onTrigger={(value) => {
                                            form.setFieldValue(
                                                "linkedItem",
                                                value,
                                            );
                                            if (value) {
                                                form.setFieldValue(
                                                    "name",
                                                    startCase(value.name),
                                                );
                                            }
                                        }}
                                    />
                                    <Divider />
                                </>
                            )}
                            {loading ? (
                                <Center h="128px" w="100%">
                                    <Loader />
                                </Center>
                            ) : (
                                results.map((item) => (
                                    <ItemResult
                                        item={item}
                                        onTrigger={(value) => {
                                            form.setFieldValue(
                                                "linkedItem",
                                                value,
                                            );
                                            if (value) {
                                                form.setFieldValue(
                                                    "name",
                                                    startCase(value.name),
                                                );
                                            }
                                        }}
                                        key={item.id}
                                    />
                                ))
                            )}
                        </Stack>
                    </Paper>
                )}
            </Stack>
        </form>
    );
});

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
                <ActionIcon
                    size="xl"
                    radius="xl"
                    className="new-item-btn"
                    onClick={() =>
                        openModal({
                            title: t("views.list.groceries.create.title"),
                            children: <NewGroceryItemModal list={list} />,
                        })
                    }
                >
                    <MdAdd size="1.5em" />
                </ActionIcon>
            </Stack>
        </ViewLayout>
    );
}

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
    Button,
    Center,
    Divider,
    Group,
    Loader,
    NumberInput,
    Paper,
    SimpleGrid,
    Stack,
    TagsInput,
    Text,
    TextInput,
} from "@mantine/core";
import { useDebouncedValue, useInputState } from "@mantine/hooks";
import {
    MdAdd,
    MdAttachMoney,
    MdCancel,
    MdCategory,
    MdCheck,
    MdLocationPin,
    MdNumbers,
    MdSearch,
    MdShoppingBag,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import { closeAllModals, openModal } from "@mantine/modals";
import { useApi } from "../../../util/api";
import { useForm } from "@mantine/form";
import { isString, startCase } from "lodash";

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
    const { groceries, lists } = useApi();

    const formValues = useForm<{
        name: string;
        linkedItem: null | GroceryItem;
        quantity: number;
        price: number;
        location: string;
        categories: string[];
    }>({
        initialValues: {
            name: "",
            linkedItem: null,
            quantity: 1,
            price: 0,
            location: "",
            categories: [],
        },
    });

    const [debouncedSearch] = useDebouncedValue(formValues.values.name, 250);
    const [debouncedForSuggestion] = useDebouncedValue(
        formValues.values.name,
        750,
    );

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
                            formValues.values.linkedItem &&
                            item.id === formValues.values.linkedItem.id
                                ? "1px solid var(--mantine-color-grape-filled)"
                                : undefined,
                        cursor: "pointer",
                        display: "inline-block",
                        maxWidth: "100%",
                    }}
                    onClick={() =>
                        onTrigger(
                            formValues.values.linkedItem &&
                                item.id === formValues.values.linkedItem.id
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
        [formValues.values.linkedItem],
    );

    return (
        <form
            onSubmit={formValues.onSubmit((values) =>
                lists
                    .create_item(list.id, {
                        type: "grocery",
                        name: values.name,
                        linked: values.linkedItem,
                        quantity: isString(values.quantity)
                            ? 0
                            : values.quantity,
                        price: isString(values.price) ? 0 : values.price,
                        location:
                            values.location.length === 0
                                ? null
                                : values.location,
                        categories: values.categories,
                        parent: null,
                    })
                    .then(() => {}),
            )}
        >
            <Stack gap="sm">
                <Autocomplete
                    label={t("views.list.groceries.create.name.label")}
                    placeholder={t(
                        "views.list.groceries.create.name.placeholder",
                    )}
                    leftSection={<MdShoppingBag />}
                    limit={5}
                    data={suggestions}
                    {...formValues.getInputProps("name")}
                />
                {(formValues.values.linkedItem || results.length > 0) && (
                    <Paper
                        withBorder
                        p="sm"
                        style={{
                            maxHeight: "50vh",
                            overflow: "auto",
                            maxWidth: "100%",
                        }}
                    >
                        <Stack gap="sm">
                            {formValues.values.linkedItem && (
                                <>
                                    <ItemResult
                                        item={formValues.values.linkedItem}
                                        onTrigger={(value) => {
                                            formValues.setFieldValue(
                                                "linkedItem",
                                                value,
                                            );
                                            if (value) {
                                                formValues.setValues({
                                                    name: startCase(value.name),
                                                    price: value.price,
                                                    categories:
                                                        value.categories,
                                                    location:
                                                        value.location ?? "",
                                                });
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
                                results.map((item, i) => (
                                    <ItemResult
                                        item={item}
                                        onTrigger={(value) => {
                                            formValues.setFieldValue(
                                                "linkedItem",
                                                value,
                                            );
                                            if (value) {
                                                formValues.setValues({
                                                    name: startCase(value.name),
                                                    price: value.price,
                                                    categories:
                                                        value.categories,
                                                    location:
                                                        value.location ?? "",
                                                });
                                            }
                                        }}
                                        key={i}
                                    />
                                ))
                            )}
                        </Stack>
                    </Paper>
                )}
                <SimpleGrid
                    cols={{ base: 1, lg: 3 }}
                    spacing="sm"
                    verticalSpacing="sm"
                >
                    <NumberInput
                        label={t("views.list.groceries.create.quantity")}
                        allowNegative={false}
                        allowDecimal={false}
                        allowLeadingZeros={false}
                        leftSection={<MdNumbers />}
                        {...formValues.getInputProps("quantity")}
                    />
                    <NumberInput
                        label={t("views.list.groceries.create.price")}
                        allowNegative={false}
                        leftSection={<MdAttachMoney />}
                        prefix="$"
                        decimalScale={2}
                        {...formValues.getInputProps("price")}
                    />

                    <TextInput
                        label={t("views.list.groceries.create.aisle")}
                        leftSection={<MdLocationPin />}
                        {...formValues.getInputProps("location")}
                    />
                </SimpleGrid>
                <TagsInput
                    label={t("views.list.groceries.create.categories")}
                    leftSection={<MdCategory />}
                    {...formValues.getInputProps("categories")}
                />
                <Group gap="sm" justify="space-between">
                    <Button
                        color="red"
                        variant="subtle"
                        leftSection={<MdCancel size="1.3em" />}
                        justify="space-between"
                        onClick={() => closeAllModals()}
                    >
                        {t("common.actions.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        leftSection={<MdCheck size="1.3em" />}
                        justify="space-between"
                    >
                        {t("common.actions.submit")}
                    </Button>
                </Group>
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
                            size: "xl",
                        })
                    }
                >
                    <MdAdd size="1.5em" />
                </ActionIcon>
            </Stack>
        </ViewLayout>
    );
}

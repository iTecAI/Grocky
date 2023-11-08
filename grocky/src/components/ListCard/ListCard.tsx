import { Card, Stack, Group, Paper, Text } from "@mantine/core";
import { memo, useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MdList, MdShoppingBag, MdCheckBox } from "react-icons/md";
import {
    ListType,
    GroceryListItemType,
    TaskListItemType,
    ListItem,
} from "../../types/list";
import { useApi } from "../../util/api";

export const ListCard = memo(({ list }: { list: ListType }) => {
    const { t } = useTranslation();
    const { lists } = useApi();
    const IconElement = useMemo(() => {
        switch (list.type) {
            case "general":
                return MdList;
            case "grocery":
                return MdShoppingBag;
            case "task":
                return MdCheckBox;
        }
    }, [list.type]);

    const [items, setItems] = useState<ListItem[]>([]);

    useEffect(() => {
        lists.get_list_items(list.id).then(setItems);
    }, [list.id]);

    return (
        <Card className="grocky-item list" withBorder>
            <Stack gap="sm" className="item-layout">
                <Group gap="sm" justify="space-between">
                    <IconElement size="1.8em" />
                    <Text size="lg" fw={500} className="item-title">
                        {list.name}
                    </Text>
                </Group>
                <Paper p="sm" className="item-desc">
                    {list.description.length === 0 ? (
                        <Text fs="italic" c="dimmed">
                            {t("views.home.items.list.no_description")}
                        </Text>
                    ) : (
                        <Text>{list.description}</Text>
                    )}
                </Paper>
                <Paper p="sm">
                    <Group gap="sm" justify="space-between">
                        <Text fw={600}>{t("views.home.items.list.items")}</Text>
                        <Text c="dimmed">
                            {items.filter((l) => !l.checked).length} /{" "}
                            {items.length}
                        </Text>
                    </Group>
                </Paper>
                {list.type === "grocery" && (
                    <Paper p="sm">
                        <Group gap="sm" justify="space-between">
                            <Text fw={600}>
                                {t("views.home.items.list.budget")}
                            </Text>
                            <Text c="dimmed">
                                {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 2,
                                }).format(
                                    (items as GroceryListItemType[]).reduce(
                                        (prev, curr) =>
                                            prev +
                                            (curr.linked?.item?.price ?? 0),
                                        0,
                                    ),
                                )}
                            </Text>
                        </Group>
                    </Paper>
                )}
                {list.type === "task" && (
                    <Paper p="sm">
                        <Group gap="sm" justify="space-between">
                            <Text fw={600}>
                                {t("views.home.items.list.taskUpcoming")}
                            </Text>
                            {items.length > 0 ? (
                                <Text c="dimmed">
                                    {
                                        (items as TaskListItemType[])
                                            .filter(
                                                (v) =>
                                                    !v.checked &&
                                                    v.deadline &&
                                                    new Date(v.deadline) >=
                                                        new Date(Date.now()),
                                            )
                                            .sort(
                                                (a, b) =>
                                                    (a.deadline ?? 0) -
                                                    (b.deadline ?? 0),
                                            )[0].title
                                    }
                                </Text>
                            ) : (
                                <Text c="dimmed">
                                    {t("views.home.items.list.noTask")}
                                </Text>
                            )}
                        </Group>
                    </Paper>
                )}
            </Stack>
        </Card>
    );
});

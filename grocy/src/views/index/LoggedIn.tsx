import {
    Avatar,
    Box,
    Card,
    Divider,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { MdGroup, MdGroupAdd, MdList, MdSearch } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useModals } from "../modals";
import { memo, useCallback, useEffect, useState } from "react";
import { GroupType, isGroupType } from "../../types/group";
import { useApi, useUser } from "../../util/api";
import { useServerEvent } from "../../util/events";
import { ListType } from "../../types/list";
import { User } from "../../types/auth";

const GroupCard = memo(({ group }: { group: GroupType }) => {
    const { t } = useTranslation();
    const { groups } = useApi();
    const [user] = useUser();

    const [users, setUsers] = useState<User[]>([]);
    const [lists, setLists] = useState<ListType[]>([]);

    useEffect(() => {
        groups.get_group_users(group.id).then(setUsers);
        groups.get_group_lists(group.id).then(setLists);
    }, [group.id]);

    return (
        <Card className="grocy-item group" withBorder>
            <Stack gap="sm" className="item-layout">
                <Group gap="sm" justify="space-between">
                    <MdGroup
                        size="1.8em"
                        color={
                            user?.id === group.owner ? "goldenrod" : undefined
                        }
                    />
                    <Text size="lg" fw={500} className="item-title">
                        {group.name}
                    </Text>
                </Group>
                <Paper p="sm" className="item-desc">
                    {group.description.length === 0 ? (
                        <Text fs="italic" c="dimmed">
                            {t("views.home.items.group.no_description")}
                        </Text>
                    ) : (
                        <Text>{group.description}</Text>
                    )}
                </Paper>
                <Paper p="sm">
                    <Group gap="sm" justify="space-between">
                        <Text fw={600}>
                            {t("views.home.items.group.users")}
                        </Text>
                        <Avatar.Group spacing="md">
                            {users.map((user) => (
                                <Avatar
                                    src={user.profile_image}
                                    key={user.id}
                                />
                            ))}
                        </Avatar.Group>
                    </Group>
                </Paper>
                <Paper p="sm">
                    <Group gap="sm" justify="space-between">
                        <Text fw={600}>
                            {t("views.home.items.group.lists")}
                        </Text>
                        <Text c="dimmed">{lists.length}</Text>
                    </Group>
                </Paper>
            </Stack>
        </Card>
    );
});

export function IndexLoggedIn() {
    const { t } = useTranslation();
    const { createGroup } = useModals();
    const [search, setSearch] = useState("");
    const { groups } = useApi();
    const loadItems = useCallback(async () => {
        const results: (GroupType | ListType)[] = [];
        results.push(...(await groups.get_groups()));

        return results;
    }, []);

    const [userItems, setUserItems] = useState<(GroupType | ListType)[]>([]);
    const groupsListener = useCallback(
        () => loadItems().then(setUserItems),
        [],
    );

    useServerEvent("groups.list_update", groupsListener);

    useEffect(() => {
        loadItems().then(setUserItems);
    }, []);

    return (
        <Stack gap="sm">
            <TextInput
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
                placeholder={t("views.home.actions.search")}
                leftSection={<MdSearch size="1.3em" />}
                variant="filled"
                size="lg"
            />
            <Divider />
            <SimpleGrid
                className="index-main"
                cols={{
                    base: 1,
                    sm: 2,
                    md: 4,
                    xl: 6,
                }}
            >
                {userItems
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .filter((v) => v.name.match(new RegExp(search, "i")))
                    .map((item) =>
                        isGroupType(item) ? (
                            <GroupCard group={item} key={item.id} />
                        ) : (
                            <></>
                        ),
                    )}
                <Card className="grocy-item create" withBorder>
                    <Box className="creation-button list">
                        <MdList size="1.5em" />
                        <Text className="button-title">
                            {t("views.home.items.create.list")}
                        </Text>
                    </Box>
                    <Box
                        className="creation-button group"
                        onClick={() => createGroup()}
                    >
                        <MdGroupAdd size="1.5em" />
                        <Text className="button-title">
                            {t("views.home.items.create.group")}
                        </Text>
                    </Box>
                </Card>
            </SimpleGrid>
        </Stack>
    );
}

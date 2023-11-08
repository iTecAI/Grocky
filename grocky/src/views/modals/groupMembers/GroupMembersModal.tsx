import { ContextModalProps } from "@mantine/modals";
import { useState, useCallback, useEffect } from "react";
import { User } from "../../../types/auth";
import { GroupType } from "../../../types/group";
import { useServerEvent } from "../../../util/events";
import { useApi, useReady, useSession } from "../../../util/api";
import { ActionIcon, Avatar, Group, Paper, Select, Stack } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { MdAccountCircle, MdAdd } from "react-icons/md";

function MemberCard({
    group,
    user,
    mode,
}: {
    group: GroupType;
    user: User;
    mode: "display" | "result";
}) {
    return <Paper p="sm" radius="sm" shadow="md" className="user-item"></Paper>;
}

export function GroupMembersModal({
    innerProps,
}: ContextModalProps<{ group: string }>) {
    const [members, setMembers] = useState<User[]>([]);
    const [groupData, setGroupData] = useState<GroupType | null>(null);
    const ready = useReady();
    const session = useSession();
    const { groups, user } = useApi();
    const { t } = useTranslation();

    const loadData = useCallback(async () => {
        setGroupData(
            innerProps.group ? await groups.get_group(innerProps.group) : null,
        );
    }, [innerProps.group]);

    const loadMembers = useCallback(async () => {
        setMembers(
            innerProps.group
                ? await groups.get_group_users(innerProps.group)
                : [],
        );
    }, [innerProps.group]);

    useEffect(() => {
        if (ready && innerProps.group && session) {
            loadData();
            loadMembers();
        }
    }, [ready, session, innerProps.group]);

    useServerEvent(`group.${innerProps.group ?? "null"}.changed`, loadData);
    useServerEvent(`group.${innerProps.group ?? "null"}.users`, loadMembers);
    const [search, setSearch] = useState("");
    const [searchDebounce] = useDebouncedValue(search, 250);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedUserObj, setSelectedUserObj] = useState<User | null>(null);

    useEffect(() => {
        if (selectedUser) {
            user.get(selectedUser).then(setSelectedUserObj);
        } else {
            setSelectedUserObj(null);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (searchDebounce.length > 0) {
            user.searchUsers(searchDebounce).then(setSearchResults);
        } else {
            setSearchResults([]);
        }
    }, [searchDebounce]);

    return groupData ? (
        <Stack gap="sm">
            <Group gap="sm">
                <Select
                    label={t("modals.groupMembers.search")}
                    leftSection={
                        selectedUserObj ? (
                            <Avatar
                                size="xs"
                                src={selectedUserObj.profile_image}
                            />
                        ) : (
                            <MdAccountCircle />
                        )
                    }
                    searchable
                    clearable
                    onSearchChange={setSearch}
                    searchValue={search}
                    onChange={setSelectedUser}
                    value={JSON.stringify(selectedUser)}
                    data={searchResults
                        .filter(
                            (v) =>
                                !groupData.members.includes(v.id) &&
                                groupData.owner !== v.id,
                        )
                        .map((r) => ({
                            value: r.id,
                            label: r.display_name,
                        }))}
                    style={{
                        flexGrow: 1,
                    }}
                />
                <ActionIcon
                    size="lg"
                    style={{
                        marginTop: "auto",
                        marginBottom: "1px",
                    }}
                    variant="subtle"
                >
                    <MdAdd size="1.3em" />
                </ActionIcon>
            </Group>
        </Stack>
    ) : (
        <></>
    );
}

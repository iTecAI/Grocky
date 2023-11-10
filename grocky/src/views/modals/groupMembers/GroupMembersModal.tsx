import {
    ContextModalProps,
    closeAllModals,
    openConfirmModal,
} from "@mantine/modals";
import { useState, useCallback, useEffect } from "react";
import { User } from "../../../types/auth";
import { GroupType } from "../../../types/group";
import { useServerEvent } from "../../../util/events";
import { useApi, useReady, useSession } from "../../../util/api";
import {
    ActionIcon,
    Avatar,
    Group,
    Paper,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { MdAccountCircle, MdAdd, MdClose, MdStar } from "react-icons/md";
import { PillSelect } from "../../../components/PillSelection/PillSelectionInput";

function MemberCard({ group, user }: { group: GroupType; user: User }) {
    const { t } = useTranslation();
    const { groups } = useApi();
    return (
        <Paper p="sm" radius="sm" shadow="md" bg="dark" className="user-item">
            <Group gap="sm" justify="space-between">
                <Group gap="sm">
                    <Avatar size="sm" src={user.profile_image} />
                    <Text>{user.display_name}</Text>
                </Group>
                {user.id === group.owner ? (
                    <Tooltip
                        label={t("modals.groupMembers.member.tooltip.owner")}
                        c="white"
                        bg="dark"
                    >
                        <ActionIcon
                            c="yellow"
                            radius="xl"
                            variant="transparent"
                            disabled
                            style={{ cursor: "default" }}
                        >
                            <MdStar color="goldenrod" size="1.3em" />
                        </ActionIcon>
                    </Tooltip>
                ) : (
                    <Group gap="sm">
                        <Tooltip
                            label={t(
                                "modals.groupMembers.member.tooltip.owner_set",
                            )}
                            c="white"
                            bg="dark"
                        >
                            <ActionIcon
                                radius="xl"
                                variant="subtle"
                                onClick={() =>
                                    openConfirmModal({
                                        title: t(
                                            "modals.groupMembers.member.confirmOwner.title",
                                        ),
                                        children: (
                                            <Text size="sm">
                                                {t(
                                                    "modals.groupMembers.member.confirmOwner.message",
                                                    { name: user.display_name },
                                                )}
                                            </Text>
                                        ),
                                        labels: {
                                            confirm: t("common.confirm"),
                                            cancel: t("common.actions.cancel"),
                                        },
                                        onConfirm: () =>
                                            groups
                                                .change_owner(group.id, user.id)
                                                .then(() => closeAllModals()),
                                    })
                                }
                            >
                                <MdStar size="1.3em" />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip
                            label={t(
                                "modals.groupMembers.member.tooltip.remove",
                            )}
                            c="white"
                            bg="dark"
                        >
                            <ActionIcon radius="xl" variant="subtle">
                                <MdClose size="1.3em" />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                )}
            </Group>
        </Paper>
    );
}

export function GroupMembersModal({
    innerProps,
}: ContextModalProps<{ group: string }>) {
    const [members, setMembers] = useState<User[]>([]);
    const [groupData, setGroupData] = useState<GroupType | null>(null);
    const ready = useReady();
    const session = useSession();
    const { groups, user } = useApi();

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
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

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
                <PillSelect
                    data={searchResults
                        .filter(
                            (v) =>
                                !groupData.members.includes(v.id) &&
                                groupData.owner !== v.id,
                        )
                        .map((r) => ({
                            value: r.id,
                            text: r.display_name,
                            icon: r.profile_image ?? undefined,
                        }))}
                    value={selectedUserIds}
                    onChange={setSelectedUserIds}
                    search={search}
                    onSearchChange={setSearch}
                    inputProps={{
                        leftSection: <MdAccountCircle />,
                        style: {
                            flexGrow: 1,
                        },
                    }}
                />
                <ActionIcon
                    size="lg"
                    style={{
                        marginTop: "auto",
                        marginBottom: "1px",
                    }}
                    variant="subtle"
                    onClick={() => {
                        if (selectedUserIds.length > 0) {
                            groups
                                .add_members(innerProps.group, selectedUserIds)
                                .then(() => {
                                    setSearch("");
                                    setSelectedUserIds([]);
                                });
                        }
                    }}
                >
                    <MdAdd size="1.3em" />
                </ActionIcon>
            </Group>
            <Stack gap="sm">
                {members.map((user) => (
                    <MemberCard key={user.id} user={user} group={groupData} />
                ))}
            </Stack>
        </Stack>
    ) : (
        <></>
    );
}

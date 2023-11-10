import { ContextModalProps } from "@mantine/modals";
import { useState, useCallback, useEffect } from "react";
import { User } from "../../../types/auth";
import { GroupType } from "../../../types/group";
import { useReady, useSession, useApi } from "../../../util/api";
import { useServerEvent } from "../../../util/events";
import {
    ActionIcon,
    Avatar,
    Group,
    Paper,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { MdStar } from "react-icons/md";

function MemberCard({ group, user }: { group: GroupType; user: User }) {
    const { t } = useTranslation();
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
                    <></>
                )}
            </Group>
        </Paper>
    );
}

export function GroupInfoModal({
    innerProps,
}: ContextModalProps<{ group: string }>) {
    const [members, setMembers] = useState<User[]>([]);
    const [groupData, setGroupData] = useState<GroupType | null>(null);
    const ready = useReady();
    const session = useSession();
    const { groups } = useApi();

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

    return groupData ? (
        <Stack gap="md">
            <Paper p="sm" bg="dark">
                <Stack gap="sm">
                    <Text fw={600}>{groupData.name}</Text>
                    <Text c="dimmed">{groupData.description}</Text>
                </Stack>
            </Paper>
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

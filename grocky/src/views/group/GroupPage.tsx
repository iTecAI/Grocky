import { useParams } from "react-router-dom";
import { useServerEvent } from "../../util/events";
import { useApi, useReady, useSession } from "../../util/api";
import { useCallback, useEffect, useState } from "react";
import { ListType } from "../../types/list";
import { User } from "../../types/auth";
import { GroupType } from "../../types/group";
import { Loader } from "@mantine/core";
import "./groups.scss";

export function GroupPage() {
    const { groupId } = useParams();
    const { groups } = useApi();
    const ready = useReady();
    const session = useSession();

    const [lists, setLists] = useState<ListType[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [group, setGroup] = useState<GroupType | null>(null);

    const loadData = useCallback(async () => {
        setGroup(groupId ? await groups.get_group(groupId) : null);
    }, [groupId]);

    const loadLists = useCallback(async () => {
        setLists(groupId ? await groups.get_group_lists(groupId) : []);
    }, [groupId]);

    const loadMembers = useCallback(async () => {
        setMembers(groupId ? await groups.get_group_users(groupId) : []);
    }, [groupId]);

    useEffect(() => {
        if (ready && groupId && session) {
            loadData();
            loadLists();
            loadMembers();
        }
    }, [ready, session, groupId]);

    useServerEvent(`group.${groupId ?? "null"}.changed`, loadData);
    useServerEvent(`group.${groupId ?? "null"}.lists`, loadLists);
    useServerEvent(`group.${groupId ?? "null"}.users`, loadMembers);
    return group && groupId ? (
        <></>
    ) : (
        <Loader className="group-loader" size="lg" />
    );
}

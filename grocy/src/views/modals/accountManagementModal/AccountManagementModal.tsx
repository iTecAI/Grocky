import { ContextModalProps } from "@mantine/modals";
import { useApi, useUser } from "../../../util/api";
import { Loader, Stack, TextInput } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { User } from "../../../types/auth";
import { isString } from "lodash";
import { useTranslation } from "react-i18next";
import { MdPerson } from "react-icons/md";

export function AccountManagementModal({
    context,
    id,
}: ContextModalProps<Record<string, never>>) {
    const { user } = useApi();
    const { t } = useTranslation();

    const [userData, setUserData] = useState<User | null>(null);
    const [fields, setFields] = useState<{ [key: string]: any }>({});
    useEffect(() => setFields(userData ?? {}), [userData]);
    const canSave = useMemo(
        () =>
            userData
                ? Object.keys(userData).filter(
                      (v) => fields[v] !== userData[v as keyof User],
                  )
                : false,
        [userData, fields],
    );

    useEffect(() => {
        user.self().then((value) =>
            isString(value) ? context.closeModal(id) : setUserData(value),
        );
    }, []);

    return userData ? (
        <Stack gap="sm" className="account-management-modal modal" p="sm">
            <TextInput
                label={t("modals.manageAccount.fields.display_name")}
                value={fields.display_name}
                onChange={(ev) =>
                    setFields((f) => ({ ...f, display_name: ev.target.value }))
                }
                leftSection={<MdPerson />}
            />
        </Stack>
    ) : (
        <Loader />
    );
}

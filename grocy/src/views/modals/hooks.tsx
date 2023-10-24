import { Group } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MdCreate, MdLogin } from "react-icons/md";
import { MODALS } from "./util";

export function useModals(): {
    [key in keyof typeof MODALS]: (options?: any) => any;
} {
    const { t } = useTranslation();

    return useMemo(
        () => ({
            login: () =>
                modals.openContextModal({
                    modal: "login",
                    title: (
                        <Group className="modal-title" justify="space-between">
                            <MdLogin size="1.2em" />
                            {t("modals.login.title")}
                        </Group>
                    ),
                    innerProps: {},
                }),
            createAccount: () =>
                modals.openContextModal({
                    modal: "createAccount",
                    title: (
                        <Group className="modal-title" justify="space-between">
                            <MdCreate size="1.2em" />
                            {t("modals.createAccount.title")}
                        </Group>
                    ),
                    innerProps: {},
                }),
        }),
        [],
    );
}

import { Group } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MdCreate, MdLogin, MdSettings } from "react-icons/md";
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
            manageAccount: () =>
                modals.openContextModal({
                    modal: "manageAccount",
                    title: (
                        <Group className="modal-title" justify="space-between">
                            <MdSettings size="1.2em" />
                            {t("modals.manageAccount.title")}
                        </Group>
                    ),
                    innerProps: {},
                }),
            createGroup: () =>
                modals.openContextModal({
                    modal: "createGroup",
                    title: (
                        <Group className="modal-title" justify="space-between">
                            <MdCreate size="1.2em" />
                            {t("modals.createGroup.title")}
                        </Group>
                    ),
                    innerProps: {},
                }),
        }),
        [],
    );
}

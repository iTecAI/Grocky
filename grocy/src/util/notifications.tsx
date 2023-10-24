import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { MdCheck, MdError, MdInfo, MdWarning } from "react-icons/md";

export function useNotifications(): {
    success: (message: string) => void;
    warning: (message: string) => void;
    error: (message: string, isApi?: boolean) => void;
    info: (message: string) => void;
} {
    const { t } = useTranslation();

    return {
        success(message) {
            notifications.show({
                color: "green",
                title: t("common.notifications.success"),
                message,
                icon: <MdCheck size={"1.4em"} />,
            });
        },
        warning(message) {
            notifications.show({
                color: "orange",
                title: t("common.notifications.warning"),
                message,
                icon: <MdWarning size={"1.4em"} />,
            });
        },
        error(message, isApi?: boolean) {
            notifications.show({
                color: "red",
                title: t("common.notifications.error"),
                message: isApi ? t(`errors.api.${message}`) : message,
                icon: <MdError size={"1.4em"} />,
            });
        },
        info(message) {
            notifications.show({
                color: "cyan",
                title: t("common.notifications.info"),
                message,
                icon: <MdInfo size={"1.4em"} />,
            });
        },
    };
}

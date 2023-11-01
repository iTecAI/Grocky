import { Stack, Paper, Button, Image, Text, Group } from "@mantine/core";
import { ReactNode } from "react";
import {
    MdPriceCheck,
    MdGroup,
    MdAttachMoney,
    MdLogin,
    MdCreate,
} from "react-icons/md";
import { useModals } from "../modals";
import { useTranslation } from "react-i18next";
import AppIcon from "../../assets/icon.png";

function IndexItem({
    name,
    title,
    icon,
    flipped,
}: {
    name: string;
    title: string;
    icon: ReactNode;
    flipped?: boolean;
}) {
    return (
        <Paper
            className={"index-item feature " + name}
            radius="md"
            shadow="sm"
            p="md"
        >
            <Group gap="lg" justify="space-between">
                {!flipped && icon}
                <Text className="item-text">{title}</Text>
                {flipped && icon}
            </Group>
        </Paper>
    );
}

export function IndexLoggedOut() {
    const { t } = useTranslation();
    const { login, createAccount } = useModals();
    return (
        <Stack className="index-main-logged-out" gap="md">
            <Paper className="index-item title" radius="md" shadow="sm" p="md">
                <Stack gap="lg" align="center">
                    <Image
                        className="app-logo"
                        src={AppIcon}
                        alt={t("views.index.title.logoAlt")}
                    />
                    <Text className="app-title">{t("common.appName")}</Text>
                </Stack>
            </Paper>
            <IndexItem
                name="data"
                title={t("views.index.features.data")}
                icon={<MdPriceCheck />}
                flipped
            />
            <IndexItem
                name="collab"
                title={t("views.index.features.collab")}
                icon={<MdGroup />}
            />
            <IndexItem
                name="budgeting"
                title={t("views.index.features.budgeting")}
                flipped
                icon={<MdAttachMoney />}
            />
            <Paper
                className="index-item actions"
                radius="md"
                shadow="sm"
                p="md"
            >
                <Stack gap="md" align="center">
                    <Button
                        className="action login"
                        fullWidth
                        justify="space-between"
                        leftSection={<MdLogin size={"1.4em"} />}
                        onClick={() => login()}
                    >
                        {t("views.index.actions.login")}
                    </Button>
                    <Button
                        className="action login"
                        fullWidth
                        justify="space-between"
                        leftSection={<MdCreate size={"1.4em"} />}
                        onClick={() => createAccount()}
                    >
                        {t("views.index.actions.createAccount")}
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}

import { Button, Group, Image, Paper, Stack, Text } from "@mantine/core";
import "./index.scss";
import AppIcon from "../../assets/icon.svg";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";
import {
    MdAttachMoney,
    MdCreate,
    MdGroup,
    MdLogin,
    MdPriceCheck,
} from "react-icons/md";

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

export function IndexView() {
    const { t } = useTranslation();
    return (
        <Stack className="index-main" gap="md">
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
                    >
                        {t("views.index.actions.login")}
                    </Button>
                    <Button
                        className="action login"
                        fullWidth
                        justify="space-between"
                        leftSection={<MdCreate size={"1.4em"} />}
                    >
                        {t("views.index.actions.createAccount")}
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}

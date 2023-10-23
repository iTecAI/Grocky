import { AppShell, Avatar, Box, Button, Group } from "@mantine/core";
import AppIcon from "../../assets/icon.svg";
import "./layout.scss";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { useEnvironment } from "../../util/hooks";
import { MdLogin } from "react-icons/md";

export function Layout() {
    const { t } = useTranslation();
    const { height } = useEnvironment();
    return (
        <AppShell className="app-root">
            <AppShell.Header className="app-header">
                <Group justify="space-between" className="header-group">
                    <Group gap="md" className="left">
                        <Avatar className="app-icon" src={AppIcon} />
                        <span className="app-title">{t("common.appName")}</span>
                    </Group>
                    <Group gap="md" className="right">
                        <Button
                            className="btn-login"
                            size={height === "desktop" ? "md" : "compact-md"}
                            variant="light"
                            leftSection={<MdLogin size={"1.3em"} />}
                            justify="space-between"
                        >
                            {t("views.layout.login")}
                        </Button>
                    </Group>
                </Group>
            </AppShell.Header>
            <Box className="app-container" p="sm">
                <Outlet />
            </Box>
        </AppShell>
    );
}

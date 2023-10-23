import { AppShell, Avatar, Button, Group } from "@mantine/core";
import AppIcon from "../../assets/icon.svg";
import "./layout.scss";
import { useTranslation } from "react-i18next";

export function Layout() {
    const { t } = useTranslation();
    return (
        <AppShell className="app-root">
            <AppShell.Header className="app-header">
                <Group justify="space-between" className="header-group">
                    <Group gap="md" className="left">
                        <Avatar className="app-icon" src={AppIcon} />
                        <span className="app-title">{t("common.appName")}</span>
                    </Group>
                    <Group gap="md" className="right">
                        <Button className="btn-login">
                            {t("views.layout.login")}
                        </Button>
                    </Group>
                </Group>
            </AppShell.Header>
        </AppShell>
    );
}

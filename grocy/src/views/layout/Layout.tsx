import { AppShell, Avatar, Button, Group } from "@mantine/core";
import AppIcon from "../../assets/icon.svg";
import "./layout.scss";

export function Layout() {
    return (
        <AppShell className="app-root">
            <AppShell.Header className="app-header">
                <Group justify="space-between" className="header-group">
                    <Group gap="md" className="left">
                        <Avatar className="app-icon" src={AppIcon} />
                        <span className="app-title">Grocy</span>
                    </Group>
                    <Group gap="md" className="right">
                        <Button className="btn-login">Log In</Button>
                    </Group>
                </Group>
            </AppShell.Header>
        </AppShell>
    );
}

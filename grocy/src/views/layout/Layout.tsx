import { AppShell, Avatar, Group, Paper, Text } from "@mantine/core";
import AppIcon from "../../assets/icon.svg";
import "./layout.scss";

export function Layout() {
    return (
        <AppShell className="app-root">
            <Group className="app-header" gap="md">
                <Paper
                    className="app-header-item icon"
                    radius="xl"
                    shadow="md"
                    bg="dark"
                >
                    <Avatar src={AppIcon} className="app-icon" radius="xl" />
                </Paper>
                <Paper
                    className="app-header-item title"
                    radius="xl"
                    shadow="md"
                    bg="dark"
                >
                    <Text>Grocy</Text>
                </Paper>
            </Group>
        </AppShell>
    );
}

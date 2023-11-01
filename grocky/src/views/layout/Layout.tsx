import {
    AppShell,
    Avatar,
    Box,
    Button,
    Group,
    Menu,
    MenuDropdown,
    MenuItem,
    MenuTarget,
} from "@mantine/core";
import AppIcon from "../../assets/icon.svg";
import "./layout.scss";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { useEnvironment } from "../../util/hooks";
import { MdLogin, MdLogout, MdSettings } from "react-icons/md";
import { useModals } from "../modals";
import { useApi, useUser } from "../../util/api";

function UserMenu() {
    const [user] = useUser();
    const { auth } = useApi();
    const { t } = useTranslation();
    const { manageAccount } = useModals();
    return user ? (
        <Menu shadow="md" position="bottom-end" offset={12}>
            <MenuTarget>
                <Avatar src={user.profile_image} className="user-menu-target" />
            </MenuTarget>
            <MenuDropdown>
                <MenuItem
                    leftSection={<MdSettings size="1.3em" />}
                    onClick={() => manageAccount()}
                >
                    {t("views.layout.menu.settings")}
                </MenuItem>
                <MenuItem
                    leftSection={<MdLogout size="1.3em" />}
                    onClick={() => auth.logout()}
                >
                    {t("views.layout.menu.logout")}
                </MenuItem>
            </MenuDropdown>
        </Menu>
    ) : (
        <></>
    );
}

export function Layout() {
    const { t } = useTranslation();
    const { height } = useEnvironment();
    const { login } = useModals();
    const [user] = useUser();

    return (
        <AppShell className="app-root">
            <AppShell.Header className="app-header">
                <Group justify="space-between" className="header-group">
                    <Group gap="md" className="left">
                        <Avatar className="app-icon" src={AppIcon} />
                        <span className="app-title">{t("common.appName")}</span>
                    </Group>
                    <Group gap="md" className="right">
                        {user ? (
                            <UserMenu />
                        ) : (
                            <Button
                                className="btn-login"
                                size={
                                    height === "desktop" ? "md" : "compact-md"
                                }
                                variant="light"
                                leftSection={<MdLogin size={"1.3em"} />}
                                justify="space-between"
                                onClick={() => login()}
                            >
                                {t("views.layout.login")}
                            </Button>
                        )}
                    </Group>
                </Group>
            </AppShell.Header>
            <Box className="app-container" p="sm">
                <Outlet />
            </Box>
        </AppShell>
    );
}

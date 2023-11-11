import { Box, Group, Modal, Paper, Stack, Text } from "@mantine/core";
import { useEnvironment } from "../../../util/hooks";
import { LayoutProps } from "../util";
import { MdListAlt } from "react-icons/md";
import { useTranslation } from "react-i18next";
import "./layout.scss";

export function ViewLayout({ children, viewing }: LayoutProps) {
    const { width } = useEnvironment();
    const { t } = useTranslation();

    return width === "desktop" ? (
        <Group className="view-layout desktop" gap="sm">
            <Box className="layout-body desktop">{children}</Box>
            <Paper className="layout-info desktop" p="sm" radius="sm" bg="dark">
                {viewing ? (
                    <Stack gap="sm">
                        <Text>{viewing.data.title}</Text>
                        <div>{viewing.body}</div>
                    </Stack>
                ) : (
                    <Stack
                        justify="center"
                        align="center"
                        gap="sm"
                        className="no-item"
                    >
                        <MdListAlt size="2em" />
                        <Text c="dimmed" size="1.3em">
                            {t("views.list.info.no-item")}
                        </Text>
                    </Stack>
                )}
            </Paper>
        </Group>
    ) : (
        <Box className="view-layout mobile">
            <Box className="layout-body mobile">{children}</Box>
            <Modal
                opened={viewing !== null}
                title={viewing && viewing.data.title}
                onClose={viewing ? viewing.onClose : () => {}}
            >
                {viewing?.body}
            </Modal>
        </Box>
    );
}

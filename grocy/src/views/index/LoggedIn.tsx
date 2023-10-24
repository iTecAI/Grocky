import { Box, Card, SimpleGrid, Text } from "@mantine/core";
import { MdGroupAdd, MdList } from "react-icons/md";
import { useTranslation } from "react-i18next";

export function IndexLoggedIn() {
    const { t } = useTranslation();
    return (
        <SimpleGrid
            className="index-main"
            cols={{
                base: 1,
                sm: 2,
                md: 4,
                lg: 6,
            }}
        >
            <Card className="grocy-item create" withBorder>
                <Box className="creation-button list">
                    <MdList size="1.5em" />
                    <Text className="button-title">
                        {t("views.home.items.create.list")}
                    </Text>
                </Box>
                <Box className="creation-button group">
                    <MdGroupAdd size="1.5em" />
                    <Text className="button-title">
                        {t("views.home.items.create.group")}
                    </Text>
                </Box>
            </Card>
        </SimpleGrid>
    );
}

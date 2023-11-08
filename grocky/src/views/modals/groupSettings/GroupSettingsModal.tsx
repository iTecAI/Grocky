import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { useEffect, useState } from "react";
import { GroupType } from "../../../types/group";
import { useApi } from "../../../util/api";
import { Loader, Stack, TextInput, Textarea } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { MdGroup } from "react-icons/md";

export function GroupSettingsModal({
    context,
    id,
    innerProps,
}: ContextModalProps<{ group: string }>) {
    const [group, setGroup] = useState<GroupType | null>(null);
    const { groups } = useApi();
    const { t } = useTranslation();
    const form = useForm<{ name: string; description: string }>({
        initialValues: {
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        groups.get_group(innerProps.group).then((result) => {
            if (result) {
                setGroup(result);
                form.setFieldValue("name", result.name);
                form.setFieldValue("description", result.description);
            }
        });
    }, [innerProps.group]);

    return group ? (
        <Stack gap="sm">
            <TextInput
                label={t("modals.groupSettings.fields.name")}
                {...form.getInputProps("name")}
                leftSection={<MdGroup />}
            />
            <Textarea
                label={t("modals.groupSettings.fields.description")}
                autosize
                maxRows={5}
                minRows={2}
                {...form.getInputProps("description")}
            />
        </Stack>
    ) : (
        <Loader />
    );
}

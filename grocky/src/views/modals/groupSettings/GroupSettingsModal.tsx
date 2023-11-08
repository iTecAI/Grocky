import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { useEffect, useState } from "react";
import { GroupType } from "../../../types/group";
import { useApi } from "../../../util/api";
import {
    Button,
    Group,
    Loader,
    Stack,
    TextInput,
    Textarea,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { MdCancel, MdCheck, MdGroup } from "react-icons/md";

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
        validate: {
            name: (value) =>
                value.length === 0 ? t("errors.ui.common.requiredField") : null,
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
        <form
            onSubmit={form.onSubmit((values) =>
                groups
                    .update_group_settings(innerProps.group, values)
                    .then(() => {
                        context.closeModal(id);
                    }),
            )}
        >
            <Stack gap="sm">
                <TextInput
                    label={t("modals.groupSettings.fields.name")}
                    {...form.getInputProps("name")}
                    leftSection={<MdGroup />}
                    withAsterisk
                />
                <Textarea
                    label={t("modals.groupSettings.fields.description")}
                    autosize
                    maxRows={5}
                    minRows={2}
                    {...form.getInputProps("description")}
                />
                <Group gap="sm" justify="space-between">
                    <Button
                        color="red"
                        variant="subtle"
                        leftSection={<MdCancel size="1.3em" />}
                        justify="space-between"
                        onClick={() => context.closeModal(id)}
                    >
                        {t("common.actions.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        leftSection={<MdCheck size="1.3em" />}
                        justify="space-between"
                    >
                        {t("common.actions.submit")}
                    </Button>
                </Group>
            </Stack>
        </form>
    ) : (
        <Loader />
    );
}

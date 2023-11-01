import { Button, Group, PasswordInput, Stack, TextInput } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useTranslation } from "react-i18next";
import { MdAccountCircle, MdCreate, MdLock, MdLogin } from "react-icons/md";
import { useForm } from "@mantine/form";
import { useModals } from "..";
import { useApi } from "../../../util/api";
import { useNotifications } from "../../../util/notifications";
import { isString } from "lodash";

export function LoginModal({ context, id }: ContextModalProps<Record<string, never>>) {
    const { t } = useTranslation();
    const { createAccount } = useModals();
    const { auth } = useApi();
    const { error, success } = useNotifications();
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
        },
        validate: {
            username: (value) =>
                value.length > 0 ? null : t("errors.ui.common.requiredField"),
            password: (value) =>
                value.length > 0 ? null : t("errors.ui.common.requiredField"),
        },
    });
    return (
        <form
            onSubmit={form.onSubmit(({ username, password }) =>
                auth.login(username, password).then((result) => {
                    if (isString(result)) {
                        error(result, true);
                    } else {
                        success(t("modals.login.success"));
                        context.closeModal(id);
                    }
                }),
            )}
        >
            <Stack gap="md" align="stretch" className="login-modal modal">
                <TextInput
                    {...form.getInputProps("username")}
                    label={t("modals.login.fields.username.label")}
                    placeholder={t("modals.login.fields.username.placeholder")}
                    leftSection={<MdAccountCircle />}
                    withAsterisk
                />
                <PasswordInput
                    {...form.getInputProps("password")}
                    label={t("modals.login.fields.password.label")}
                    placeholder={t("modals.login.fields.password.placeholder")}
                    leftSection={<MdLock />}
                    withAsterisk
                />
                <Group justify="space-between" gap="sm">
                    <Button
                        variant="subtle"
                        leftSection={<MdCreate size={"1.2em"} />}
                        onClick={() => {
                            context.closeContextModal(id);
                            createAccount();
                        }}
                    >
                        {t("modals.login.actions.createAccount")}
                    </Button>
                    <Button
                        leftSection={<MdLogin size={"1.2em"} />}
                        type="submit"
                    >
                        {t("modals.login.actions.login")}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}

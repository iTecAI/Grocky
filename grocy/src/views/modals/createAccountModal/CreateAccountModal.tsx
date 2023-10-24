import {
    ActionIcon,
    Badge,
    Button,
    Group,
    HoverCard,
    List,
    ListItem,
    PasswordInput,
    Progress,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useTranslation } from "react-i18next";
import {
    MdAccountCircle,
    MdCreate,
    MdLock,
    MdLogin,
    MdQuestionMark,
} from "react-icons/md";
import { useForm } from "@mantine/form";
import { useModals } from "..";
import { useEffect, useState } from "react";
import { usePasswordStrength } from "../../../util/hooks";

export function CreateAccountModal({
    context,
    id,
}: ContextModalProps<Record<string, never>>) {
    const { t } = useTranslation();
    const { login } = useModals();
    const [pass, setPass] = useState<string>("");
    const passwordScore = usePasswordStrength(pass);
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
            passwordConfirm: "",
        },
        validate: {
            username: (value) =>
                value.length > 3 ? null : t("errors.ui.account.usernameLength"),
            password: (value, { passwordConfirm }) =>
                value === passwordConfirm
                    ? passwordScore.score > 2
                        ? null
                        : t("errors.ui.account.weakPassword")
                    : t("errors.ui.account.passwordMatch"),
            passwordConfirm: (value, { password }) =>
                value === password
                    ? null
                    : t("errors.ui.account.passwordMatch"),
        },
    });

    useEffect(() => setPass(form.values.password), [form.values.password]);

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Stack gap="md" align="stretch" className="login-modal modal">
                <TextInput
                    {...form.getInputProps("username")}
                    label={t("modals.createAccount.fields.username.label")}
                    placeholder={t(
                        "modals.createAccount.fields.username.placeholder",
                    )}
                    leftSection={<MdAccountCircle />}
                    withAsterisk
                />
                <PasswordInput
                    {...form.getInputProps("password")}
                    label={t("modals.createAccount.fields.password.label")}
                    placeholder={t(
                        "modals.createAccount.fields.password.placeholder",
                    )}
                    leftSection={<MdLock />}
                    withAsterisk
                />
                <PasswordInput
                    {...form.getInputProps("passwordConfirm")}
                    label={t(
                        "modals.createAccount.fields.passwordConfirm.label",
                    )}
                    placeholder={t(
                        "modals.createAccount.fields.password.placeholder",
                    )}
                    leftSection={<MdLock />}
                    withAsterisk
                />
                <Progress
                    value={100 * (passwordScore.score / 4)}
                    color={
                        passwordScore.score < 2
                            ? "red"
                            : passwordScore.score < 3
                            ? "yellow"
                            : "green"
                    }
                />
                <Group justify="space-between" gap="sm">
                    <Text>
                        {t("modals.createAccount.passwordStrength.label", {
                            strength:
                                passwordScore.score < 2
                                    ? t(
                                          "modals.createAccount.passwordStrength.weak",
                                      )
                                    : passwordScore.score < 3
                                    ? t(
                                          "modals.createAccount.passwordStrength.acceptable",
                                      )
                                    : t(
                                          "modals.createAccount.passwordStrength.good",
                                      ),
                        })}
                    </Text>
                    <HoverCard shadow="md" position="right">
                        <HoverCard.Target>
                            <ActionIcon
                                variant="subtle"
                                color="white"
                                disabled={pass.length === 0}
                            >
                                <MdQuestionMark />
                            </ActionIcon>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <Stack gap="sm">
                                <Group justify="space-between" gap="sm">
                                    <Badge>
                                        {t(
                                            "modals.createAccount.passwordStrength.feedback.calcTime",
                                        )}
                                    </Badge>
                                    <Text>
                                        {
                                            passwordScore.crackTimesDisplay
                                                .onlineNoThrottling10PerSecond
                                        }
                                    </Text>
                                </Group>
                                {passwordScore.feedback.warning && (
                                    <Group justify="space-between" gap="sm">
                                        <Badge>
                                            {t(
                                                "modals.createAccount.passwordStrength.feedback.feedback",
                                            )}
                                        </Badge>
                                        <Text>
                                            {passwordScore.feedback.warning}
                                        </Text>
                                    </Group>
                                )}
                            </Stack>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </Group>
                {passwordScore.feedback.suggestions.length > 0 && (
                    <List className="password-suggestions" c="dimmed">
                        {passwordScore.feedback.suggestions.map((s, i) => (
                            <ListItem key={i}>{s}</ListItem>
                        ))}
                    </List>
                )}
                <Group justify="space-between" gap="sm">
                    <Button
                        variant="subtle"
                        leftSection={<MdLogin size={"1.2em"} />}
                        onClick={() => {
                            context.closeContextModal(id);
                            login();
                        }}
                    >
                        {t("modals.createAccount.actions.login")}
                    </Button>
                    <Button
                        leftSection={<MdCreate size={"1.2em"} />}
                        type="submit"
                    >
                        {t("modals.createAccount.actions.createAccount")}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}

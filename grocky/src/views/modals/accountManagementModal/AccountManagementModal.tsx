import { ContextModalProps } from "@mantine/modals";
import { useApi, useStorage } from "../../../util/api";
import {
    ActionIcon,
    Avatar,
    Badge,
    Button,
    Divider,
    Group,
    HoverCard,
    List,
    ListItem,
    Loader,
    Paper,
    PasswordInput,
    Progress,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { User } from "../../../types/auth";
import { isString } from "lodash";
import { useTranslation } from "react-i18next";
import {
    MdCancel,
    MdCheck,
    MdDelete,
    MdError,
    MdPerson,
    MdQuestionMark,
    MdSave,
    MdUpload,
} from "react-icons/md";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { usePasswordStrength } from "../../../util/hooks";
import { useNotifications } from "../../../util/notifications";

export function AccountManagementModal({
    context,
    id,
}: ContextModalProps<Record<string, never>>) {
    const { user } = useApi();
    const { t } = useTranslation();
    const { error, success } = useNotifications();
    const storage = useStorage();

    const [userData, setUserData] = useState<User | null>(null);
    const [fields, setFields] = useState<{ [key: string]: any }>({});
    useEffect(() => setFields(userData ?? {}), [userData]);
    const canSave = useMemo(
        () =>
            userData
                ? Object.keys(userData).filter(
                      (v) => fields[v] !== userData[v as keyof User],
                  ).length > 0
                : false,
        [userData, fields],
    );

    useEffect(() => {
        user.self().then((value) =>
            isString(value) ? context.closeModal(id) : setUserData(value),
        );
    }, []);

    const formChangePassword = useForm({
        initialValues: {
            current: "",
            newPassword: "",
            confirmNewPassword: "",
        },
        validate: {
            current: (value) =>
                value.length > 0 ? null : t("errors.ui.common.requiredField"),
            newPassword: (value, { confirmNewPassword }) =>
                value.length > 0
                    ? value === confirmNewPassword
                        ? passwordScore.score > 2
                            ? null
                            : t("errors.ui.account.weakPassword")
                        : t("errors.ui.account.passwordMatch")
                    : t("errors.ui.common.requiredField"),
            confirmNewPassword: (value, { newPassword }) =>
                value.length > 0
                    ? value === newPassword
                        ? null
                        : t("errors.ui.account.passwordMatch")
                    : t("errors.ui.common.requiredField"),
        },
    });

    const passwordScore = usePasswordStrength(
        formChangePassword.values.newPassword,
    );

    const [updateLoading, setUpdateLoading] = useState<boolean>(false);

    return userData ? (
        <Stack gap="sm" className="account-management-modal modal" p="sm">
            <TextInput
                label={t("modals.manageAccount.fields.username")}
                value={fields.username ?? ""}
                onChange={(ev) =>
                    setFields((f) => ({ ...f, username: ev.target.value }))
                }
                leftSection={<MdPerson />}
            />
            <TextInput
                label={t("modals.manageAccount.fields.display_name")}
                value={fields.display_name ?? ""}
                onChange={(ev) =>
                    setFields((f) => ({ ...f, display_name: ev.target.value }))
                }
                leftSection={<MdPerson />}
            />
            <Dropzone
                onDrop={(files) => {
                    if (files.length > 0) {
                        const reader = new FileReader();
                        reader.addEventListener("loadend", () =>
                            setFields((fields) => ({
                                ...fields,
                                profile_image: reader.result,
                            })),
                        );
                        reader.readAsDataURL(files[0]);
                    }
                }}
                className="account-image-dropzone"
                accept={IMAGE_MIME_TYPE}
                p="xl"
            >
                <Stack className="dropzone-content" gap="md">
                    <Group
                        className="dropzone-main"
                        gap="md"
                        justify="space-between"
                    >
                        <Dropzone.Accept>
                            <MdCheck size="3em" />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <MdError size="3em" />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <MdUpload size="3em" />
                        </Dropzone.Idle>
                        <Stack gap="xs" className="dropzone-text">
                            <Text size="lg" c="dimmed">
                                {t(
                                    "modals.manageAccount.fields.dropzone.title",
                                )}
                            </Text>
                            <Text size="md" c="dimmed">
                                {t(
                                    "modals.manageAccount.fields.dropzone.description",
                                )}
                            </Text>
                        </Stack>
                    </Group>
                    {fields.profile_image && (
                        <>
                            <Divider variant="dashed" />
                            <Group
                                className="dropzone-preview"
                                justify="space-between"
                            >
                                <Avatar
                                    src={fields.profile_image}
                                    className="preview-img"
                                    size="lg"
                                />
                                <Text className="preview-text" c="dimmed">
                                    {t(
                                        "modals.manageAccount.fields.dropzone.preview",
                                    )}
                                </Text>
                            </Group>
                        </>
                    )}
                </Stack>
            </Dropzone>
            <Button
                className="remove-pfp"
                variant="subtle"
                color="red"
                leftSection={<MdDelete size="1.3em" />}
                justify="space-between"
                disabled={fields.profile_image === null}
                onClick={() =>
                    setFields((f) => ({ ...f, profile_image: null }))
                }
            >
                {t("modals.manageAccount.fields.dropzone.clear")}
            </Button>
            <Divider />
            <Paper withBorder p="sm">
                <form
                    onSubmit={formChangePassword.onSubmit((values) =>
                        user
                            .changePassword({
                                current: values.current,
                                new: values.newPassword,
                            })
                            .then((result) => {
                                if (isString(result)) {
                                    error(result, true);
                                } else {
                                    success(
                                        t(
                                            "modals.manageAccount.fields.changePassword.success",
                                        ),
                                    );
                                }
                            }),
                    )}
                >
                    <Stack gap="sm">
                        <Text>
                            {t(
                                "modals.manageAccount.fields.changePassword.title",
                            )}
                        </Text>
                        <PasswordInput
                            label={t(
                                "modals.manageAccount.fields.changePassword.current",
                            )}
                            {...formChangePassword.getInputProps("current")}
                        />
                        <PasswordInput
                            label={t(
                                "modals.manageAccount.fields.changePassword.new",
                            )}
                            {...formChangePassword.getInputProps("newPassword")}
                        />
                        <PasswordInput
                            label={t(
                                "modals.manageAccount.fields.changePassword.confirm",
                            )}
                            {...formChangePassword.getInputProps(
                                "confirmNewPassword",
                            )}
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
                                {t(
                                    "modals.createAccount.passwordStrength.label",
                                    {
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
                                    },
                                )}
                            </Text>
                            <HoverCard shadow="md" position="right">
                                <HoverCard.Target>
                                    <ActionIcon
                                        variant="subtle"
                                        color="white"
                                        disabled={
                                            formChangePassword.values
                                                .newPassword.length === 0
                                        }
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
                                                    passwordScore
                                                        .crackTimesDisplay
                                                        .onlineNoThrottling10PerSecond
                                                }
                                            </Text>
                                        </Group>
                                        {passwordScore.feedback.warning && (
                                            <Group
                                                justify="space-between"
                                                gap="sm"
                                            >
                                                <Badge>
                                                    {t(
                                                        "modals.createAccount.passwordStrength.feedback.feedback",
                                                    )}
                                                </Badge>
                                                <Text>
                                                    {
                                                        passwordScore.feedback
                                                            .warning
                                                    }
                                                </Text>
                                            </Group>
                                        )}
                                    </Stack>
                                </HoverCard.Dropdown>
                            </HoverCard>
                        </Group>
                        {passwordScore.feedback.suggestions.length > 0 &&
                            formChangePassword.values.newPassword.length >
                                0 && (
                                <List
                                    className="password-suggestions"
                                    c="dimmed"
                                >
                                    {passwordScore.feedback.suggestions.map(
                                        (s, i) => (
                                            <ListItem key={i}>{s}</ListItem>
                                        ),
                                    )}
                                </List>
                            )}
                        <Button
                            leftSection={<MdSave size="1.3em" />}
                            type="submit"
                            fullWidth
                            justify="space-between"
                        >
                            {t("common.actions.save")}
                        </Button>
                    </Stack>
                </form>
            </Paper>
            <div className="modal-actions-wrapper">
                <Group
                    justify="space-between"
                    gap="sm"
                    className="modal-actions"
                >
                    <Button
                        variant="subtle"
                        leftSection={<MdCancel size="1.3em" />}
                        onClick={() => context.closeModal(id)}
                    >
                        {t("common.actions.cancel")}
                    </Button>
                    <Button
                        variant="filled"
                        leftSection={<MdSave size="1.3em" />}
                        disabled={!canSave}
                        loading={updateLoading}
                        onClick={async () => {
                            setUpdateLoading(true);
                            if (
                                fields.profile_image !== userData.profile_image
                            ) {
                                try {
                                    if (fields.profile_image === null) {
                                        await storage.delete(
                                            "users/profile_images",
                                            userData.id,
                                        );
                                    } else {
                                        const result = await storage.set(
                                            "users/profile_images",
                                            userData.id,
                                            fields.profile_image,
                                        );
                                        fields.profile_image = `/api/${result}`;
                                    }
                                } catch {
                                    error(
                                        t("modals.manageAccount.errors.image"),
                                    );
                                    setUpdateLoading(false);
                                    return;
                                }
                            }

                            const updateResult =
                                await user.updateSettings(fields);
                            if (isString(updateResult)) {
                                error(updateResult, true);
                            } else {
                                success(t("modals.manageAccount.success"));
                                context.closeModal(id);
                            }
                            setUpdateLoading(false);
                        }}
                    >
                        {t("common.actions.save")}
                    </Button>
                </Group>
            </div>
        </Stack>
    ) : (
        <Loader />
    );
}

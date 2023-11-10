import {
    ActionIcon,
    Avatar,
    Badge,
    Button,
    Combobox,
    Group,
    Pill,
    PillsInput,
    Stack,
    TextInput,
    Textarea,
    useCombobox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdCancel, MdCheck, MdClose, MdGroup } from "react-icons/md";
import { User } from "../../../types/auth";
import { useApi, useUser } from "../../../util/api";
import { useDebouncedValue } from "@mantine/hooks";
import { isString } from "lodash";
import { useNotifications } from "../../../util/notifications";

export function GroupCreationModal({
    context,
    id,
}: ContextModalProps<Record<string, never>>) {
    const form = useForm<{
        name: string;
        description: string;
        members: User[];
    }>({
        initialValues: {
            name: "",
            description: "",
            members: [],
        },
        validate: {
            name: (value) =>
                value.length === 0 ? t("errors.ui.common.requiredField") : null,
        },
    });
    const { error } = useNotifications();
    const { t } = useTranslation();
    const [user] = useUser();
    const api = useApi();

    const selectedUsers = useMemo(
        () =>
            form.values.members.map((user) => (
                <Badge
                    color="dark"
                    key={user.id}
                    leftSection={
                        <Avatar
                            src={user.profile_image}
                            size="xs"
                            style={{ transform: "translate(-7px, 0)" }}
                        />
                    }
                    rightSection={
                        <ActionIcon
                            variant="subtle"
                            size="xs"
                            radius="xl"
                            style={{ transform: "translate(7px, 0)" }}
                            onClick={() =>
                                form.setFieldValue(
                                    "members",
                                    form.values.members.filter(
                                        (m) => m.id !== user.id,
                                    ),
                                )
                            }
                        >
                            <MdClose />
                        </ActionIcon>
                    }
                    p="sm"
                >
                    {user.display_name}
                </Badge>
            )),
        [form.values.members],
    );

    const [userSearch, setUserSearch] = useState<string>("");
    const [debouncedSearch] = useDebouncedValue(userSearch, 250);

    const [options, setOptions] = useState<User[]>([]);

    useEffect(() => {
        if (debouncedSearch.length === 0) {
            setOptions([]);
        } else {
            api.user
                .searchUsers(debouncedSearch)
                .then((result) =>
                    setOptions(
                        result.filter(
                            (v) =>
                                v.id !== user?.id &&
                                !form.values.members
                                    .map((u) => u.id)
                                    .includes(v.id),
                        ),
                    ),
                );
        }
    }, [debouncedSearch]);

    const renderedOptions = useMemo(
        () =>
            options.map((option) => (
                <Combobox.Option
                    value={JSON.stringify(option)}
                    key={option.id}
                    active={form.values.members
                        .map((u) => u.id)
                        .includes(option.id)}
                >
                    <Group gap="sm" justify="space-between">
                        <Avatar src={option.profile_image} />
                        <span>{option.display_name}</span>
                    </Group>
                </Combobox.Option>
            )),
        [options],
    );

    const combo = useCombobox();

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                api.groups.create(values).then((result) => {
                    if (isString(result)) {
                        error(result, true);
                    } else {
                        context.closeModal(id);
                    }
                }),
            )}
            className="modals group-creation"
        >
            <Stack gap="sm">
                <TextInput
                    label={t("modals.createGroup.fields.name.label")}
                    placeholder={t(
                        "modals.createGroup.fields.name.placeholder",
                    )}
                    leftSection={<MdGroup />}
                    {...form.getInputProps("name")}
                    withAsterisk
                />
                <Textarea
                    label={t("modals.createGroup.fields.desc.label")}
                    placeholder={t(
                        "modals.createGroup.fields.desc.placeholder",
                    )}
                    autosize
                    maxRows={5}
                    minRows={2}
                    {...form.getInputProps("description")}
                />
                <Combobox
                    store={combo}
                    onOptionSubmit={(value) => {
                        form.setFieldValue("members", [
                            ...form.values.members,
                            JSON.parse(value),
                        ]);
                        setUserSearch("");
                    }}
                >
                    <Combobox.DropdownTarget>
                        <PillsInput
                            onClick={() => combo.openDropdown()}
                            label={t("modals.createGroup.fields.members.label")}
                            leftSection={<MdGroup />}
                        >
                            <Pill.Group>
                                {selectedUsers}
                                <Combobox.EventsTarget>
                                    <PillsInput.Field
                                        onFocus={() => combo.openDropdown()}
                                        onBlur={() => combo.closeDropdown()}
                                        value={userSearch}
                                        onChange={(event) => {
                                            combo.updateSelectedOptionIndex();
                                            setUserSearch(
                                                event.currentTarget.value,
                                            );
                                        }}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Backspace" &&
                                                userSearch.length === 0
                                            ) {
                                                event.preventDefault();
                                                form.setFieldValue(
                                                    "members",
                                                    form.values.members.slice(
                                                        0,
                                                        form.values.members
                                                            .length - 1,
                                                    ),
                                                );
                                            }
                                        }}
                                    />
                                </Combobox.EventsTarget>
                            </Pill.Group>
                        </PillsInput>
                    </Combobox.DropdownTarget>
                    {renderedOptions.length > 0 && (
                        <Combobox.Dropdown>
                            <Combobox.Options>
                                {renderedOptions}
                            </Combobox.Options>
                        </Combobox.Dropdown>
                    )}
                </Combobox>
                <Group justify="space-between" gap="sm">
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
    );
}

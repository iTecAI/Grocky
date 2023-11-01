import {
    Button,
    Fieldset,
    Group,
    MultiSelect,
    SegmentedControl,
    Stack,
    Text,
    TextInput,
    Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { useTranslation } from "react-i18next";
import {
    MdCancel,
    MdCheck,
    MdCheckBox,
    MdList,
    MdShoppingBag,
} from "react-icons/md";
import { startCase } from "lodash";

const STORES = ["costco", "wegmans"];

export function ListCreationModal({
    context,
    id,
    innerProps,
}: ContextModalProps<{ ownerType: "user" | "group"; ownerId: string }>) {
    const { t } = useTranslation();
    const form = useForm<{
        name: string;
        description: string;
        type: "general" | "task" | "grocery";
        options: {
            grocery: {
                stores: string[];
            };
        };
    }>({
        initialValues: {
            name: "",
            description: "",
            type: "grocery",
            options: {
                grocery: {
                    stores: STORES,
                },
            },
        },
        validate: {
            name: (value) =>
                value.length === 0 ? t("errors.ui.common.requiredField") : null,
        },
    });
    return (
        <form
            className="modals create-list"
            onSubmit={form.onSubmit((values) => console.log(values))}
        >
            <Stack gap="sm">
                <TextInput
                    label={t("modals.createList.fields.name.label")}
                    placeholder={t("modals.createList.fields.name.placeholder")}
                    leftSection={<MdList />}
                    {...form.getInputProps("name")}
                    withAsterisk
                />
                <Textarea
                    label={t("modals.createList.fields.desc.label")}
                    placeholder={t("modals.createList.fields.desc.placeholder")}
                    autosize
                    maxRows={5}
                    minRows={2}
                    {...form.getInputProps("description")}
                />
                <SegmentedControl
                    {...form.getInputProps("type")}
                    data={[
                        {
                            value: "general",
                            label: (
                                <Group gap="sm" justify="center">
                                    <MdList size="1.3em" />
                                    <Text>
                                        {t(
                                            "modals.createList.fields.type.labels.general",
                                        )}
                                    </Text>
                                </Group>
                            ),
                        },
                        {
                            value: "task",
                            label: (
                                <Group gap="sm" justify="center">
                                    <MdCheckBox size="1.3em" />
                                    <Text>
                                        {t(
                                            "modals.createList.fields.type.labels.task",
                                        )}
                                    </Text>
                                </Group>
                            ),
                        },
                        {
                            value: "grocery",
                            label: (
                                <Group gap="sm" justify="center">
                                    <MdShoppingBag size="1.3em" />
                                    <Text>
                                        {t(
                                            "modals.createList.fields.type.labels.grocery",
                                        )}
                                    </Text>
                                </Group>
                            ),
                        },
                    ]}
                />
                {form.values.type === "grocery" && (
                    <Fieldset
                        legend={t("modals.createList.fields.options.label")}
                        p="md"
                    >
                        <Stack gap="sm">
                            <MultiSelect
                                checkIconPosition="right"
                                {...form.getInputProps(
                                    "options.grocery.stores",
                                )}
                                label={t(
                                    "modals.createList.fields.options.grocery.selectStore.label",
                                )}
                                data={STORES.map((store) => ({
                                    value: store,
                                    label: startCase(store),
                                }))}
                            />
                        </Stack>
                    </Fieldset>
                )}
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
    );
}

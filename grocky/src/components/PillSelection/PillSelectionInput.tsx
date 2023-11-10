import {
    ActionIcon,
    Avatar,
    Badge,
    Combobox,
    Group,
    Pill,
    PillsInput,
    PillsInputProps,
    useCombobox,
} from "@mantine/core";
import { useListState, useUncontrolled } from "@mantine/hooks";
import { useCallback, useEffect, useMemo } from "react";
import { MdCheck, MdClose } from "react-icons/md";

export function PillSelect({
    data,
    value,
    onChange,
    search,
    onSearchChange,
    defaultValue,
    defaultSearchValue,
    inputProps,
}: {
    data: { value: string; text: string; icon?: string }[];
    search?: string;
    onSearchChange?: (value: string) => void;
    onChange?: (value: string[]) => void;
    defaultSearchValue?: string;
    value?: string[];
    defaultValue?: string[];
    inputProps?: Partial<PillsInputProps>;
}) {
    const [val, setVal] = useUncontrolled<string[]>({
        value,
        defaultValue,
        finalValue: [],
        onChange,
    });

    const [searchVal, setSearchVal] = useUncontrolled({
        value: search,
        defaultValue: defaultSearchValue,
        finalValue: "",
        onChange: onSearchChange,
    });

    const valueHas = useCallback((check: string) => val.includes(check), [val]);
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
    });

    const [dataCache, cacheHandlers] = useListState<{
        value: string;
        text: string;
        icon?: string;
    }>([]);

    useEffect(() => {
        const ids = dataCache.map((d) => d.value);
        for (const d of data) {
            if (ids.includes(d.value)) {
                cacheHandlers.setItem(ids.indexOf(d.value), d);
            } else {
                cacheHandlers.append(d);
            }
        }
    });

    const valueMapping: {
        [key: string]: { value: string; text: string; icon?: string };
    } = useMemo(
        () =>
            dataCache.reduce(
                (previous, current) => ({
                    ...previous,
                    [current.value]: current,
                }),
                {},
            ),
        [dataCache],
    );

    const pills = useMemo(
        () =>
            val.map((item) => (
                <Badge
                    p="sm"
                    color="dark"
                    key={item}
                    leftSection={
                        <Avatar
                            size="xs"
                            src={valueMapping[item]?.icon ?? ""}
                        />
                    }
                    rightSection={
                        <ActionIcon
                            variant="subtle"
                            size="xs"
                            radius="xl"
                            style={{ transform: "translate(7px, 0)" }}
                            onClick={() =>
                                setVal(val.filter((v) => v !== item))
                            }
                        >
                            <MdClose />
                        </ActionIcon>
                    }
                >
                    {valueMapping[item]?.text ?? ""}
                </Badge>
            )),
        [valueMapping, val],
    );

    const options = useMemo(
        () =>
            data
                .filter((item) =>
                    item.text
                        .toLowerCase()
                        .includes(searchVal.trim().toLowerCase()),
                )
                .map((item) => (
                    <Combobox.Option
                        value={item.value}
                        key={item.value}
                        active={valueHas(item.value)}
                    >
                        <Group gap="sm" justify="space-between">
                            <Group gap="sm">
                                <Avatar src={item.icon ?? ""} size="sm" />
                                <span>{item.text}</span>
                            </Group>
                            {valueHas(item.value) ? (
                                <MdCheck size={12} />
                            ) : null}
                        </Group>
                    </Combobox.Option>
                )),
        [data, val, searchVal],
    );

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={(opt) => {
                setVal([...val, opt]);
                setSearchVal("");
            }}
        >
            <Combobox.DropdownTarget>
                <PillsInput
                    onClick={() => combobox.openDropdown()}
                    {...(inputProps ?? {})}
                >
                    <Pill.Group>
                        {pills}

                        <Combobox.EventsTarget>
                            <PillsInput.Field
                                onFocus={() => combobox.openDropdown()}
                                onBlur={() => combobox.closeDropdown()}
                                value={search}
                                placeholder="Search values"
                                onChange={(event) => {
                                    combobox.updateSelectedOptionIndex();
                                    setSearchVal(event.currentTarget.value);
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Backspace" &&
                                        searchVal.length === 0
                                    ) {
                                        event.preventDefault();
                                        setVal(val.slice(0, val.length - 1));
                                    }
                                }}
                            />
                        </Combobox.EventsTarget>
                    </Pill.Group>
                </PillsInput>
            </Combobox.DropdownTarget>
            {options.length > 0 && (
                <Combobox.Dropdown>
                    <Combobox.Options>{options}</Combobox.Options>
                </Combobox.Dropdown>
            )}
        </Combobox>
    );
}

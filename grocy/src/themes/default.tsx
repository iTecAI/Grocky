import { PasswordInput, createTheme } from "@mantine/core";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export const themeDefault = createTheme({
    fontFamily: "'Noto Sans', sans-serif",
    fontFamilyMonospace: "'Noto Sans Mono', monospace",
    components: {
        PasswordInput: PasswordInput.extend({
            defaultProps: {
                visibilityToggleIcon: ({ reveal }) =>
                    reveal ? <MdVisibilityOff /> : <MdVisibility />,
            },
        }),
    },
});

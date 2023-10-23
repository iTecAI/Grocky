import { useMediaQuery } from "@mantine/hooks";

export type Environment = {
    width: "desktop" | "mobile";
    height: "desktop" | "mobile";
    combined: "desktop" | "mobile";
};

export function useEnvironment(): Environment {
    const desktopWidth = useMediaQuery("(min-width: 900px)");
    const desktopHeight = useMediaQuery("(min-height: 800px)");
    return {
        width: desktopWidth ? "desktop" : "mobile",
        height: desktopHeight ? "desktop" : "mobile",
        combined: desktopHeight && desktopWidth ? "desktop" : "mobile",
    };
}

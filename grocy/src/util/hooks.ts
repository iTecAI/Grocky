import { useMediaQuery } from "@mantine/hooks";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import { useEffect, useMemo } from "react";

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

export function usePasswordStrength(password: string) {
    useEffect(() => {
        const options = {
            translations: zxcvbnEnPackage.translations,
            graphs: zxcvbnCommonPackage.adjacencyGraphs,
            dictionary: {
                ...zxcvbnCommonPackage.dictionary,
                ...zxcvbnEnPackage.dictionary,
            },
        };
        zxcvbnOptions.setOptions(options);
    });

    const passwordData = useMemo(
        () => zxcvbn(password),
        [zxcvbnOptions, password],
    );
    return passwordData;
}

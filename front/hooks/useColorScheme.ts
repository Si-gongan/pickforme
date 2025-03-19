import { useColorScheme as useColorSchemeBase } from "react-native";
import { useAtomValue } from "jotai";

import { settingAtom } from "../stores/auth/atoms";

export type ColorScheme = "light" | "dark";

export const useColorScheme: () => ColorScheme = () => {
    const { theme } = useAtomValue(settingAtom);
    const colorScheme = useColorSchemeBase();
    if (!colorScheme && !theme) {
        return "light";
    }
    if (!theme || theme === "default") {
        return colorScheme ?? "light";
    }
    return theme;
};

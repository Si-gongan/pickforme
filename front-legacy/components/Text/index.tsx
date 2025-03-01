import { forwardRef } from "react";
import { Text as RNText } from "react-native";

import { useThemeColor } from "../../hooks/useThemeColor";

import type { TTextProps } from "./type";

export default forwardRef<RNText, TTextProps>((props, ref) => {
  const { style, lightColor, darkColor, color, ...otherProps } = props;

  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text",
    color
  );

  const defaultProps = {
    style: [{ color: textColor }, style],
    lineBreakStrategyIOS: "hangul-word" as const,
  };

  return <RNText {...defaultProps} {...otherProps} ref={ref} />;
});

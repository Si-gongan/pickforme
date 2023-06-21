declare module "*.svg" {
  import React from 'react';
  import { SvgProps } from "react-native-svg";
  interface Style extends SvgProps['style'] {
    color: string;
  }
  interface Props extends Omit<SvgProps, 'style'> {
    style: Style;
  }
  const content: React.FC<Props>;
  export default content;
}

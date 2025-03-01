export interface ISetting {
  name?: string;
  vision?: "none" | "low" | "blind";
  theme?: "light" | "dark" | "default";
  isReady: boolean;
}

export type TVision = "none" | "low" | "blind";

export interface ISetting {
  name?: string;
  vision?: TVision;
  theme?: "light" | "dark" | "default";
  isReady?: boolean;
}

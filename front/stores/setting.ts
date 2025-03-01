import { atomWithStorage } from "./utils";

import type { ISetting } from "@types";

export const settingAtom = atomWithStorage<ISetting>("setting", {
  isReady: false,
});

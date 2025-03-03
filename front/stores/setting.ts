import { atom } from "jotai";

import { atomWithStorage } from "./utils";

import type { ISetting, IModal } from "@types";

export const settingAtom = atomWithStorage<ISetting>("setting", {
  isReady: false,
});

export const modalAtom = atom<IModal>({});

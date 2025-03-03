import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

import { userAtom, modalAtom } from "@stores";
import { client, changeToken } from "./axios";

import type { IAppleAuthPayload, ILogin, IServiceProps } from "@types";

export function useServiceLogin({ onSuccess }: Partial<IServiceProps> = {}) {
  const onUser = useSetAtom(userAtom);
  const onModal = useSetAtom(modalAtom);

  const onLogin = useCallback(
    async function (data: ILogin) {
      const userData = data.user;
      await onUser(userData || {});
      if (!!userData) {
        changeToken(userData?.token);
      }
      onModal(function (prev) {
        return {
          ...prev,
          loginModal: false,
          greetingModal: data?.isNewLoginInEvent || false,
        };
      });
    },
    [onUser, onModal]
  );

  const { mutateAsync: mutateAppleLogin, isPending: isPendingAppleLogin } =
    useMutation({
      mutationKey: ["mutateAppleLogin"],
      mutationFn: function (payload: IAppleAuthPayload) {
        return client.post<ILogin>("/auth/apple", payload);
      },
      onSuccess: function (response) {
        console.log("response", response);
        if (response.status === 200) {
          onLogin(response.data);
          onSuccess?.();
        }
      },
      onError: function (error) {
        console.log("error", error);
      },
    });

  return {
    mutateAppleLogin,
    isPending: isPendingAppleLogin,
  };
}

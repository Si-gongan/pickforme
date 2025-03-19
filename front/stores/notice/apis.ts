import client from "../../utils/axios";

import { Notice, GetNoticeParams, GetNoticesParams } from "./types";

export const GetNoticeAPI = (params: GetNoticeParams) =>
  client.get<Notice>(`/notice/detail/${params._id}`);

export const GetNoticesAPI = (params: GetNoticesParams) =>
  client.get<Notice[]>("/notice");

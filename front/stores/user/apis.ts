import client from "../../utils/axios";
import { GetUserPointParams, UserPoint } from "./types";

export const UserPointAPI = (params: GetUserPointParams) => client.get<UserPoint | string>('/user/my', params).catch(error => { console.log(error) });

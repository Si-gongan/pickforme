import client from '../../utils/axios';

import {
  LoginResponse,
} from './types';

export const GoogleLoginAPI = (params: GoogleLoginParams) => client.post<LoginResponse>('/auth/google',params);

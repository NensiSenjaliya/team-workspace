import { httpClient } from './httpClient';

export const authApi = {
  login: (payload) => httpClient('/auth/token/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  register: (payload) => httpClient('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  me: () => httpClient('/auth/me/')
};

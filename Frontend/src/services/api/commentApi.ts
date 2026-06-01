import { httpClient } from './httpClient';

export const commentApi = {
  list: (taskId) => httpClient(`/comments/?task=${taskId}`),

  create: (payload) => httpClient('/comments/', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};

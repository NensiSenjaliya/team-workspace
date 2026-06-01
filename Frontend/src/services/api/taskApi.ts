import { httpClient } from './httpClient';

function toQueryString(params: Record<string, unknown>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });

  return query.toString();
}

export const taskApi = {
  list: (params = {}) => {
    const query = toQueryString(params);
    return httpClient(`/tasks/${query ? `?${query}` : ''}`);
  },

  create: (payload) => httpClient('/tasks/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  update: (id, payload) => httpClient(`/tasks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),

  remove: (id) => httpClient(`/tasks/${id}/`, {
    method: 'DELETE'
  })
};

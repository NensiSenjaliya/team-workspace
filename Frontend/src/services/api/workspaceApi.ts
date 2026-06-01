import { httpClient } from './httpClient';

export const workspaceApi = {
  list: () => httpClient('/workspaces/'),

  create: (payload) => httpClient('/workspaces/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  members: (id) => httpClient(`/workspaces/${id}/members/`),

  invite: (id, payload) => httpClient(`/workspaces/${id}/invite/`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  removeMember: (workspaceId, memberId) => httpClient(`/workspaces/${workspaceId}/members/${memberId}/`, {
    method: 'DELETE'
  })
};

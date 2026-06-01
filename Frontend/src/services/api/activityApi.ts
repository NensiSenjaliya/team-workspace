import { httpClient } from './httpClient';

export const activityApi = {
  list: (workspaceId) => httpClient(`/activity-logs/?workspace=${workspaceId}`)
};

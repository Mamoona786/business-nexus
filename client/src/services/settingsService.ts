import { API } from './api';
import { NotificationPreferences, PrivacySettings, User } from '../types';

export const updateAccountSettingsApi = async (
  updates: Partial<User>
): Promise<{ message: string; user: User }> => {
  const { data } = await API.patch('/settings/account', updates);
  return data;
};

export const changePasswordApi = async (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> => {
  const { data } = await API.patch('/settings/password', payload);
  return data;
};

export const updateNotificationPreferencesApi = async (
  preferences: Partial<NotificationPreferences>
): Promise<{
  message: string;
  notificationPreferences: NotificationPreferences;
}> => {
  const { data } = await API.patch('/settings/notifications', preferences);
  return data;
};

export const updatePrivacySettingsApi = async (
  privacySettings: Partial<PrivacySettings>
): Promise<{
  message: string;
  privacySettings: PrivacySettings;
}> => {
  const { data } = await API.patch('/settings/privacy', privacySettings);
  return data;
};

export const toggleTwoFactorApi = async (
  enabled: boolean
): Promise<{ message: string; twoFactorEnabled: boolean }> => {
  const { data } = await API.patch('/settings/two-factor', { enabled });
  return data;
};

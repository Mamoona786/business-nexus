import { API } from './api';
import { NotificationPreferences, PrivacySettings, User } from '../types';

export const getSettingsApi = async (): Promise<{
  settings: {
    notificationPreferences: NotificationPreferences;
    privacySettings: PrivacySettings;
    twoFactorEnabled: boolean;
  };
}> => {
  const { data } = await API.get('/settings');
  return data;
};

export const updateAccountSettingsApi = async (payload: {
  name?: string;
  email?: string;
  location?: string;
  bio?: string;
}): Promise<{ message: string; user: User }> => {
  const { data } = await API.put('/settings/account', payload);
  return data;
};

export const changePasswordApi = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const { data } = await API.put('/settings/password', payload);
  return data;
};

export const updateNotificationPreferencesApi = async (
  payload: Partial<NotificationPreferences>
): Promise<{ message: string; notificationPreferences: NotificationPreferences }> => {
  const { data } = await API.put('/settings/notifications', payload);
  return data;
};

export const updatePrivacySettingsApi = async (
  payload: Partial<PrivacySettings>
): Promise<{ message: string; privacySettings: PrivacySettings }> => {
  const { data } = await API.put('/settings/privacy', payload);
  return data;
};

export const toggleTwoFactorApi = async (
  enabled: boolean
): Promise<{ message: string; twoFactorEnabled: boolean }> => {
  const { data } = await API.put('/settings/2fa', { enabled });
  return data;
};

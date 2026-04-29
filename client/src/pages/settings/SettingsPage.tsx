import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { User, Lock, Bell, Shield } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import {
  changePasswordApi,
  getSettingsApi,
  toggleTwoFactorApi,
  updateAccountSettingsApi,
  updateNotificationPreferencesApi,
  updatePrivacySettingsApi
} from '../../services/settingsService';
import { NotificationPreferences, PrivacySettings } from '../../types';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    location: '',
    bio: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>({
      email: true,
      inApp: true,
      messages: true,
      meetings: true,
      documents: true,
      payments: true,
      collaborations: true
    });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showOnlineStatus: true
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;

    setAccountForm({
      name: user.name || '',
      email: user.email || '',
      location: user.location || '',
      bio: user.bio || ''
    });

    const loadSettings = async () => {
      try {
        const response = await getSettingsApi();

        if (response.settings.notificationPreferences) {
          setNotificationPreferences(response.settings.notificationPreferences);
        }

        if (response.settings.privacySettings) {
          setPrivacySettings(response.settings.privacySettings);
        }

        setTwoFactorEnabled(response.settings.twoFactorEnabled || false);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load settings');
      }
    };

    loadSettings();
  }, [user]);

  if (!user) return null;

  const handleAccountSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingAccount(true);

    try {
      const response = await updateAccountSettingsApi(accountForm);
      await updateProfile(response.user);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update account settings');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      toast.success(response.message);

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationChange = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    const updated = { ...notificationPreferences, [key]: value };
    setNotificationPreferences(updated);

    try {
      const response = await updateNotificationPreferencesApi(updated);
      setNotificationPreferences(response.notificationPreferences);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update notifications');
    }
  };

  const handlePrivacyChange = async (
    key: keyof PrivacySettings,
    value: boolean | 'public' | 'private'
  ) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);

    try {
      const response = await updatePrivacySettingsApi(updated);
      setPrivacySettings(response.privacySettings);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update privacy settings');
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      const response = await toggleTwoFactorApi(!twoFactorEnabled);
      setTwoFactorEnabled(response.twoFactorEnabled);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update 2FA setting');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              <a href="#profile" className="flex items-center w-full px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md">
                <User size={18} className="mr-3" />
                Account
              </a>

              <a href="#security" className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Lock size={18} className="mr-3" />
                Security
              </a>

              <a href="#notifications" className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Bell size={18} className="mr-3" />
                Notifications
              </a>

              <a href="#privacy" className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Shield size={18} className="mr-3" />
                Privacy
              </a>
            </nav>
          </CardBody>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card id="profile">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
            </CardHeader>

            <CardBody>
              <form onSubmit={handleAccountSubmit} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar src={user.avatarUrl} alt={user.name} size="xl" />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={accountForm.name}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={accountForm.email}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />

                  <Input label="Role" value={user.role} disabled />

                  <Input
                    label="Location"
                    value={accountForm.location}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={4}
                    value={accountForm.bio}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" isLoading={isSavingAccount}>
                    Save Account Settings
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card id="security">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            </CardHeader>

            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Two-Factor Authentication Preference
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Toggle your 2FA preference for account security.
                    </p>

                    <Badge variant={twoFactorEnabled ? 'success' : 'error'} className="mt-1">
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <Button variant="outline" onClick={handleTwoFactorToggle}>
                    {twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))
                    }
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value
                      }))
                    }
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))
                    }
                  />

                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isChangingPassword}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            </CardBody>
          </Card>

          <Card id="notifications">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
            </CardHeader>

            <CardBody className="space-y-4">
              {Object.entries(notificationPreferences).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="capitalize text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>

                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      handleNotificationChange(
                        key as keyof NotificationPreferences,
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              ))}
            </CardBody>
          </Card>

          <Card id="privacy">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Privacy Settings</h2>
            </CardHeader>

            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Visibility
                </label>

                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) =>
                    handlePrivacyChange(
                      'profileVisibility',
                      e.target.value as 'public' | 'private'
                    )
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show Email</span>
                <input
                  type="checkbox"
                  checked={privacySettings.showEmail}
                  onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show Online Status</span>
                <input
                  type="checkbox"
                  checked={privacySettings.showOnlineStatus}
                  onChange={(e) =>
                    handlePrivacyChange('showOnlineStatus', e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

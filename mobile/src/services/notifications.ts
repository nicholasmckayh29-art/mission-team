import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

function isNativeNotificationsSupported() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

if (isNativeNotificationsSupported()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForExpoPushToken(): Promise<string | null> {
  if (!isNativeNotificationsSupported()) {
    return null;
  }

  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  let status = existingPermission.status;

  if (status !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    status = requestedPermission.status;
  }

  if (status !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  const token = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  return token.data;
}

export async function scheduleLocalFollowUpReminder(contactName: string, date: Date) {
  if (!isNativeNotificationsSupported()) {
    return null;
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  let status = existingPermission.status;

  if (status !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    status = requestedPermission.status;
  }

  if (status !== 'granted') {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Follow-up reminder',
      body: `Reach out to ${contactName}.`,
      data: { type: 'follow_up' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

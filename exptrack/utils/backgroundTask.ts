import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { getItemAsync } from 'expo-secure-store';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { router } from "expo-router"

const BACKGROUND_FETCH_TASK = 'CHECK_NOTIFICATIONS_TASK';
const MINIMUM_INTERVAL = 15 * 60; // 15 minutes in seconds

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('Background task: Checking for notifications...');

    const token = await getItemAsync("authToken");

    if (!token) {
      console.log('No auth token found, skipping notification check');
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    const response = await fetch(process.env.EXPO_PUBLIC_API_URL! + "/notification", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch notifications:', response.status);
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    const { data } = await response.json();

    if (data?.count > 0 && data.notifications) {
      console.log(`Found ${data.count} notifications`);

      for (let i = 0; i < data.count; i++) {
        const notification = data.notifications[i];
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.category || 'Notification',
            body: notification.message || '',
            data: {
              budget_id: (() => {
                const msg = notification.message ?? '';
                const match = msg.match(/\(ID:\s*([a-f0-9-]+)\)/i);
                return match ? match[1] : undefined;
              })(),
            },
          },
          trigger: null, // Deliver immediately
        });
      }

      return BackgroundTask.BackgroundTaskResult.Success;
    }

    console.log('No new notifications');
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error: unknown) {
    console.error("Failed to fetch notifications:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
})

export const registerBackgroundTask = async () => {
  try {
    // Setup notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('ExpTrackNotificationChannel', {
        name: 'ExpTrack Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);

    if (!isRegistered) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: MINIMUM_INTERVAL, // 15 minutes
      });
      console.log('Background task registered successfully');
    } else {
      console.log('Background task already registered');
    }
  } catch (error) {
    console.error('Failed to register background task:', error);
  }
}

export function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const budget_id = notification.request.content.data?.budget_id;
      if (typeof budget_id == "string") {
        router.push(`/budget/${budget_id}`)
      }
    }

    // Handle notification tapped while app was closed
    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      redirect(response.notification);
    }

    // Handle notification tapped while app is open
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
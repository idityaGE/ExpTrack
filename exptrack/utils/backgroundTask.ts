import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { getItemAsync } from 'expo-secure-store';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { router } from "expo-router"
// import AsyncStorage from '@react-native-async-storage/async-storage';


const BACKGROUND_TASK_NAME = 'CHECK_NOTIFICATIONS_TASK';
const MINIMUM_INTERVAL = 15; // 15 minutes

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {

    const token = await getItemAsync("authToken");
    const response = await fetch(process.env.EXPO_PUBLIC_API_URL! + "/notification", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const { data } = await response.json();

    if (data.count > 0) {
      for (let i = 0; i < data.count; i++) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: data.notifications[i].category,
            body: data.notifications[i].message,
            data: {
              budget_id: (() => {
                const msg = data.notifications[i].message ?? '';
                const match = msg.match(/\(ID:\s*([a-f0-9-]+)\)/i);
                return match ? match[1] : undefined;
              })(),
            },
          },
          trigger: { // set null for sending immediately
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
          }
        })
      }
    }

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error: unknown) {
    console.error("Failed to fetch the notifications")
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
})

export const registerBackgroundTask = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('ExpTrackNotificationChannel', {
        name: 'A channel is needed for the permissions prompt to appear',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    if (!await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME)) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: MINIMUM_INTERVAL,
      })
    }

    console.log('Background task registered');
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
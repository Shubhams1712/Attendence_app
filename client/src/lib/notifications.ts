export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      ...options,
    } as NotificationOptions);
  }
}

export function scheduleReminder(minutesBefore: number, subject: string, teacher: string) {
  const now = new Date();
  const lectureTime = new Date();
  lectureTime.setHours(10, 0, 0, 0); // Default 10 AM - customize per schedule

  const reminderTime = new Date(lectureTime.getTime() - minutesBefore * 60 * 1000);

  if (reminderTime > now) {
    const delay = reminderTime.getTime() - now.getTime();
    setTimeout(() => {
      sendNotification('ClassAttend Reminder', {
        body: `Lecture starts in ${minutesBefore} minutes!\n${subject} with ${teacher}`,
        tag: 'lecture-reminder',
      });
    }, delay);
  }
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function isNotificationGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

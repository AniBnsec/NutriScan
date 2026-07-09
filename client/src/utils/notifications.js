/**
 * Browser Notification Utilities
 * Meal reminders using the Notification API
 */

const REMINDER_KEY = 'reminder_intervals';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleReminders(times = {}) {
  // Cancel existing
  cancelReminders();

  const defaults = { breakfast: '08:00', lunch: '13:00', snack: '16:00', dinner: '20:00' };
  const combined = { ...defaults, ...times };

  const intervals = [];
  Object.entries(combined).forEach(([meal, timeStr]) => {
    if (!timeStr) return;
    const [h, m] = timeStr.split(':').map(Number);
    const intervalId = setInterval(() => {
      const now = new Date();
      if (now.getHours() === h && now.getMinutes() === m) {
        fireNotification(meal);
      }
    }, 60 * 1000); // Check every minute
    intervals.push(intervalId);
  });

  // Store interval IDs in sessionStorage
  sessionStorage.setItem(REMINDER_KEY, JSON.stringify(intervals));
}

export function cancelReminders() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(REMINDER_KEY) || '[]');
    stored.forEach(id => clearInterval(id));
    sessionStorage.removeItem(REMINDER_KEY);
  } catch {}
}

function fireNotification(meal) {
  if (Notification.permission !== 'granted') return;
  const MEAL_MESSAGES = {
    breakfast: { title: '🌅 Breakfast Time!', body: "Good morning! Don't forget to log your breakfast for an accurate day." },
    lunch: { title: '☀️ Lunch Time!', body: "It's lunchtime! Log your meal to stay on track with your goals." },
    snack: { title: '🍎 Snack Check!', body: "Snack time! Remember to log anything you eat to keep your nutrition accurate." },
    dinner: { title: '🌙 Dinner Time!', body: "Evening reminder! Log your dinner to complete today's nutrition log." },
  };
  const msg = MEAL_MESSAGES[meal] || { title: '🥗 NutriScan Reminder', body: 'Time to log your meal!' };
  new Notification(msg.title, {
    body: msg.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `meal-reminder-${meal}`,
    requireInteraction: false,
  });
}

// Init reminders on app load if they were enabled
export function initRemindersFromStorage() {
  if (localStorage.getItem('reminders_enabled') === 'true') {
    try {
      const times = JSON.parse(localStorage.getItem('reminder_times') || '{}');
      scheduleReminders(times);
    } catch {}
  }
}

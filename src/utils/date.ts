export const dayLater = () => Date.now() + 1000 * 60 * 60 * 24;
export const fifthMinuteLater = () => Date.now() + 1000 * 60 * 5;

export const convertUtcDateToFullDateMoscow = (day: number) =>
  new Date(day).toLocaleDateString('ru-RU', {
    timeZone: 'Europe/Moscow',
  });

export const convertTimestampToTimeMoscow = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('ru-RU', {
    timeZone: 'Europe/Moscow',
  });

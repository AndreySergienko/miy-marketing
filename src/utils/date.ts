export const dayLater = () => Date.now() + 1000 * 60 * 60 * 24;
export const fifthMinuteLater = () => Date.now() + 1000 * 60 * 5;

export const convertUtcDateToFullDateMoscow = (timestamp: number) =>
  new Date(+timestamp).toLocaleDateString('ru-RU', {
    timeZone: 'Europe/Moscow',
  });

export const convertTimestampToTimeMoscow = (timestamp: number) =>
  new Date(+timestamp)
    .toLocaleTimeString('ru-RU', {
      timeZone: 'Europe/Moscow',
    })
    .slice(0, 5);

export const convertNextDay = (timestamp: number): number => {
  const day = new Date(timestamp);
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);
  return +nextDay;
};

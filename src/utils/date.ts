export const dayLater = () => Date.now() + 1000 * 60 * 60 * 24;
export const fifthMinuteLater = () => Date.now() + 1000 * 60 * 5;
export const towMinuteLast = () => Date.now() - 1000 * 60 * 2;
export const weekLater = () => Date.now() + 1000 * 60 * 60 * 24 * 7;

export const convertUtcDateToFullDate = (timestamp: number) =>
  new Date(+timestamp).toLocaleDateString('ru-RU');

export const convertTimestampToTime = (timestamp: number) =>
  new Date(+timestamp).toLocaleTimeString('ru-RU').slice(0, 5);

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

export const convertDateTimeToMoscow = (timestamp: number) => {
  return +new Date(
    new Date(timestamp).toLocaleString('en-US', {
      timeZone: 'Europe/Moscow',
    }),
  );
};

export const convertNextDay = (timestamp: number): number => {
  const day = new Date(
    new Date(timestamp).toLocaleString('en-US', {
      timeZone: 'Europe/Moscow',
    }),
  );
  const nextDay = new Date(
    new Date(timestamp).toLocaleString('en-US', {
      timeZone: 'Europe/Moscow',
    }),
  );
  nextDay.setDate(day.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);
  return +nextDay;
};

export const getCurrentMoscowTimestamp = () => {
  return +new Date(
    new Date(Date.now()).toLocaleString('en-US', {
      timeZone: 'Europe/Moscow',
    }),
  );
};

export const dayLater = () => Date.now() + 1000 * 60 * 60 * 24;
export const fifthMinuteLater = () => Date.now() + 1000 * 60 * 5;
export const towMinuteLast = () => Date.now() - 1000 * 60 * 2;
export const hourLast = () => Date.now() - 1000 * 60 * 2;
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

export const createDate = (
  newDate: Date,
  month: string,
  day: string,
  year: string,
) => {
  const updateDate = newDate.setDate(+day);
  const updateMonth = new Date(updateDate).setMonth(+month - 1);
  return new Date(updateMonth).setFullYear(+year);
};

export function parseCustomDate(dateString: string) {
  const [day, month, year, hour, minute] = dateString.split('.').map(Number);
  return new Date(year, month - 1, day, hour, minute); // Преобразуем в объект Date
}

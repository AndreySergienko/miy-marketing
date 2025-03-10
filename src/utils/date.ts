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

export function formatDate(date: string): string {
  if (!date) return '';
  const [day, month, year] = date.split('.'); // Разделяем дату по точкам
  const formattedDay = day.padStart(2, '0'); // Добавляем ноль к дню, если нужно
  const formattedMonth = month.padStart(2, '0'); // Добавляем ноль к месяцу, если нужно
  return `${formattedDay}.${formattedMonth}.${year}`; // Формируем новую строку
}

export function normalizeTime(time: string): string {
  if (!time) return '';
  // Разделяем число по точке
  const [hours, minutes = '00'] = time.split('.');
  // Приводим к формату HH:mm
  return `${hours.padStart(2, '0')}:${minutes.padEnd(2, '0')}`;
}

export function timeToMinutes(time: string): string {
  if (!time) return '0';
  const [hours, minutes] = time.split('.').map(Number);
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes.toString();
}

export function convertMinutesToHoursAndMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return { hours, minutes: remainingMinutes };
}

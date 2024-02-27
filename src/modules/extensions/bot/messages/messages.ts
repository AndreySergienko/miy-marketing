export const startMessage =
  'Чтобы получить токен для регистрации, нажмите на кнопку';

export const btnToMessage = 'Получить токен для регистрации';

export const hasToken = (token: string) =>
  `Вы уже зарегистрированы в системе, ваш токен: ${token}`;

export const newToken = (token: string) =>
  `Вы успешно зарегистрированы! Ваш токен ${token}`;

import {
  IBuyChannelMessage,
  IValidationCancelChannelDto,
  IValidationChannelDto,
} from '../../../../channels/types/types';
import {
  convertTimestampToTimeMoscow,
  convertUtcDateToFullDateMoscow,
} from '../../../../utils/date';

export interface MessageChannelRegistrationDto {
  name: string;
  description: string;
  subscribers: number;
  link: string;
  price: number;
  day: string;
  slots: string[];
  format: string;
  categories: string[];
}

export class MessagesChannel {
  static get BTN_ACCEPT() {
    return 'Опубликовать';
  }

  static get BTN_CANCEL() {
    return 'Отклонить';
  }

  static get BTN_CHANGE() {
    return 'Изменить';
  }

  static get BTN_SEND() {
    return 'Отправить';
  }

  static get REASON_CANCEL_CHANNEL() {
    return 'Опишите причину один сообщением почему не удалось пройти проверку';
  }

  static ACCEPT_REGISTRATION({ name, day }: IValidationChannelDto) {
    return `Канал опубликован в списке ${name}, на день ${day}`;
  }

  static CANCEL_REGISTRATION({
    name,
    day,
    reason,
  }: IValidationCancelChannelDto) {
    return `Регистрация канала: ${name} слота на день: ${day} по причине ${reason}`;
  }

  static VALIDATE_MESSAGE(msg: string) {
    return `Сообщение на модерацию для рекламного поста: <br> ${msg}`;
  }

  static get SEND_MESSAGE_VERIFICATION() {
    return 'Пожалуйста, отправьте рекламный текст одним сообщением';
  }

  static CONFIRM_SEND_MESSAGE_VERIFICATION(msg: string) {
    return `Подтвердите корректность вашего сообщения: ${msg}`;
  }

  static get SUCCESS_SEND_TO_MODERATE() {
    return 'Ваше письмо успешно отправлено на модерацию';
  }

  static BUY_ADVERTISING({
    name,
    subscribers,
    price,
    format,
    date,
  }: IBuyChannelMessage) {
    const dateRu = convertUtcDateToFullDateMoscow(date);
    const timeRu = convertTimestampToTimeMoscow(date);
    return `
    Ув. пользователь

Вы хотите купить рекламный пост в канале: ${name}
Подписчики: ${subscribers}
Формат рекламы: ${format}
Цена: ${price}
Дата публикации: ${dateRu}
Время: ${timeRu}
`;
  }

  static REGISTRATION({
    name,
    description,
    subscribers,
    link,
    price,
    day,
    slots,
    categories,
    format,
  }: MessageChannelRegistrationDto) {
    return `Ув. администраторы

Запрос на регистрацию канала:
Наименование: <b>${name}</b>
Описание: ${description}
Подписчики: ${subscribers}
Ссылка: ${link}
Цена за слот: ${price}
Дата публикации: ${day}
Формат сообщения: ${format}
Доступные слоты:  [${slots}]
Категории: [${categories}]`;
  }
}

import type {
  IBuyChannelMessage,
  IValidationCancelChannelDto,
  IValidationChannelDto,
} from '../../../../channels/types/types';
import {
  convertTimestampToTime,
  convertUtcDateToFullDate,
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
  conditionCheck?: string;
}

export class MessagesChannel {
  static SLOT_IS_NOT_ACTIVE_STATUS() {
    return 'Слот уже опубликован или отклонён';
  }

  static MESSAGE_IS_VALIDATION(role: string) {
    return `Сообщение поставлено в очередь на реализацию: ${role}`;
  }

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
    return `Отмена публикации канала: ${name} слота на день: ${day} по причине ${reason}`;
  }

  static VALIDATE_MESSAGE(msg: string) {
    return `Сообщение на модерацию для рекламного поста:
${msg}`;
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
    conditionCheck,
  }: IBuyChannelMessage) {
    const dateRu = convertUtcDateToFullDate(date);
    const timeRu = convertTimestampToTime(date);
    return `
    Ув. пользователь

Вы хотите купить рекламный пост в канале: ${name}
Подписчики: ${subscribers}
Формат рекламы: ${format}
Цена: ${price}
Дата публикации: ${dateRu}
Время: ${timeRu}
Требования к модерации рекламного сообщения: ${conditionCheck}
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
    conditionCheck,
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
Категории: [${categories}]
Условия оценки: ${conditionCheck}`;
  }
}

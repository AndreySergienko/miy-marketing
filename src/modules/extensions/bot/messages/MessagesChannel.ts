import {
  IValidationCancelChannelDto,
  IValidationChannelDto,
} from '../../../../channels/types/types';

export interface MessageChannelRegistrationDto {
  name: string;
  description: string;
  subscribers: number;
  link: string;
  price: number;
  day: string;
  slots: string[];
  categories: string[];
}

export class MessagesChannel {
  static get BTN_ACCEPT() {
    return 'Опубликовать';
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

  static get BTN_CANCEL() {
    return 'Отклонить';
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
  }: MessageChannelRegistrationDto) {
    return `Ув. администраторы

Запрос на регистрацию канала:
Наименование: <b>${name}</b>
Описание: ${description}
Подписчики: ${subscribers}
Ссылка: ${link}
Цена за слот: ${price}
Дата публикации: ${day}
Доступные слоты:  [${slots}]
Категории: [${categories}]`;
  }
}

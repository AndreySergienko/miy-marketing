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

  static get BTN_CANCEL() {
    return 'Отклонить';
  }

  static get BTN_CHANGE_DESCRIPTION() {
    return 'Изменить описание';
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

Запрос на регистрацию канала: ${name}
Описание: ${description}
Подписчики: ${subscribers}
Ссылка: ${link}
Цена за слот: ${price}
Дата публикации: ${day}
Доступные слоты:  [${slots}]
Категории: [${categories}]`;
  }
}

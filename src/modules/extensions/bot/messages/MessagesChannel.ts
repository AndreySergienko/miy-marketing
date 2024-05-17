import type {
  IBuyChannelMessage,
  IValidationCancelChannelDto,
  IValidationChannelDto,
} from '../../../../channels/types/types';
import {
  convertTimestampToTime,
  convertUtcDateToFullDate,
} from '../../../../utils/date';
import { goToFront, mailSupport } from '../../../../utils/links';

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

  static get BTN_GO_TO_PERSONAL() {
    return 'Вернуться в личный кабинет';
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
    return `🎉Ура! Канал ${name}:${day} успешно добавлен на платформу!

Возвращайтесь на сайт и создавайте новые выгодные рекламные интеграции!

Все основную информацию и ответы на популярные вопросы о работе ON-Developer собрали здесь: ${goToFront()}

В случае возникновения вопросов обратитесь в поддержку: ${mailSupport()}`;
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

  static MESSAGE_SUCCESS_CANCEL(text: string) {
    return `Сообщение отклонёно, по причине: ${text}`;
  }

  static get SLOT_IS_NOT_AWAIT() {
    return 'Слот уже принят или отклонён';
  }

  static get CHANGE_MESSAGE_VERIFICATION() {
    return `Пожалуйста отправьте корректное сообщение ниже:`;
  }

  static get SEND_MESSAGE_VERIFICATION() {
    return `✅Операция успешно проведена! Желаем вам хороших результатов!

При возникновении технических проблем обращайтесь в поддержку: (почта)

С уважением,
ON-Developer

Прикрепите, пожалуйста рекламный текст сообщением ниже:`;
  }

  static CONFIRM_SEND_MESSAGE_VERIFICATION(msg: string) {
    return `Ваше сообщение: ${msg}
Нажмите отправить если всё верно или изменить для корректировки текущего сообщения:`;
  }

  static get SUCCESS_SEND_TO_MODERATE() {
    return 'Письмо было отправлено на подерацию. В ближайшее время мы уведомим вас о результатах. Спасибо!';
  }

  static BUY_ADVERTISING({
    name,
    subscribers,
    price,
    format,
    link,
    date,
    conditionCheck,
  }: IBuyChannelMessage) {
    const dateRu = convertUtcDateToFullDate(date);
    const timeRu = convertTimestampToTime(date);
    return `
    ✍️Вы подали заявку на рекламную интеграцию.
Как всегда, все перепроверяем:

Канал:  ${name}
Ссылка: ${link}
Подписчики: ${subscribers}
Дата: ${dateRu}
Время: ${timeRu}
Формат: ${format}
Цена: ${price}
Условия проверки рекламного сообщения: ${conditionCheck}
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

import {
  IBuyChannelMessage,
  ICreateAdvertisementMessage,
  IResetCashMessage,
  IValidationCancelChannelDto,
  IValidationChannelDto,
} from '../../../../channels/types/types';
import {
  convertTimestampToTime,
  convertUtcDateToFullDate,
} from '../../../../utils/date';
import { goToFront, mailSupport } from '../../../../utils/links';
import { ChannelDate } from 'src/channels/models/channel-dates.model';

export interface MessageChannelRegistrationDto {
  name: string;
  description: string;
  subscribers: number;
  dates: ChannelDate[];
  link: string;
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

  static RESET_CASH({ id, fio, email, productId, price }: IResetCashMessage) {
    return `Реклама не состоялась, пожалуйста, верните средства пользователю:

ID слота: ${id}
Сумма: ${price}
Email: ${email}
ФИО: ${fio}
Номер заказа: ${productId}`;
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
    return '❌Вы отклонили регистрацию канала. Аргументируйте свое решение: ';
  }

  static ACCEPT_REGISTRATION({ name }: IValidationChannelDto) {
    return `🎉Ура! Канал ${name} успешно добавлен на платформу!

Возвращайтесь на сайт и создавайте новые выгодные рекламные интеграции!

Все основную информацию и ответы на популярные вопросы о работе ON-Developer собрали здесь: ${goToFront()}

В случае возникновения вопросов обратитесь в поддержку: ${mailSupport()}`;
  }

  static get MODER_ACCEPT_REGISTRATION() {
    return `✅Вы одобрили регистрацию канала на платформу ON-DEVELOPER`;
  }

  static get MODER_CANCEL_REGISTRATION() {
    return `💬Ваш комментарий отправлен паблишеру`;
  }

  static CANCEL_REGISTRATION({ name, reason }: IValidationCancelChannelDto) {
    return `Отмена публикации канала: ${name} по причине ${reason}`;
  }

  static VALIDATE_MESSAGE(msg: string, conditionCheck: string) {
    return `🆕Новая заявка на рекламную интеграцию. Промодерируйте данные согласно установленным требованиям паблишер:

Требования: ${conditionCheck}
${msg}`;
  }

  static MESSAGE_SUCCESS_CANCEL(text: string) {
    return `Сообщение отклонёно, по причине: ${text}`;
  }

  static get SLOT_IS_NOT_AWAIT() {
    return 'Слот уже принят или отклонён';
  }

  static get CHANGE_MESSAGE_VERIFICATION() {
    return `✍️Отправьте отредактированное сообщение:`;
  }

  static ADMIN_CHANNEL_CREATE_ADVERTISEMENT({
    channelName,
    day,
    format,
    message,
  }: ICreateAdvertisementMessage) {
    return `🤝У Вас заключена рекламная интеграция:

Канал: ${channelName}
Дата: ${day}
Формат:  ${format}
Сообщение: ${message}`;
  }

  static MODERATOR_CREATE_ADVERTISEMENT({
    channelName,
    day,
    format,
    message,
  }: ICreateAdvertisementMessage) {
    return `☝️Рекламная интеграция поставлена в очередь. Необходимо проконтролировать публикацию:

Канал: ${channelName}
Дата: ${day}
Формат:  ${format}
Сообщение: ${message}`;
  }

  static ADVERTISER_CREATE_ADVERTISEMENT({
    channelName,
    day,
    format,
    message,
  }: ICreateAdvertisementMessage) {
    return `🤝Вы успешно заключили рекламную интеграцию:

Канал: ${channelName}
Дата: ${day}
Формат:  ${format}
Сообщение: ${message}`;
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
    return `🔎Ваша заявка была отправлена на модерацию. В ближайшее время мы сообщим Вам результат.`;
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
    dates,
    categories,
    conditionCheck,
  }: MessageChannelRegistrationDto) {
    const formattedDates = dates.map((date) => {
      return date.slots.map((slot) => {
        return `${date.date} - ${convertTimestampToTime(+slot.timestamp)} - ${slot.formatChannel.value} - ${slot.price}`;
      });
    });

    return `🆕Новая заявка на регистрацию канала на платформу ON-DEVELOPER:

Запрос на регистрацию канала:
Наименование: <b>${name}</b>
Описание: ${description}
Подписчики: ${subscribers}
Ссылка: ${link}
Даты: [${formattedDates}]
Категории: [${categories}]
Условия оценки: ${conditionCheck}`;
  }
}

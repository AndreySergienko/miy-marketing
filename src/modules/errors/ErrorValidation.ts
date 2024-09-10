import { createError } from './createError';

export default class ErrorValidation {
  static IS_STRING() {
    return createError('Поле должно быть строкой');
  }

  static IS_DAYS_INCORRECT() {
    return createError('Некорректная дата');
  }

  static IS_PASSWORD() {
    return createError(
      'Пароль должен содержать минимум 1 цифру, заглавную букву и спец символ',
    );
  }

  static IS_WORK_TYPE() {
    return createError('Некорректный тип лица (ИП или самозанятый)');
  }

  static IS_BANK() {
    return createError('Некорректный формат данных о банке');
  }

  static IS_INN() {
    return createError('Некорректный формат inn');
  }

  static IS_SLOT_INCORRECT() {
    return createError('Некорректная дата слотов');
  }

  static IS_BOOLEAN() {
    return createError('Поле должно быть булевским значением');
  }

  static IS_ARRAY() {
    return createError('Поле должно быть массивом');
  }

  static IS_EMAIL() {
    return createError('Некорректный формат e-mail');
  }

  static IS_NUMBER() {
    return createError('Поле должно быть числом');
  }

  static MIN_LENGTH(minLength: number) {
    return createError(`Минимальная длина поля ${minLength}`);
  }

  static MAX_LENGTH(maxLength: number) {
    return createError(`Максимальная длина поля ${maxLength}`);
  }

  static LENGTH(min: number, max: number) {
    return createError(`Минимальная длина поля ${min}, максимальная ${max}`);
  }
}

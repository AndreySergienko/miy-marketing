export default class ErrorValidation {
  static IS_STRING() {
    return {
      message: 'Поле должно быть строкой',
    };
  }

  static IS_INN() {
    return {
      message: 'Некорректный формат inn',
    };
  }

  static IS_BOOLEAN() {
    return {
      message: 'Поле должно быть булевским значением',
    };
  }

  static IS_ARRAY() {
    return {
      message: 'Поле должно быть массивом',
    };
  }

  static IS_EMAIL() {
    return {
      message: 'Некорректный формат e-mail',
    };
  }

  static IS_NUMBER() {
    return {
      message: 'Поле должно быть числом',
    };
  }

  static MIN_LENGTH(minLength: number) {
    return {
      message: `Минимальная длина поля ${minLength}`,
    };
  }

  static MAX_LENGTH(maxLength: number) {
    return {
      message: `Максимальная длина поля ${maxLength}`,
    };
  }

  static LENGTH(min: number, max: number) {
    return {
      message: `Минимальная длина поля ${min}, максимальная ${max}`,
    };
  }
}

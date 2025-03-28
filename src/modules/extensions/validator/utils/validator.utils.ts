function checkSumINN(inn: string, coefficients: number[]) {
  let n = 0;
  for (const i in coefficients) {
    n += coefficients[i] * +inn[i];
  }

  const control = n % 11;
  return control > 9 ? control % 10 : control;
}

export function validateINN(value: string) {
  if (!/^\d{10}$/.test(value) && !/^\d{12}$/.test(value)) {
    return false;
  }

  switch (value.length) {
    case 10: {
      const sum10 = checkSumINN(value, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
      return sum10 === +value[9];
    }
    case 12: {
      const sum11 = checkSumINN(value, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
      const sum12 = checkSumINN(value, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);

      return sum11 === +value[10] && sum12 === +value[11];
    }
  }

  return false;
}

export function validatePassword(string: string) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/gm;
  return regex.test(string);
}

export const validateBik = (value: string) => {
  return /04[0-9]{4}(000|001|002|(0[5-9][0-9])|([1-9][0-9]{2}))/.test(value);
};

export const validateCorrespondentAccount = (value: string) => {
  return /301[0-9]{17}/.test(value);
};

export const validateCurrentAccount = (value: string) => {
  return /408[0-9]{17}/.test(value);
};

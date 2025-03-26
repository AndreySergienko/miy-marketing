export const getFormatChannelDuration = (value: string) => {
  if (value.length === 4) {
    return Number(value.slice(2, 4));
  } else if (value.length === 5) {
    return Number(value.slice(3, 5));
  }
};

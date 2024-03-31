export const getToken = (req: Request) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error;
  const token = req.headers.authorization;
  const tokenSplit = token.split(' ');
  return tokenSplit[1];
};

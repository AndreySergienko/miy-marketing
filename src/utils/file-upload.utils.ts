import { extname } from 'path';
import type { Express } from 'express';
import 'multer';

export const editFileName = (
  _: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const documentFileFilter = (
  _: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const isInvalidDocument = !file.originalname.match(/\.(txt|doc|docx|pdf)$/);
  const error = isInvalidDocument
    ? new Error('Документ имеет недопустимый формат')
    : null;

  return callback(error, !isInvalidDocument);
};

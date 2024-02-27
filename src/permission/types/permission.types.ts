import { IsString, Length } from 'class-validator';
import ErrorValidation from '../../modules/errors/ErrorValidation';
import {
  MAX_LENGTH_PERMISSION_NAME,
  MIN_LENGTH_PERMISSION_NAME,
} from '../../constants/validate.value';

export interface PermissionModelAttrs {
  value: string;
  description: string;
}

export class PermissionCreateDto implements PermissionModelAttrs {
  @IsString(ErrorValidation.IS_STRING())
  @Length(
    MIN_LENGTH_PERMISSION_NAME,
    MAX_LENGTH_PERMISSION_NAME,
    ErrorValidation.LENGTH(
      MIN_LENGTH_PERMISSION_NAME,
      MAX_LENGTH_PERMISSION_NAME,
    ),
  )
  value: string;

  @IsString(ErrorValidation.IS_STRING())
  description: string;
}

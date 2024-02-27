import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  private readonly messages;

  constructor(response) {
    super(response, HttpStatus.BAD_REQUEST);
    this.message = response;
  }
}

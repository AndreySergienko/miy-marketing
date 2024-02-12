import {ArgumentMetadata, Injectable, PipeTransform} from "@nestjs/common";
import {plainToInstance} from "class-transformer";
import {validate} from "class-validator";
import {ValidationException} from "../exceptions/validation.exception";

@Injectable()
export class ValidationPipe implements PipeTransform {
    async transform<T>(value: T, metadata: ArgumentMetadata) {
        const obj = plainToInstance(metadata.metatype, value);
        const errors = await validate(obj)

        if (errors.length) {
            let errorConfig = {};

            for (const error of errors) {
                console.log(error)
                errorConfig[error.property] = error.constraints
            }

            throw new ValidationException([errorConfig])
        }
        return value
    }
}
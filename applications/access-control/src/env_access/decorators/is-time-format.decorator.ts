import { ValidateBy, ValidationArguments, ValidationOptions } from "class-validator";

export function IsTimeFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    ValidateBy(
      {
        name: "isTimeFormat",
        constraints: [],
        validator: {
          validate(value: any, args: ValidationArguments) {
            const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
            return typeof value === "string" && timePattern.test(value);
          },
          defaultMessage(args: ValidationArguments) {
            return `${args.property} must be a valid time in the format HH:MM:SS`;
          },
        },
      },
      validationOptions
    )(object, propertyName);
  };
}

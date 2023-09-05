import { ValidateBy, ValidationArguments, ValidationOptions } from "class-validator";

export function IsDateFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    ValidateBy(
      {
        name: "isDateFormat",
        constraints: [],
        validator: {
          validate(value: any, args: ValidationArguments) {
            const datePattern = /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;
            return typeof value === "string" && datePattern.test(value);
          },
          defaultMessage(args: ValidationArguments) {
            return `${args.property} must be a valid date in the format YYYY/MM/DD`;
          },
        },
      },
      validationOptions
    )(object, propertyName);
  };
}

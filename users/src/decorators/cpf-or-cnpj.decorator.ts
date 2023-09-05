import { ValidateBy, ValidationArguments, ValidationOptions } from "class-validator";

export function isValidCPF(value: string): boolean {
  const cpfPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (!cpfPattern.test(value)) {
    return false;
  }

  const cleanedCPF = value.replace(/\D/g, ""); // Remove non-digit characters
  const cpfDigits = Array.from(cleanedCPF).map(Number);

  // Validate CPF digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += cpfDigits[i] * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== cpfDigits[9]) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += cpfDigits[i] * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== cpfDigits[10]) {
    return false;
  }

  return true;
}

export function isValidCNPJ(value: string): boolean {
  const cnpjPattern = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  if (!cnpjPattern.test(value)) {
    return false;
  }

  const cleanedCNPJ = value.replace(/\D/g, ""); 
  const cnpjDigits = Array.from(cleanedCNPJ).map(Number);

  let sum = 0;
  let factor = 5;
  for (let i = 0; i < 12; i++) {
    sum += cnpjDigits[i] * factor;
    factor = factor === 2 ? 9 : factor - 1;
  }
  
  let remainder = sum % 11;
  if (remainder < 2) {
    remainder = 0;
  } else {
    remainder = 11 - remainder;
  }
  if (remainder !== cnpjDigits[12]) {
    return false;
  }

  sum = 0;
  factor = 6;
  for (let i = 0; i < 13; i++) {
    sum += cnpjDigits[i] * factor;
    factor = factor === 2 ? 9 : factor - 1;
  }
  remainder = sum % 11;
  if (remainder < 2) {
    remainder = 0;
  } else {
    remainder = 11 - remainder;
  }
  if (remainder !== cnpjDigits[13]) {
    return false;
  }

  return true;
}

export function IsCPFOrCNPJ(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    ValidateBy(
      {
        name: "isCPFOrCNPJ",
        constraints: [],
        validator: {
          validate(value: any, args: ValidationArguments) {
            return isValidCPF(value) || isValidCNPJ(value);
          },
          defaultMessage(args: ValidationArguments) {
            return "Invalid CPF or CNPJ provided";
          },
        },
      },
      validationOptions
    )(object, propertyName);
  };
}
import dayjs from 'dayjs';
import { date, string } from 'zod';
import { DATE_FORMAT } from './regex';
import { isLeapYearDate } from './date';

export const dateValidator = date()
  .min(dayjs().toDate(), 'La fecha no puede ser menor a la fecha actual')
  .superRefine((value, ctx) => {
    if (!dayjs(value).isValid())
      return ctx.addIssue({
        code: 'invalid_date',
        message: 'Formato de fecha invalida',
      });
  });

export const dateFormatValidator = string()
  .regex(DATE_FORMAT)
  .superRefine((value, ctx) => {
    const splitDate = value.split('-');
    const month = splitDate[0];
    const day = splitDate[1];
    const year = splitDate[2];

    if (
      typeof month === 'undefined' ||
      typeof day === 'undefined' ||
      typeof year === 'undefined'
    ) {
      return ctx.addIssue({
        code: 'invalid_date',
        message: 'Formato de fecha invalida',
      });
    }

    if (
      parseInt(month) > 12 ||
      parseInt(month) < 1 ||
      parseInt(day) > 31 ||
      parseInt(day) < 1
    ) {
      return ctx.addIssue({
        code: 'invalid_date',
        message:
          'Formato de fecha invalida. Recuerde, el formato es MES-DIA-AÑO',
      });
    }

    const isLeapYear = isLeapYearDate(value);

    if (isLeapYear && parseInt(month) === 2 && parseInt(day) > 29) {
      return ctx.addIssue({
        code: 'invalid_date',
        message:
          'Formato de fecha invalida. Febrero solo tiene 29 dias en años bisiestos',
      });
    }

    if (!isLeapYear && parseInt(month) === 2 && parseInt(day) > 28) {
      return ctx.addIssue({
        code: 'invalid_date',
        message:
          'Formato de fecha invalida. Febrero solo tiene 28 dias en años no bisiestos',
      });
    }
  });

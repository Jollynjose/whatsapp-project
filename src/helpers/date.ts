import dayjs from 'dayjs';
import * as isLeapYear from 'dayjs/plugin/isLeapYear';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isLeapYear.default);
dayjs.extend(isSameOrAfter.default);
dayjs.extend(isSameOrBefore.default);
dayjs.extend(isBetween.default);

export const isLeapYearDate = (date: string): boolean =>
  dayjs(date).isLeapYear();

export const isSameOrAfterDate = (
  date: string,
  dateToCompare: string,
): boolean => dayjs(date).isSameOrAfter(dateToCompare);

export const isSameOrBeforeDate = (
  date: string,
  dateToCompare: string,
): boolean => dayjs(date).isSameOrBefore(dateToCompare);

export const isBetweenDate = (
  date: string,
  startDate: string,
  endDate: string,
): boolean => dayjs(date).isBetween(startDate, endDate);

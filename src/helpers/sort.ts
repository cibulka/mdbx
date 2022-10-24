import dayjs from 'dayjs';
import { DbItem } from '../types';

export function sortDbItemByDate(mdx: DbItem[]) {
  return mdx.sort((a, b) => {
    const aDate = typeof a.data.date === 'string' ? a.data.date : a.dateCreated;
    const bDate = typeof b.data.date === 'string' ? b.data.date : b.dateCreated;
    return dayjs(bDate).diff(aDate);
  });
}

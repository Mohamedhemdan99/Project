import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getTimeAgo = (dateString: string | Date) => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true })
      .replace('about ', '')
      .replace('less than a minute ago', 'now')
      .replace('minute', 'm')
      .replace('hour', 'h')
      .replace(' day', 'd')
      .replace(' week', 'w')
      .replace(' month', 'mo')
      .replace(' year', 'y');
  } catch {
    return 'now';
  }
};
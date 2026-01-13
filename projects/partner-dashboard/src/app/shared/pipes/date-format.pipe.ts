import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns'; // Assuming date-fns is installed

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {

  transform(value: Date | string | null | undefined, formatString: string = 'shortDate'): string | null {
    if (value == null) {
      return null;
    }

    try {
      const date = typeof value === 'string' ? new Date(value) : value;

      if (isNaN(date.getTime())) {
        return null; // Invalid date
      }

      // Use date-fns for formatting
      return format(date, this.getFormat(formatString));

    } catch (error) {
      console.error('Error formatting date:', error);
      return null; // Handle potential errors
    }
  }

  private getFormat(formatString: string): string {
    switch (formatString) {
      case 'shortDate':
        return 'MM/dd/yyyy';
      case 'longDate':
        return 'EEEE, MMMM d, yyyy';
      case 'shortTime':
        return 'h:mm a';
      case 'longTime':
        return 'h:mm:ss a zzz';
      case 'full':
        return 'EEEE, MMMM d, yyyy h:mm:ss a zzz';
      default:
        return formatString; // Use the provided format string if not a predefined one
    }
  }
}
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, currencyCode: string = 'USD'): string | null {
    if (value == null) {
      return null;
    }

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).format(value);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return value.toFixed(2); // Fallback to fixed decimal places
    }
  }
}
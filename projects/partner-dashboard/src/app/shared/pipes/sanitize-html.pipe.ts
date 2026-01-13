import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeHtml',
  standalone: true
})
export class SanitizeHtmlPipe implements PipeTransform {

  constructor(private domSanitizer: DomSanitizer) { }

  transform(value: string | null): SafeHtml {
    if (value === null) {
      return '';
    }
    return this.domSanitizer.bypassSecurityTrustHtml(value);
  }

}
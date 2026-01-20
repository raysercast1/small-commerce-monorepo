import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Cart } from '../../../../shared/types/storefront-types';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe],
  templateUrl: './order-summary.html',
  styleUrls: ['./order-summary.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderSummaryComponent {
  cart = input.required<Cart>();
}

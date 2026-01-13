import { Component, ElementRef, inject, input, output, signal, viewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, CardClickedEvent } from '../../../features/items/components/card/card';
import { ActionToolbar } from '../action-toolbar/action-toolbar';

@Component({
  selector: 'app-card-grid',
  standalone: true,
  imports: [CommonModule, Card, ActionToolbar],
  templateUrl: './card-grid.html',
  styleUrls: ['./card-grid.css']
})
export class CardGrid {
  cardsData = input.required<any[]>();
  toolbarTitle = input<string>('Items');
  // Optional extra action display props
  extraActionLabel = input<string | null>(null);
  extraActionIcon = input<string>('add');
  // Second optional extra action
  extraAction2Label = input<string | null>(null);
  extraAction2Icon = input<string>('attach_money');

  selectedCardIndex = signal<number | null>(null);
  showToolbar = signal(false);
  toolbarGridRowStart = signal(1);

  cardClicked = output<any>();
  editClicked = output<any>();
  removeClicked = output<any>();
  infoClicked = output<any>();
  extraActionClicked = output<any>();
  extraAction2Clicked = output<any>();

  private el = inject(ElementRef);
  cardComponents = viewChildren(Card, { read: ElementRef });

  onCardClicked(eventData: CardClickedEvent): void {
    const currentIndex = this.selectedCardIndex();
    const wasToolbarOpen = this.showToolbar();

    if (currentIndex === eventData.index) {
      this.selectedCardIndex.set(null);
      this.showToolbar.set(false);
    } else {
      if (wasToolbarOpen) {
        this.showToolbar.set(false);
      }

      setTimeout(() => {
        this.selectedCardIndex.set(eventData.index);
        this.showToolbar.set(true);
        this.calculateToolbarPosition(eventData.index);

        setTimeout(() => {
          this.scrollToCard(eventData.index);
        }, 100);

      }, wasToolbarOpen ? 50 : 0);
    }
    this.cardClicked.emit(eventData.cardData);
  }

  private scrollToCard(index: number): void {
    const cardToScroll = this.cardComponents()[index]?.nativeElement;
    if (cardToScroll) {
      cardToScroll.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  calculateToolbarPosition(index: number) {
    const style = getComputedStyle(this.el.nativeElement);
    const columns = style.getPropertyValue('--grid-columns');
    const cardsPerRow = parseInt(columns, 10) || 4;

    this.toolbarGridRowStart.set(Math.floor(index / cardsPerRow) + 2);
  }

  selectedCard() {
    const index = this.selectedCardIndex();
    if (index !== null && this.cardsData().length > index) {
      return this.cardsData()[index];
    }
    return null;
  }

  onEdit() {
    this.editClicked.emit(this.selectedCard());
  }

  onRemove() {
    this.removeClicked.emit(this.selectedCard());
  }

  onInfo() {
    this.infoClicked.emit(this.selectedCard());
  }

  onExtraAction() {
    this.extraActionClicked.emit(this.selectedCard());
  }

  onExtraAction2() {
    this.extraAction2Clicked.emit(this.selectedCard());
  }
}

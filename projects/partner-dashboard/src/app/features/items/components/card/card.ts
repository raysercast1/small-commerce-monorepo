import { Component, ElementRef, output, OutputEmitterRef, HostBinding, input } from '@angular/core';

interface CardData {
  title: string;
  itemType: string;
}

export interface CardClickedEvent {
  cardData: CardData;
  index: number;
  elRef: ElementRef;
}

@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  cardData = input.required<CardData>();
  cardIndex = input.required<number>();
  isSelected = input(false);

  @HostBinding('class.selected-card') get isSelectedClass() {
    return this.isSelected();
  }

  readonly cardClicked: OutputEmitterRef<CardClickedEvent> = output<CardClickedEvent>();

  constructor(private el: ElementRef) {}

  onCardClick(): void {
    console.log("Card clicked: ", this.cardData());
    console.log("Emitting ElementRef with index:", this.cardIndex());
    this.cardClicked.emit({ cardData: this.cardData(), index: this.cardIndex(), elRef: this.el });
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CardGrid } from './card-grid';
import { Card } from '../../../features/items/components/card/card';
import { ActionToolbar } from '../action-toolbar/action-toolbar';
import { describe, test, expect, beforeEach, vi } from 'vitest';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

describe('CardGrid (Zoneless)', () => {
  let fixture: ComponentFixture<CardGrid>;
  let component: CardGrid;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGrid, Card, ActionToolbar],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CardGrid);
    component = fixture.componentInstance;
  });

  test('should create the component', () => {
    expect(component).toBeTruthy();
  });

  test('should render the correct number of app-card components', async () => {
    fixture.componentRef.setInput('cardsData', [{id: '1', title: 'Card 1' }, { id: '2', title: 'Card 2' }]);
    await fixture.whenStable();
    const cardElements = fixture.nativeElement.querySelectorAll('app-card');
    expect(cardElements.length).toBe(2);
  });

  test('should show the action toolbar on first card click', async () => {
    fixture.componentRef.setInput('cardsData', [{ id: '3', title: 'Card 3' }]);
    await fixture.whenStable();
    const cardElement = fixture.debugElement.query(By.directive(Card));
    cardElement.componentInstance.cardClicked.emit({ index: 0, cardData: { id: '3', title: 'Card 3' } });
    await delay(0);
    await fixture.whenStable();
    expect(component.showToolbar()).toBe(true);
    const toolbar = fixture.debugElement.query(By.directive(ActionToolbar));
    expect(toolbar).not.toBeNull();
  });

  test('should hide the action toolbar on second card click', async () => {
    fixture.componentRef.setInput('cardsData', [{ id: '5', title: 'Card 5' }]);
    await fixture.whenStable();
    const cardElement = fixture.debugElement.query(By.directive(Card));
    cardElement.triggerEventHandler('click', { index: 0, cardData: { id: '5', title: 'Card 5' } });
    await delay(0);
    await fixture.whenStable();
    cardElement.triggerEventHandler('click', { index: 0, cardData: { id: '5', title: 'Card 5' } });
    await fixture.whenStable();
    expect(component.showToolbar()).toBe(false);
    const toolbar = fixture.debugElement.query(By.directive(ActionToolbar));
    expect(toolbar).toBeNull();
  });

  test('should move the action toolbar when a new card is clicked', async () => {
    fixture.componentRef.setInput('cardsData', [{ id: '10', title: 'Card 10' }, { id: '20', title: 'Card 20' }]);
    await fixture.whenStable();
    const cardElements = fixture.debugElement.queryAll(By.directive(Card));
    cardElements[0].componentInstance.cardClicked.emit({ index: 0, cardData: { id: '10', title: 'Card 10' } });
    await delay(60);
    await fixture.whenStable();
    cardElements[1].componentInstance.cardClicked.emit({ index: 1, cardData: { id: '20', title: 'Card 20' } });
    await delay(60);
    await fixture.whenStable();
    expect(component.selectedCardIndex()).toBe(1);
    expect(component.showToolbar()).toBe(true);
  });

  test('should emit editClicked when the edit button is clicked in the toolbar', async () => {
    const editClickedSpy = vi.spyOn(component.editClicked, 'emit');
    fixture.componentRef.setInput('cardsData', [{ id: '10', title: 'Card 10' }]);
    await fixture.whenStable();
    const cardElement = fixture.debugElement.query(By.directive(Card));
    cardElement.componentInstance.cardClicked.emit({ index: 0, cardData: { id: '10', title: 'Card 10' } });
    await delay(0);
    await fixture.whenStable();
    const toolbar = fixture.debugElement.query(By.directive(ActionToolbar));
    toolbar.triggerEventHandler('editClicked', null);
    await fixture.whenStable();
    expect(editClickedSpy).toHaveBeenCalledWith({ id: '10', title: 'Card 10' });
  });

  test('should emit removeClicked when the remove button is clicked in the toolbar', async () => {
    const removeClickedSpy = vi.spyOn(component.removeClicked, 'emit');
    fixture.componentRef.setInput('cardsData', [{ id: '100', title: 'Card 100' }]);
    await fixture.whenStable();
    const cardElement = fixture.debugElement.query(By.directive(Card));
    cardElement.componentInstance.cardClicked.emit({ index: 0, cardData: { id: '100', title: 'Card 100' } });
    await delay(0);
    await fixture.whenStable();
    const toolbar = fixture.debugElement.query(By.directive(ActionToolbar));
    toolbar.triggerEventHandler('removeClicked', null);
    await fixture.whenStable();
    expect(removeClickedSpy).toHaveBeenCalledWith({ id: '100', title: 'Card 100' });
  });

  test('should emit infoClicked when the info button is clicked in the toolbar', async () => {
    const infoClickedSpy = vi.spyOn(component.infoClicked, 'emit');
    fixture.componentRef.setInput('cardsData', [{ id: '200', title: 'Card 200' }]);
    await fixture.whenStable();
    const cardElement = fixture.debugElement.query(By.directive(Card));
    cardElement.componentInstance.cardClicked.emit({ index: 0, cardData: { id: '200', title: 'Card 200' } });
    await delay(0);
    await fixture.whenStable();
    const toolbar = fixture.debugElement.query(By.directive(ActionToolbar));
    toolbar.triggerEventHandler('infoClicked', null);
    await fixture.whenStable();
    expect(infoClickedSpy).toHaveBeenCalledWith({ id: '200', title: 'Card 200' });
  });
});

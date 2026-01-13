import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CrossFunctionalActions } from './cross-functional-actions';
import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('CrossFunctionalActions (Zoneless)', () => {
  let fixture: ComponentFixture<CrossFunctionalActions>;
  let component: CrossFunctionalActions;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossFunctionalActions],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CrossFunctionalActions);
    component = fixture.componentInstance;
  });

  test('should create the component', () => {
    expect(component).toBeTruthy();
  });

  test('should render all four action cards with correct text and icons', async () => {
    await fixture.whenStable();

    const cards = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(cards.length).toBe(4);

    const cardDetails = cards.map(cardEl => {
        const icon = cardEl.query(By.css('mat-icon')).nativeElement.textContent.trim();
        const span = cardEl.query(By.css('span')).nativeElement.textContent.trim();
        return { icon, span };
    });

    expect(cardDetails).toEqual([
        { icon: 'add', span: 'Add' },
        { icon: 'edit', span: 'Edit' },
        { icon: 'delete', span: 'Delete' },
        { icon: 'help_outline', span: 'How-to' },
    ]);
  });

  test('should emit createClicked event when the Add card is clicked', async () => {
    await fixture.whenStable();
    const createClickedSpy = vi.spyOn(component.createClicked, 'emit');
    
    const addCard = fixture.debugElement.query(By.css('mat-card'));
    addCard.triggerEventHandler('click', null);

    await fixture.whenStable();
    expect(createClickedSpy).toHaveBeenCalled();
  });

  test('should emit editClicked event when the Edit card is clicked', async () => {
    await fixture.whenStable();
    const editClickedSpy = vi.spyOn(component.editClicked, 'emit');

    const editCard = fixture.debugElement.queryAll(By.css('mat-card'))[1];
    editCard.triggerEventHandler('click', null);

    await fixture.whenStable();
    expect(editClickedSpy).toHaveBeenCalled();
  });

  test('should emit removeClicked event when the Delete card is clicked', async () => {
    await fixture.whenStable();
    const removeClickedSpy = vi.spyOn(component.removeClicked, 'emit');

    const removeCard = fixture.debugElement.queryAll(By.css('mat-card'))[2];
    removeCard.triggerEventHandler('click', null);

    await fixture.whenStable();
    expect(removeClickedSpy).toHaveBeenCalled();
  });

  test('should emit howToClicked event when the How-to card is clicked', async () => {
    await fixture.whenStable();
    const howToClickedSpy = vi.spyOn(component.howToClicked, 'emit');
    
    const howToCard = fixture.debugElement.queryAll(By.css('mat-card'))[3];
    howToCard.triggerEventHandler('click', null);

    await fixture.whenStable();
    expect(howToClickedSpy).toHaveBeenCalled();
  });
});

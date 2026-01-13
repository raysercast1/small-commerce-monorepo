import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ActionToolbar } from './action-toolbar';
import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('ActionToolbar (Zoneless)', () => {
  let fixture: ComponentFixture<ActionToolbar>;
  let component: ActionToolbar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionToolbar, MatIconModule, MatButtonModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  test('should create the component', () => {
    expect(component).toBeTruthy();
  });

  test('should render Edit, Remove, and Info buttons', async () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(3);

    const buttonDetails = buttons.map(buttonEl => {
        const icon = buttonEl.query(By.css('mat-icon')).nativeElement.textContent.trim();
        // Get the button's full text content, which includes the icon's text.
        const fullText = buttonEl.nativeElement.textContent.trim();
        // Remove the icon's text from the full text to isolate the label.
        const span = fullText.replace(icon, '').trim();
        return { icon, span };
    });

    expect(buttonDetails).toEqual([
        { icon: 'edit', span: 'Edit' },
        { icon: 'delete', span: 'Remove' },
        { icon: 'info', span: 'Info' },
    ]);
  });

  test('should emit editClicked event when the Edit button is clicked', async () => {
    const editClickedSpy = vi.spyOn(component.editClicked, 'emit');

    const editButton = fixture.debugElement.query(By.css('button'));
    editButton.triggerEventHandler('click', null);

    await fixture.whenStable();
    expect(editClickedSpy).toHaveBeenCalled();
  });

  test('should emit removeClicked event when the Remove button is clicked', async () => {
    const removeClickedSpy = vi.spyOn(component.removeClicked, 'emit');

    const removeButton = fixture.debugElement.queryAll(By.css('button'))[1];
    removeButton.triggerEventHandler('click', null);

    await fixture.whenStable();
    expect(removeClickedSpy).toHaveBeenCalled();
  });

  test('should emit infoClicked event when the Info button is clicked', async () => {
    const infoClickedSpy = vi.spyOn(component.infoClicked, 'emit');

    const infoButton = fixture.debugElement.queryAll(By.css('button'))[2];
    infoButton.triggerEventHandler('click', null);

    await fixture.whenStable();
    expect(infoClickedSpy).toHaveBeenCalled();
  });
});

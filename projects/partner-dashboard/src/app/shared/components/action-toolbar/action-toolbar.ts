import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-action-toolbar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './action-toolbar.html',
  styleUrls: ['./action-toolbar.css']
})
export class ActionToolbar {
  title = input<string>('Actions');

  // Optional extra action properties
  extraActionLabel = input<string | null>(null);
  extraActionIcon = input<string>('add');
  // Second optional extra action (e.g., Go to Price)
  extraAction2Label = input<string | null>(null);
  extraAction2Icon = input<string>('attach_money');

  editClicked = output<void>();
  removeClicked = output<void>();
  infoClicked = output<void>();
  extraActionClicked = output<void>();
  extraAction2Clicked = output<void>();

  onEdit() {
    this.editClicked.emit();
  }

  onRemove() {
    this.removeClicked.emit();
  }

  onInfo() {
    this.infoClicked.emit();
  }

  onExtraAction() {
    this.extraActionClicked.emit();
  }

  onExtraAction2() {
    this.extraAction2Clicked.emit();
  }
}

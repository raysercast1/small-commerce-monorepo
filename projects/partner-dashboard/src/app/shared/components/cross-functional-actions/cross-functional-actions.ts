import { Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cross-functional-actions',
  templateUrl: './cross-functional-actions.html',
  styleUrls: ['./cross-functional-actions.css'],
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
})
export class CrossFunctionalActions {
  createClicked = output<void>();
  editClicked = output<void>();
  removeClicked = output<void>();
  howToClicked = output<void>();
}

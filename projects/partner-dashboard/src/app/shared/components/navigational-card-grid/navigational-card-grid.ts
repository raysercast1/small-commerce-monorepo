import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Card } from '../../../features/items/components/card/card';

export interface NavCardData {
  title: string;
  route: string;
  itemType: string;
}

@Component({
  selector: 'app-navigational-card-grid',
  standalone: true,
  imports: [CommonModule, RouterModule, Card],
  templateUrl: './navigational-card-grid.html',
  styleUrls: ['./navigational-card-grid.css']
})
export class NavigationalCardGrid {
  cards = input.required<NavCardData[]>();
}

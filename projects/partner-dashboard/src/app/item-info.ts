import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ItemInfo {

  constructor() { }

  getItemInfo(itemType: string, itemId?: string): any {
    // In a real application, you would fetch data from a backend or other source
    // based on itemType and itemId.
    switch (itemType) {
      case 'store':
        return {
          title: 'How to Manage Stores',
          description: 'Learn how to add, edit, and remove stores in your dashboard.',
          videoUrl: 'https://www.example.com/store-how-to-video' // Placeholder URL
        };
      case 'product':
        return {
          title: 'How to Manage Products',
          description: 'Learn how to add, edit, and manage your product catalog.',
          videoUrl: 'https://www.example.com/product-how-to-video' // Placeholder URL
        };
      // Add cases for other item types (price, inventory, etc.)
      default:
        return {
          title: 'General Information',
          description: 'No specific how-to information available for this item type.',
          videoUrl: null
        };
    }
  }
}

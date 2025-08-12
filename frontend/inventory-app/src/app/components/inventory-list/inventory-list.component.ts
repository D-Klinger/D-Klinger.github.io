/**
 * InventoryList
 * Displays all the inventory items from the backend.
 * Provides methods to navigate to "add" and "edit" forms.
 * Provides method to delete items.
 * Displays sorts and searches inventory items.
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.css',
  standalone: true
})
export class InventoryList implements OnInit {
  items: any[] = [];
  filteredAndSortedItems: any[] = [];
  errorMessage = '';
  userName = '';
  sortField: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';
  sortFields = [
    { label: 'Name', value: 'name' },
    { label: 'Quantity', value: 'quantity' },
    { label: 'Price', value: 'price' },
    { label: 'Location', value: 'location' },
    { label: 'Category', value: 'category' }
  ]
  quantityRange = [0, 500];
  priceRange = [0, 1000.00];
  reorderRange = [0, 500];
  categoryList = [
    'Produce', 'Dairy', 'Meat', 'Seafood', 'Bakery', 'Frozen Food', 'Canned Goods', 
    'Snacks', 'Candy', 'Beverages', 'Deli', 'Pasta', 'Breakfast Foods', 'Condiments',
    'Sauces', 'Spices', 'Seasonings', 'International Foods', 'Baby Products', 'Hygiene',
    'Household Supplies', 'Cleaning Products', 'Pet Supplies', 'Health and Wellness',
    'Pharmacy', 'Baking Supplies', 'Dairy Alternatives', 'Prepared Foods', 'Beer', 'Wine'
    ];

    selectedCategories: { [key: string]: boolean } = {};

  constructor(
    private inventoryService: InventoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchItems();
    this.fetchUser();
  }

  fetchUser() {
    this.authService.getProfile().subscribe({
      next: user => {
        this.userName = user.userName || user.email  || '';
      },
      error: () => {
        this.userName = '';
      }
    });
  }

  fetchItems() {
    this.inventoryService.getItems().subscribe({
      next: (res) => {
        this.items = res.items || [];
        this.applyFilterAndSort();
      },
      error: () => {
        this.errorMessage = 'Unable to retrieve items listing.'
      }
    });
  }

  addItem() {
    this.router.navigate(['/inventory/add']);
  }

  editItem(item: any) {
    this.router.navigate(['/inventory/edit', item._id]);
  }

  deleteItem(item: any) {
    if(confirm(`Delete the item(s) named: "${item.name}"?`)) {
      this.inventoryService.deleteItem(item._id).subscribe({
        next: () => {
          this.fetchItems();
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = err.error?.message || "Unable to delete item. Please try again later.";
        }
      });
    }
  }

  resetFilters() {
    this.sortField = 'name';
    this.sortDirection = 'asc';

    this.searchTerm = '';

    this.quantityRange = [0, 500];
    this.priceRange = [0, 1000.00];
    this.reorderRange = [0, 500];

    for (const cat of this.categoryList) {
      this.selectedCategories[cat] = false;
    }
    
    this.applyFilterAndSort();
  }

  incrementQuantity(item: any) {
    const updated = { ...item, quantity: item.quantity + 1};
    this.inventoryService.updateItem(item._id, updated).subscribe({
      next: () => this.fetchItems(),
      error: () => this.errorMessage = "Unable to increment the item quantity."
    })
  }

  decrementQuantity(item: any) {
    if(item.quantity > 0) {
      const updated = { ...item, quantity: item.quantity - 1};
      this.inventoryService.updateItem(item._id, updated).subscribe({
        next: () => this.fetchItems(),
        error: () => this.errorMessage = "Unable to decrement the item quantity."
      })
    }
  }

  setSort(field: string) {
    this.sortField = field;
    this.applyFilterAndSort();
  }

  setSortDirection(direction: 'asc' | 'desc') {
    this.sortDirection = direction;
    this.applyFilterAndSort();
  }

  onSearchSubmit(event: Event) {
    event.preventDefault();

    const valid = /^[a-zA-Z0-9 \-_,.]*$/.test(this.searchTerm || '');
    if(!valid) {
      this.errorMessage = "Invalid characers entered into your search"
      return;
    }
    this.applyFilterAndSort();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilterAndSort();
  }

  applyFilterAndSort() {
    let result = this.items;

    if(this.searchTerm && this.searchTerm.trim().length > 0) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(item =>
        (item.name || '').toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term) ||
        (item.supplier || '').toLowerCase().includes(term)
      );      
    }

    result = result.filter(item =>
      item.quantity >= this.quantityRange[0] && item.quantity <= this.quantityRange[1]
    );

    result = result.filter(item =>
      item.price >= this.priceRange[0] && item.price <= this.priceRange[1]
    );

    result = result.filter(item =>
      item.reorderThreshold >= this.reorderRange[0] && item.reorderThreshold <= this.reorderRange[1]
    );

    const selectedCategories = Object.keys(this.selectedCategories).filter(cat => this.selectedCategories[cat]);
    if(selectedCategories.length > 0) {
      result = result.filter(item => 
        selectedCategories.includes(item.category)
      );
    }

    result = this.mergeSort(result, this.sortField, this.sortDirection);

    this.filteredAndSortedItems = result;
  }

  mergeSort(arr: any[], field: string, direction: 'asc' | 'desc'): any[] {

    if(arr.length <= 1) {
      return arr;
    }

    const middle = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, middle), field, direction);
    const right = this.mergeSort(arr.slice(middle), field, direction);

    return this.merge(left, right, field, direction);
  }

  merge(left: any[], right: any[], field: string, direction: 'asc' | 'desc'): any[] {
    const result: any[] = [];
    
    while(left.length && right.length) {
      let leftValue = left[0][field] ?? '';
      let rightValue = right[0][field] ?? '';

      if(typeof leftValue === 'string') {
        leftValue = leftValue.toLowerCase();
      }

      if(typeof rightValue === 'string') {
        rightValue = rightValue.toLowerCase();
      }
      
      let comparison = 0;

      if(leftValue < rightValue) {
        comparison = -1;
      } else if(leftValue > rightValue) {
        comparison = 1;
      }

      const changeLeftDirection = direction === 'asc' ? comparison <= 0 : comparison >= 0;
      result.push(changeLeftDirection ? left.shift() : right.shift());
    }

    return result.concat(left, right);

  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

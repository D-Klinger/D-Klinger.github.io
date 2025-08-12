/**
 * InventoryForm
 * Performs adding new and existing items to inventory
 * Loads item data for editing if Id is present
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-form.component.html',
  styleUrl: './inventory-form.css',
  standalone: true
})
export class InventoryForm implements OnInit {
  itemForm: FormGroup;
  isEditMode = false;
  itemId: string | null = null;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private inventoryService: InventoryService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.itemForm = this.formBuilder.group({
      name: ['', Validators.required],
      category: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0],
      location: [''],
      description: [''],
      perishable: [false],
      expirationDate: [''],
      supplier: [''],
      reorderThreshold: [0]
    });
  }

  ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if(this.itemId) {
      this.isEditMode = true;
      this.loadItem();
    }
  }

  loadItem() {
    this.inventoryService.getItems().subscribe({
      next: (res) => {
        const found = (res.items || []).find((item: any) => item._id === this.itemId);
        if(found) {
          this.itemForm.patchValue(found);
        } else {
            this.errorMessage = 'Unable to load item to edit.';
        }
      },
    });
  }

  onSubmit() {
    if(this.itemForm.invalid) {
      return;
    }
    if(this.isEditMode && this.itemId) {
      this.inventoryService.updateItem(this.itemId, this.itemForm.value).subscribe({
        next: () => this.router.navigate(['/inventory']),
        error: () => this.errorMessage = 'Update has failed.'
      });
    } else {
      this.inventoryService.addItem(this.itemForm.value).subscribe({
        next: () => this.router.navigate(['/inventory']),
        error: () => this.errorMessage = 'Add has failed.'
      });
    }
  }

      cancel() {
      this.router.navigate(['/inventory']);
    }
}

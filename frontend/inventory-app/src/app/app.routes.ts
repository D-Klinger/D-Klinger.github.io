/**
 * Application Routes
 * Defines route configuration in the InvenX app.
 */

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { InventoryList } from './components/inventory-list/inventory-list.component';
import { InventoryForm } from './components/inventory-form/inventory-form.component';
import { AuthGuard } from './services/auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'inventory', component: InventoryList, canActivate: [AuthGuard]},
    { path: 'inventory/add', component: InventoryForm, canActivate: [AuthGuard]},
    { path: 'inventory/edit/:id', component: InventoryForm, canActivate: [AuthGuard]}
];
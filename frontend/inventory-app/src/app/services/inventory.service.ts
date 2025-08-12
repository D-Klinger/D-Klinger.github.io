/**
 * InventoryService
 * Handles all API calls for CRUD operations on inventory items
 * Injects AuthService to attach JWT token with each request.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})

export class InventoryService {
    private baseUrl = 'http://localhost:5000/api/inventory';

    constructor(private http: HttpClient, private authService: AuthService) {}

    getItems(): Observable<any> {
        return this.http.get(this.baseUrl, {
            headers: this.authService.getAuthHeaders()
        });
    }

    addItem(item: any): Observable<any> {
        return this.http.post(this.baseUrl, item, {
            headers: this.authService.getAuthHeaders()
        });
    }

    updateItem(id: string, item: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, item, {
            headers: this.authService.getAuthHeaders()
        });
    }

    deleteItem(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }
}
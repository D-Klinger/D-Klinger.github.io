/**
 * AuthService
 * Manages user authentication in the InvenX app.
 * Handles the registering, logging in, logging out, and storing JWTs.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
    private baseUrl = 'http://localhost:5000/api';
    private tokenKey = 'authToken';
    private authStatus = new BehaviorSubject<boolean>(this.hasToken());

    constructor(private http: HttpClient) {}

    register(user: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/register`, user);
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
            tap((res: any) => {
                if (res && res.token) {
                    localStorage.setItem(this.tokenKey, res.token);
                    this.authStatus.next(true);
                }
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        this.authStatus.next(false);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isAuthenticated(): Observable<boolean> {
        return this.authStatus.asObservable();
    }

    private hasToken(): boolean {
        return !!localStorage.getItem(this.tokenKey);
    }

    // Gets user profile from backend  for the '/me' route
    // TO DO: NOT IMPLEMENTED FULLY
    getModuleFactory(): Observable<any> {
        return this.http.get(`${this.baseUrl}/me`, {
            headers: this.getAuthHeaders()
        });
    }

    getAuthHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token || ''}`
        });
    }

    getProfile(): Observable<any> {
        return this.http.get(`${this.baseUrl}/me`, {
            headers: this.getAuthHeaders()
        });
    }

}
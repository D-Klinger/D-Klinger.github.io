/**
 * RegisterComponent
 * Provides a user registration form for the InvenX application.
 * Handles user input, validates the fields, and sends registration data to the backend,
 */

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RegisterComponent {
    registerForm: FormGroup;
    errorMessage: string = '';
    successMessage: string = '';

    /**
     * Constructor injects all the dependencies and starts the registration form.
     * @param formBuild  Create the form model and applies validators.
     * @param authService  Provides registration HTTP calls to backend.
     * @param router  Handles the navigation after registration.
     */
    constructor(
        private formBuild: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        // Defines the registration form fields and follows the validation rules.
        this.registerForm = this.formBuild.group({
            userName: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phoneNumber: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern(/[A-Z]/),
                Validators.pattern(/[a-z]/),
                Validators.pattern(/\d/),
                Validators.pattern(/[^A-Za-z0-9]/),
            ]]
        });
    }

    onSubmit() {
        this.errorMessage = '';
        this.successMessage = '';
        if(this.registerForm.valid) {
            this.authService.register(this.registerForm.value).subscribe({
                next: (res) => {
                    this.successMessage = 'Registration successful! Redirecting to login screen.';
                    setTimeout(() => this.router.navigate(['/login']), 1500);
                },
                error: (err) => {
                if (err.status === 0) {
                    this.errorMessage = "Unable to connect to the server. Please try again later.";
                } else if (err.error?.message) {
                    this.errorMessage = err.error.message;
                } else if (err.error?.errors) {
                    this.errorMessage = this.formatBackendErrors(err.error.errors);
                } else if(typeof err.error === "string") {
                    this.errorMessage = err.error;
                } else {
                    this.errorMessage = "Registration has failed. Please review you information and try again."
                }
            }
        });
        } else {
            this.errorMessage = 'Please correct errors in the form';
        }
    }

    /**
   * Formats array of backend validation errors in string format.
   * Provides clear error display if the backend returns a list of errors.
   * @param errors Array of error objects from backend.
   * @returns Comma-separated error messages or empty strings.
   */
    private formatBackendErrors(errors: any): string {
        if (!errors || !Array.isArray(errors)) {
            return '';
        } else {
            return errors.map((backErrorMessage: any) => backErrorMessage.msg).join(', ');
        }
    }
}

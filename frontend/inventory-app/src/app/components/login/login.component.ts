/**
 * LoginComponent
 * Handles user login logic for InvenX.
 * Displays a login form, validates, and sends login requests,
 */

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuild: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuild.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.errorMessage = '';
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.router.navigate(['/inventory']);
        },
        error: (err) => {
          if(err.status === 0) {
            this.errorMessage = "Unable to connect to the server. Please try again later.";
          } else if(err.error?.message) {
            this.errorMessage = err.error.message;
          } else if(err.error?.errors) {
            this.errorMessage = this.formatBackendErrors(err.error.errors);
          } else if(typeof err.error === "string") {
            this.errorMessage = err.error;
          }else {
            this.errorMessage = "Login failed. Please check your username and passord then try again.";
          }
        }
      });
    } else {
      this.errorMessage = 'Please enter both email and password.';
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

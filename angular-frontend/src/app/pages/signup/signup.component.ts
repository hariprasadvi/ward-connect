import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './signup.component.html',
    styles: []
})
export class SignupComponent {
    signupForm: FormGroup;
    loading = false;
    errorMessage = '';
    roles = ['Citizen', 'Ward Member', 'Panchayat Admin', 'Kudumbashree Member', 'Health Worker', 'Vehicle Owner', 'Shopkeeper', 'Waste Management Staff'];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.signupForm = this.fb.group({
            full_name: ['', Validators.required],
            mobile_number: ['', Validators.required],
            email: ['', Validators.email],
            role: ['Citizen', Validators.required],
            ward_number: [''],
            panchayat_name: [''],
            address: [''],
            aadhaar_number: [''],
            password: ['', Validators.required],
            confirm_password: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.signupForm.valid) {
            if (this.signupForm.value.password !== this.signupForm.value.confirm_password) {
                this.errorMessage = "Passwords don't match";
                return;
            }

            this.loading = true;
            this.errorMessage = '';

            this.authService.signup(this.signupForm.value).subscribe({
                next: () => {
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    this.loading = false;
                    this.errorMessage = err.error?.message || 'Signup failed';
                }
            });
        }
    }
}

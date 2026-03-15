import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, MatIconModule],
    templateUrl: './login.component.html',
    styles: [] // Using Tailwind in HTML
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    errorMessage = '';
    roles = ['Citizen', 'Ward Member', 'Panchayat Admin', 'Kudumbashree Member', 'Kudumbashree Admin', 'Health Worker', 'Vehicle Owner', 'Shopkeeper', 'Waste Management Staff'];

    // OTP Auth state
    step = 1; // 1 = Enter Details, 2 = Enter OTP
    otpCode = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            role: ['Citizen', Validators.required],
            mobile_number: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    ngOnInit() {
        // No more recaptcha!
    }

    sendOtp() {
        if (this.loginForm.invalid) return;
        
        this.loading = true;
        this.errorMessage = '';
        
        let phone = this.loginForm.value.mobile_number;
        // Don't prepend +91 manually if we are changing back to traditional, 
        // string based OTP unless the backend specifically expects it.
        // Fast2SMS expects 10 digits without +91.
        if (phone.startsWith('+91')) {
            phone = phone.replace('+91', '');
        }

        this.authService.sendOtp(phone).subscribe({
            next: (response) => {
                this.step = 2; // Move to OTP entry screen
                this.loading = false;
                // Auto-fill OTP if backend returns it (development fallback)
                if (response.dev_otp) {
                    this.otpCode = response.dev_otp;
                }
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Failed to send OTP. Try again.';
                this.loading = false;
            }
        });
    }

    verifyOtpAndLogin() {
        if (!this.otpCode || this.otpCode.length < 6) {
            this.errorMessage = 'Please enter a valid 6-digit OTP';
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        // Add the OTP code to the login form payload
        const loginData = {
            ...this.loginForm.value,
            otp: this.otpCode
        };

        this.authService.login(loginData).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || 'Login failed on the server or Invalid OTP';
                // Only go back to step 1 if it's a structural error (not just a bad OTP)
                if (err.status >= 500) {
                     this.step = 1; 
                }
            }
        });
    }
}

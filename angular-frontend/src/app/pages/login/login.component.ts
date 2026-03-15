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
    resetForm: FormGroup;
    otpForm: FormGroup;
    newPasswordForm: FormGroup;
    mode: 'login' | 'forgot_step_1' | 'forgot_step_2' | 'forgot_step_3' = 'login';
    loading = false;
    errorMessage = '';
    successMessage = '';
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

        this.resetForm = this.fb.group({
            role: ['Citizen', Validators.required],
            mobile_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
        });

        this.otpForm = this.fb.group({
            otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
        });

        this.newPasswordForm = this.fb.group({
            new_password: ['', Validators.required],
            confirm_password: ['', Validators.required],
        });
    }

    setMode(newMode: 'login' | 'forgot_step_1' | 'forgot_step_2' | 'forgot_step_3') {
        this.mode = newMode;
        this.errorMessage = '';
        this.successMessage = '';
        if (newMode === 'login') {
            this.loginForm.reset({ role: 'Citizen' });
            this.resetForm.reset({ role: 'Citizen' });
            this.otpForm.reset();
            this.newPasswordForm.reset();
        }
    }

    ngOnInit() {
        // No more recaptcha!
    }

    // onSubmit() {
    //     if (this.loginForm.invalid) return;

    //     this.loading = true;
    //     this.errorMessage = '';

    //     this.authService.login(this.loginForm.value).subscribe({
    //         next: (res) => {
    //             this.loading = false;
    //             // Redirect based on role or just to dashboard
    //             this.router.navigate(['/dashboard']);
    //         },
    //         error: (err) => {
    //             this.loading = false;
    //             this.errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
    //         }
    //     });
    // }

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

    onRequestOtp() {
        if (this.resetForm.valid) {
            this.loading = true;
            this.errorMessage = '';
            
            // Check if user exists before sending OTP
            this.authService.sendOtp(this.resetForm.value).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.successMessage = 'OTP sent to your mobile number.';
                    // In development/test mode, the OTP is returned in the response
                    if (res.otp_debug) {
                        console.log('Test OTP:', res.otp_debug);
                    }
                    this.setMode('forgot_step_2');
                },
                error: (err) => {
                    this.loading = false;
                    this.errorMessage = err.error?.message || 'Failed to send OTP';
                }
            });
        }
    }

    onVerifyOtp() {
        if (this.otpForm.valid) {
            this.loading = true;
            this.errorMessage = '';
            
            const verifyData = {
                mobile_number: this.resetForm.value.mobile_number,
                otp: this.otpForm.value.otp
            };

            this.authService.verifyOtp(verifyData).subscribe({
                next: () => {
                    this.loading = false;
                    this.successMessage = 'OTP Verified. Proceed to reset password.';
                    this.setMode('forgot_step_3');
                },
                error: (err) => {
                    this.loading = false;
                    this.errorMessage = err.error?.message || 'Invalid or expired OTP';
                }
            });
        }
    }

    onResetSubmit() {
        if (this.newPasswordForm.valid) {
            if (this.newPasswordForm.value.new_password !== this.newPasswordForm.value.confirm_password) {
                this.errorMessage = "Passwords don't match";
                return;
            }

            this.loading = true;
            this.errorMessage = '';
            this.successMessage = '';

            const resetData = {
                mobile_number: this.resetForm.value.mobile_number,
                role: this.resetForm.value.role,
                new_password: this.newPasswordForm.value.new_password
            };

            this.authService.resetPassword(resetData).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.successMessage = res.message || 'Password reset successfully. You can now login.';
                    setTimeout(() => {
                        this.setMode('login');
                    }, 3000);
                },
                error: (err) => {
                    this.loading = false;
                    this.errorMessage = err.error?.message || 'Failed to reset password';
                }
            });
        }
    }
}

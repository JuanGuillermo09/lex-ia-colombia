import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, NgIf],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  sentCode = '';
  sent = false;

  constructor(
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {}

  onSubmit(): void {
    if (!this.email) return;
    this.loading = true;
    this.sent = false;
    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.toast.success('Código enviado. Revisa tu correo.');
        this.loading = false;
        this.sent = true;
        const expiresAt = Date.now() + 5 * 60 * 1000;
        sessionStorage.setItem('resetEmail', this.email);
        sessionStorage.setItem('resetExpiresAt', expiresAt.toString());
        if (res.code) {
          this.sentCode = res.code;
        }
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Error al enviar el código');
        this.loading = false;
      },
    });
  }

  goToVerify(): void {
    this.router.navigate(['/verify-code'], { queryParams: { email: this.email } });
  }
}

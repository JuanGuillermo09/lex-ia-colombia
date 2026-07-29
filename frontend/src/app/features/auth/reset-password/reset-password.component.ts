import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  newPassword = '';
  confirmPassword = '';
  loading = false;
  email = '';
  code = '';

  constructor(
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.email = this.route.snapshot.queryParams['email'] || '';
    this.code = this.route.snapshot.queryParams['code'] || '';
    if (!this.email || !this.code) {
      this.router.navigate(['/forgot-password']);
    }
  }

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.toast.error('Las contraseñas no coinciden');
      return;
    }
    if (this.newPassword.length < 8) {
      this.toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    this.loading = true;
    this.authService.resetPassword(this.email, this.code, this.newPassword).subscribe({
      next: () => {
        this.toast.success('Contraseña restablecida. Inicia sesión.');
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Error al restablecer la contraseña');
        this.loading = false;
      },
    });
  }
}

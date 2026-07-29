import { Component, OnInit, OnDestroy } from '@angular/core';
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
  selector: 'app-verify-code',
  standalone: true,
  imports: [RouterLink, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.scss',
})
export class VerifyCodeComponent implements OnInit, OnDestroy {
  code = '';
  loading = false;
  email = '';
  timerDisplay = '05:00';
  expired = false;
  private timerInterval: any;

  constructor(
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || sessionStorage.getItem('resetEmail') || '';
    if (!this.email) {
      this.router.navigate(['/forgot-password']);
      return;
    }
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private startTimer(): void {
    const expiresAt = parseInt(sessionStorage.getItem('resetExpiresAt') || '0', 10) || Date.now() + 5 * 60 * 1000;
    this.updateDisplay(expiresAt);
    this.timerInterval = setInterval(() => this.updateDisplay(expiresAt), 1000);
  }

  private updateDisplay(expiresAt: number): void {
    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    if (remaining <= 0) {
      this.timerDisplay = '00:00';
      this.expired = true;
      if (this.timerInterval) clearInterval(this.timerInterval);
      return;
    }
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    this.timerDisplay = `${m}:${s}`;
  }

  onSubmit(): void {
    if (this.expired) {
      this.toast.error('El código ha expirado. Solicita uno nuevo.');
      return;
    }
    if (!this.code || this.code.length !== 6) return;
    this.loading = true;
    this.authService.verifyResetCode(this.email, this.code).subscribe({
      next: () => {
        this.toast.success('Código verificado');
        this.loading = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.router.navigate(['/reset-password'], {
          queryParams: { email: this.email, code: this.code },
        });
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Código inválido');
        this.loading = false;
      },
    });
  }
}

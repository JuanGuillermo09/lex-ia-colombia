import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink, FormsModule, NgIf,
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
/** Pantalla de registro con formulario de nombre, email y contraseña. */
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  /** Envía los datos de registro al servidor; en éxito redirige al dashboard. */
  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.error || 'Error al registrar';
        this.loading = false;
      },
    });
  }
}

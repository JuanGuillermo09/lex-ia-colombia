import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
/** Pantalla de perfil de usuario con edición de datos y cambio de contraseña. */
export class ProfileComponent implements OnInit {
  user: User | null = null;
  formData = { name: '', email: '' };
  loading = false;
  passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
  passwordLoading = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  /** Carga los datos del usuario actual al inicializar. */
  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.formData.name = this.user.name;
      this.formData.email = this.user.email;
    }
  }

  /** Guarda los cambios del perfil (nombre y email). */
  onSubmit(): void {
    this.loading = true;

    this.http.patch<{ id: string; name: string; email: string; role: string }>(`${environment.apiUrl}/profile`, this.formData).subscribe({
      next: (res) => {
        this.user = { ...this.user!, name: res.name, email: res.email};
        this.formData.name = res.name;
        this.formData.email = res.email;
        this.authService.updateUser(this.user);
        this.toast.success('Perfil actualizado exitosamente');
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  /** Cambia la contraseña del usuario validando que coincidan. */
  onChangePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toast.error('Las contraseñas no coinciden');
      return;
    }
    if (this.passwordData.newPassword.length < 6) {
      this.toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    this.passwordLoading = true;
    this.http.post<{ message: string }>(`${environment.apiUrl}/profile/change-password`, {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword,
    }).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Contraseña actualizada');
        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.passwordLoading = false;
      },
      error: () => (this.passwordLoading = false),
    });
  }
}

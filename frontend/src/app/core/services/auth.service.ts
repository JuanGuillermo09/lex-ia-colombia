import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, TokenRefresh, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** URL base de la API de autenticación */
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  /** Subject que mantiene el usuario actual */
  private readonly userSubject = new BehaviorSubject<User | null>(null);

  /** Observable del usuario actual */
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  /** Registra un nuevo usuario */
  register(data: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  /** Inicia sesión con credenciales */
  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  /** Renueva el token de acceso */
  refreshToken(): Observable<TokenRefresh> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<TokenRefresh>(`${this.apiUrl}/refresh`, { refreshToken });
  }

  /** Cierra sesión y limpia datos locales */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  /** Obtiene el token de acceso almacenado */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /** Obtiene el token de refresco almacenado */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /** Verifica si hay un token de acceso vigente */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /** Devuelve el usuario actual desde el BehaviorSubject */
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  /** Actualiza los datos del usuario actual */
  updateUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  /** Envía código de restablecimiento al correo */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  /** Verifica el código de restablecimiento */
  verifyResetCode(email: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify-reset-code`, { email, code });
  }

  /** Restablece la contraseña usando el código */
  resetPassword(email: string, code: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { email, code, newPassword });
  }

  /** Guarda tokens y usuario en localStorage */
  private setSession(res: AuthResponse): void {
    localStorage.setItem('accessToken', res.tokens.accessToken);
    localStorage.setItem('refreshToken', res.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }

  /** Restaura usuario desde localStorage al iniciar */
  private loadUser(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.userSubject.next(JSON.parse(userStr));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }
}

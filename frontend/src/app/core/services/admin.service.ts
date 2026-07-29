import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversation } from '../models/chat.model';

/** Usuario visible en el panel de administración */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

/** Respuesta paginada de usuarios */
export interface PaginatedUsers {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Servicio de administración del sistema */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /** Obtiene lista paginada de usuarios */
  getUsers(page = 1, limit = 20): Observable<PaginatedUsers> {
    return this.http.get<PaginatedUsers>(`${this.apiUrl}/users`, {
      params: { page, limit },
    });
  }

  /** Actualiza el rol de un usuario */
  updateUserRole(id: string, role: string): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.apiUrl}/users/${id}/role`, { role });
  }

  /** Elimina un usuario por ID */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  /** Obtiene las conversaciones de un usuario específico */
  getUserConversations(userId: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/users/${userId}/conversations`);
  }
}

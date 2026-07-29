import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatResponse, Conversation } from '../models/chat.model';

/** Servicio para operaciones de chat y conversaciones */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  /** Envía un mensaje al chat */
  sendMessage(data: { conversationId?: string; question: string }): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/messages`, data);
  }

  /** Obtiene todas las conversaciones del usuario */
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  /** Elimina una conversación por ID */
  deleteConversation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${id}`);
  }

  /** Elimina múltiples conversaciones en lote */
  deleteBatch(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/conversations/delete-batch`, { ids });
  }

  /** Renombra una conversación */
  renameConversation(id: string, title: string): Observable<{ id: string; title: string }> {
    return this.http.patch<{ id: string; title: string }>(`${this.apiUrl}/conversations/${id}`, { title });
  }
}

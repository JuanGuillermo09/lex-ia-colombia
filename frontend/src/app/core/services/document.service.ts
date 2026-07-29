import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Document, DocumentStats } from '../models/document.model';

/** Servicio para gestión de documentos legales */
@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  /** Sube un documento al servidor */
  upload(file: File, name?: string, type?: string): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (type) formData.append('type', type);
    return this.http.post<Document>(`${this.apiUrl}/upload`, formData);
  }

  /** Obtiene todos los documentos */
  getAll(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl);
  }

  /** Elimina un documento por ID */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Obtiene estadísticas de documentos */
  getStats(): Observable<DocumentStats> {
    return this.http.get<DocumentStats>(`${this.apiUrl}/stats`);
  }
}

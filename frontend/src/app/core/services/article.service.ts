import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArticleResponse } from '../models/article.model';

/** Servicio para consulta de artículos legales */
@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly apiUrl = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  /** Obtiene artículos paginados */
  getAll(page = 1, limit = 50): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }
}

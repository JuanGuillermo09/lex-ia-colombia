import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArticleResponse } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  readonly apiUrl = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 50): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  update(): Observable<{ documentsUpdated: number; articlesAdded: number; articlesRemoved: number; errors: string[] }> {
    return this.http.post<any>(`${this.apiUrl}/update`, {});
  }

  exportPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }
}

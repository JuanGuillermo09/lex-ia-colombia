import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { ArticleService } from '../../../core/services/article.service';
import { Article } from '../../../core/models/article.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-admin-articles',
  standalone: true,
  imports: [
    NgFor, NgIf, SlicePipe,
    MatButtonModule, MatCardModule, MatIconModule, MatPaginatorModule,
  ],
  templateUrl: './admin-articles.component.html',
  styleUrl: './admin-articles.component.scss',
})
/** Panel de administración de artículos generados desde documentos. */
export class AdminArticlesComponent implements OnInit {
  articles: Article[] = [];
  total = 0;
  page = 1;
  limit = 50;
  totalPages = 0;
  loading = true;
  showScrollTop = false;

  constructor(private articleService: ArticleService) {}

  /** Al iniciar, carga la primera página de artículos. */
  ngOnInit(): void {
    this.load();
  }

  /** Obtiene la lista paginada de artículos. */
  load(): void {
    this.articleService.getAll(this.page, this.limit).subscribe({
      next: (res) => {
        this.articles = res.articles;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  /** Maneja el cambio de página o tamaño de página. */
  onPageChange(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.limit = e.pageSize;
    this.loading = true;
    this.load();
  }

  /** Detecta si el scroll superó el umbral para mostrar el botón de volver arriba. */
  onScroll(el: HTMLElement): void {
    this.showScrollTop = el.scrollTop > 300;
  }

  /** Desplaza suavemente el contenedor al inicio. */
  scrollToTop(el: HTMLElement): void {
    el.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

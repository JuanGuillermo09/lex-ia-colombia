import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { ArticleService } from '../../../core/services/article.service';
import { Article } from '../../../core/models/article.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-admin-articles',
  standalone: true,
  imports: [
    NgFor, NgIf, SlicePipe,
    MatButtonModule, MatCardModule, MatIconModule, MatPaginatorModule, MatSnackBarModule,
  ],
  templateUrl: './admin-articles.component.html',
  styleUrl: './admin-articles.component.scss',
})
export class AdminArticlesComponent implements OnInit {
  articles: Article[] = [];
  total = 0;
  page = 1;
  limit = 50;
  totalPages = 0;
  loading = true;
  updating = false;
  exporting = false;
  showScrollTop = false;

  constructor(
    private articleService: ArticleService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.load();
  }

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

  onPageChange(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.limit = e.pageSize;
    this.loading = true;
    this.load();
  }

  onScroll(el: HTMLElement): void {
    this.showScrollTop = el.scrollTop > 300;
  }

  scrollToTop(el: HTMLElement): void {
    el.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateArticles(): void {
    this.updating = true;
    this.articleService.update().subscribe({
      next: (result) => {
        this.updating = false;
        this.snackBar.open(
          `Actualizado: ${result.documentsUpdated} documentos, ${result.articlesAdded} artículos añadidos, ${result.articlesRemoved} eliminados`,
          'Cerrar', { duration: 6000 },
        );
        if (result.errors.length > 0) {
          console.warn('Errores:', result.errors);
        }
        this.load();
      },
      error: (err) => {
        this.updating = false;
        this.snackBar.open('Error al actualizar artículos', 'Cerrar', { duration: 4000 });
      },
    });
  }

  downloadPdf(): void {
    this.exporting = true;
    this.articleService.exportPdf().subscribe({
      next: (blob) => {
        this.exporting = false;
        saveAs(blob, 'articulos-lexia.pdf');
      },
      error: () => {
        this.exporting = false;
        this.snackBar.open('Error al generar PDF', 'Cerrar', { duration: 4000 });
      },
    });
  }
}

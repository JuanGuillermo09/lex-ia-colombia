import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentStats } from '../../../core/models/document.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [NgFor, NgIf, MatCardModule, MatIconModule],
  templateUrl: './admin-stats.component.html',
  styleUrl: './admin-stats.component.scss',
})
/** Panel de estadísticas generales de documentos. */
export class AdminStatsComponent implements OnInit {
  stats: DocumentStats | null = null;
  loading = true;

  constructor(private documentService: DocumentService) {}

  /** Al iniciar, obtiene las estadísticas del servicio. */
  ngOnInit(): void {
    this.documentService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}

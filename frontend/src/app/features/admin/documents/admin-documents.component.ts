import { Component, OnInit } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { DocumentService } from '../../../core/services/document.service';
import { Document } from '../../../core/models/document.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-admin-documents',
  standalone: true,
  imports: [
    NgIf, DatePipe,
    MatButtonModule, MatCardModule, MatChipsModule, MatIconModule,
    MatProgressBarModule, MatTableModule,
  ],
  templateUrl: './admin-documents.component.html',
  styleUrl: './admin-documents.component.scss',
})
/** Panel de administración de documentos: listar, subir y eliminar. */
export class AdminDocumentsComponent implements OnInit {
  documents: Document[] = [];
  loading = true;
  uploading = false;
  columns = ['name', 'type', 'articles', 'date', 'actions'];

  constructor(private documentService: DocumentService) {}

  /** Al iniciar, carga la lista de documentos. */
  ngOnInit(): void {
    this.loadDocuments();
  }

  /** Obtiene todos los documentos desde el servicio. */
  loadDocuments(): void {
    this.documentService.getAll().subscribe({
      next: (data) => {
        this.documents = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  /** Sube un archivo PDF seleccionado por el usuario. */
  uploadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.uploading = true;
    const file = input.files[0];

    this.documentService.upload(file, file.name.replace('.pdf', ''), 'Documento').subscribe({
      next: () => {
        this.uploading = false;
        this.loadDocuments();
      },
      error: () => (this.uploading = false),
    });
  }

  /** Elimina un documento tras confirmación del usuario. */
  deleteDocument(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    this.documentService.delete(id).subscribe({
      next: () => this.loadDocuments(),
    });
  }
}

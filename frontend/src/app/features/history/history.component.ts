import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, SlicePipe, DatePipe } from '@angular/common';
import { ChatService } from '../../core/services/chat.service';
import { ToastService } from '../../core/services/toast.service';
import { Conversation } from '../../core/models/chat.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    RouterLink, NgFor, NgIf, SlicePipe, DatePipe, FormsModule,
    MatButtonModule, MatCheckboxModule, MatExpansionModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
/** Pantalla de historial de conversaciones con selección múltiple, renombrado y eliminación. */
export class HistoryComponent implements OnInit {
  conversations: Conversation[] = [];
  loading = true;
  selectedIds = new Set<string>();
  renamingId: string | null = null;
  renameValue = '';

  constructor(
    private chatService: ChatService,
    private toast: ToastService,
  ) {}

  /** Al iniciar, carga la lista de conversaciones. */
  ngOnInit(): void {
    this.load();
  }

  /** Obtiene las conversaciones desde el servicio. */
  load(): void {
    this.chatService.getConversations().subscribe({
      next: (data) => {
        this.conversations = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  /** Marca o desmarca una conversación para operaciones por lote. */
  toggle(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  /** Selecciona o deselecciona todas las conversaciones. */
  toggleAll(): void {
    if (this.allSelected()) {
      this.selectedIds.clear();
    } else {
      this.conversations.forEach((c) => this.selectedIds.add(c.id));
    }
  }

  /** Indica si todas las conversaciones están seleccionadas. */
  allSelected(): boolean {
    return this.conversations.length > 0 && this.selectedIds.size === this.conversations.length;
  }

  /** Indica si hay al menos una seleccionada, sin ser todas. */
  someSelected(): boolean {
    return this.selectedIds.size > 0 && !this.allSelected();
  }

  /** Activa el modo de edición del título de una conversación. */
  startRename(conv: Conversation): void {
    this.renamingId = conv.id;
    this.renameValue = conv.title;
    setTimeout(() => {
      const input = document.querySelector('.rename-input') as HTMLInputElement;
      if (input) { input.focus(); input.select(); }
    }, 50);
  }

  /** Guarda el nuevo nombre de la conversación vía el servicio. */
  confirmRename(conv: Conversation): void {
    if (!this.renamingId) return;
    const id = this.renamingId;
    this.renamingId = null;
    const val = this.renameValue.trim();
    if (!val || val === conv.title) return;
    this.chatService.renameConversation(id, val).subscribe({
      next: () => {
        conv.title = val;
        this.toast.success('Conversación renombrada');
      },
      error: () => this.toast.error('Error al renombrar'),
    });
  }

  /** Cancela el renombrado sin guardar cambios. */
  cancelRename(): void {
    this.renamingId = null;
  }

  /** Elimina una conversación individual tras confirmación. */
  deleteOne(id: string): void {
    if (!confirm('Eliminar esta conversación?')) return;
    this.chatService.deleteConversation(id).subscribe(() => {
      this.selectedIds.delete(id);
      this.toast.success('Conversación eliminada');
      this.load();
    });
  }

  /** Elimina en lote las conversaciones seleccionadas tras confirmación. */
  deleteBatch(): void {
    if (this.selectedIds.size === 0) return;
    if (!confirm(`Eliminar ${this.selectedIds.size} conversaciones?`)) return;
    this.chatService.deleteBatch(Array.from(this.selectedIds)).subscribe(() => {
      this.selectedIds.clear();
      this.toast.success('Conversaciones eliminadas');
      this.load();
    });
  }
}

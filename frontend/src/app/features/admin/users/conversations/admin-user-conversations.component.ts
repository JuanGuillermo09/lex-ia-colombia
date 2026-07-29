import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { Conversation } from '../../../../core/models/chat.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-admin-user-conversations',
  standalone: true,
  imports: [
    NgFor, NgIf, DatePipe, RouterLink,
    MatButtonModule, MatCardModule, MatIconModule, MatExpansionModule,
  ],
  templateUrl: './admin-user-conversations.component.html',
  styleUrl: './admin-user-conversations.component.scss',
})
/** Panel de administración que muestra las conversaciones de un usuario específico. */
export class AdminUserConversationsComponent implements OnInit {
  userId = '';
  userName = '';
  conversations: Conversation[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
  ) {}

  /** Obtiene el ID del usuario de la ruta y carga sus conversaciones. */
  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    this.userName = history.state?.name || 'Usuario';
    this.load();
  }

  /** Carga las conversaciones del usuario desde el servicio. */
  load(): void {
    this.adminService.getUserConversations(this.userId).subscribe({
      next: (data) => {
        this.conversations = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  /** Convierte markdown básico a HTML para mostrar respuestas. */
  formatAnswer(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="inline-link">$1</a>')
      .replace(/(?<!href=["'])(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="inline-link">$1</a>');
  }

  /** Extrae el dominio de una URL para mostrar al usuario. */
  getDomain(url: string): string {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  }
}

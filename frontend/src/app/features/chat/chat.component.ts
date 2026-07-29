import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { ChatService } from '../../core/services/chat.service';
import { Message } from '../../core/models/chat.model';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule, NgFor, NgIf, SlicePipe,
    MatButtonModule, MatChipsModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatTooltipModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
/** Componente de chat conversacional con el asistente LexIA. */
export class ChatComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;
  messages: Message[] = [];
  question = '';
  loading = false;
  conversationId?: string;
  showScrollBottom = false;
  sidebarOpen = false;
  title = '';
  editingTitle = false;
  editTitleValue = '';

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
  ) {}

  /** Carga la conversación si se recibe un ID por ruta. */
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.conversationId = params['id'];
        this.loadConversation(params['id']);
      }
    });
  }

  /** Obtiene y asigna los mensajes de una conversación existente. */
  private loadConversation(id: string): void {
    this.chatService.getConversations().subscribe({
      next: (convs) => {
        const conv = convs.find((c) => c.id === id);
        if (conv) {
          this.messages = conv.messages;
          this.title = conv.title;
          setTimeout(() => this.scrollToBottom(), 200);
        }
      },
    });
  }

  startEditTitle(): void {
    this.editTitleValue = this.title;
    this.editingTitle = true;
  }

  saveTitle(): void {
    const val = this.editTitleValue.trim();
    if (!val || !this.conversationId) return;
    this.chatService.renameConversation(this.conversationId, val).subscribe({
      next: () => {
        this.title = val;
        this.editingTitle = false;
      },
    });
  }

  cancelEditTitle(): void {
    this.editingTitle = false;
  }

  /** Envía la pregunta al asistente y agrega la respuesta al historial. */
  sendMessage(): void {
    if (!this.question.trim() || this.loading) return;

    const q = this.question;
    this.question = '';
    this.loading = true;
    this.scrollToBottom();

    this.chatService.sendMessage({
      conversationId: this.conversationId,
      question: q,
    }).subscribe({
      next: (res) => {
        this.messages.push(res.message);
        if (!this.conversationId) {
          this.conversationId = res.message.conversationId;
          this.title = 'Nueva conversación';
        }
        this.loading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  /** Envía una pregunta predefinida desde un chip rápido. */
  sendQuickQuestion(q: string): void {
    this.question = q;
    this.sendMessage();
  }

  /** Detecta si el usuario ha scrolleado arriba para mostrar el botón de ir al final. */
  onMessagesScroll(): void {
    const el = this.messagesContainer?.nativeElement;
    if (!el) return;
    const threshold = 100;
    this.showScrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight > threshold;
  }

  /** Desplaza el contenedor de mensajes al final. */
  scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
        this.showScrollBottom = false;
      }
    }, 100);
  }

  /** Desplaza el contenedor hasta un mensaje específico por su índice. */
  scrollToMessage(index: number): void {
    const el = this.messagesContainer?.nativeElement;
    if (!el) return;
    const group = el.querySelector(`[data-msg-index="${index}"]`) as HTMLElement;
    if (group) {
      group.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.showScrollBottom = true;
    }
  }

  /** Track por ID para rendimiento en *ngFor. */
  trackById(_index: number, msg: Message): string {
    return msg.id;
  }

  /** Convierte texto plano con formato markdown básico a HTML sanitizado. */
  formatAnswer(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="inline-link">$1</a>')
      .replace(/(?<!href=["'])(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="inline-link">$1</a>');
  }

  /** Extrae el dominio limpio de una URL para mostrar como texto. */
  getDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }
}

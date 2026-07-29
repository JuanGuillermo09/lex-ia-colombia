import { Component, OnInit } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminUser } from '../../../core/services/admin.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    NgIf, DatePipe, RouterLink,
    MatButtonModule, MatIconModule, MatPaginatorModule, MatSelectModule, MatTableModule, MatTooltipModule,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
/** Panel de administración de usuarios: listar, cambiar rol y eliminar. */
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  total = 0;
  page = 1;
  limit = 20;
  totalPages = 0;
  columns = ['name', 'email', 'role', 'date', 'actions'];

  constructor(private adminService: AdminService) {}

  /** Al iniciar, carga la primera página de usuarios. */
  ngOnInit(): void {
    this.loadUsers();
  }

  /** Obtiene la lista paginada de usuarios. */
  loadUsers(): void {
    this.adminService.getUsers(this.page, this.limit).subscribe({
      next: (data) => {
        this.users = data.users;
        this.total = data.total;
        this.totalPages = data.totalPages;
      },
    });
  }

  /** Actualiza el rol de un usuario. */
  updateRole(id: string, role: string): void {
    this.adminService.updateUserRole(id, role).subscribe();
  }

  /** Elimina un usuario tras confirmación. */
  deleteUser(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    this.adminService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
    });
  }

  /** Maneja el cambio de página en el paginador. */
  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.loadUsers();
  }
}

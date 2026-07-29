import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layouts/main/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';

/** Definición de rutas de la aplicación */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
      {
        path: 'verify-code',
        loadComponent: () =>
          import('./features/auth/verify-code/verify-code.component').then((m) => m.VerifyCodeComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./features/chat/chat.component').then((m) => m.ChatComponent),
      },
      {
        path: 'chat/:id',
        loadComponent: () =>
          import('./features/chat/chat.component').then((m) => m.ChatComponent),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history.component').then((m) => m.HistoryComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/documents/admin-documents.component').then(
                (m) => m.AdminDocumentsComponent,
              ),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/users/admin-users.component').then(
                (m) => m.AdminUsersComponent,
              ),
          },
          {
            path: 'users/:id/conversations',
            loadComponent: () =>
              import('./features/admin/users/conversations/admin-user-conversations.component').then(
                (m) => m.AdminUserConversationsComponent,
              ),
          },
          {
            path: 'stats',
            loadComponent: () =>
              import('./features/admin/stats/admin-stats.component').then(
                (m) => m.AdminStatsComponent,
              ),
          },
          {
            path: 'articles',
            loadComponent: () =>
              import('./features/admin/articles/admin-articles.component').then(
                (m) => m.AdminArticlesComponent,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

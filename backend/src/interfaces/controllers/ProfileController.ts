import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { JwtAuthService } from '../../infrastructure/auth/JwtAuthService';

/** Controlador del perfil del usuario autenticado */
export class ProfileController {
  /**
   * @param userRepository Repositorio de usuarios
   * @param authService Servicio de autenticación JWT
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: JwtAuthService,
  ) {}

  /**
   * Obtiene los datos del perfil del usuario autenticado
   * @returns Datos del perfil
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userRepository.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el nombre y/o email del perfil del usuario autenticado
   * @returns Perfil actualizado
   */
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email } = req.body;
      const user = await this.userRepository.update(req.user!.userId, { name, email });

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * Verifica la contraseña actual antes de actualizar
   * @returns Mensaje de confirmación
   */
  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await this.userRepository.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const isValid = await this.authService.comparePassword(currentPassword, user.password);
      if (!isValid) {
        res.status(400).json({ error: 'La contraseña actual no es correcta' });
        return;
      }

      const hashed = await this.authService.hashPassword(newPassword);
      await this.userRepository.update(req.user!.userId, { password: hashed });
      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

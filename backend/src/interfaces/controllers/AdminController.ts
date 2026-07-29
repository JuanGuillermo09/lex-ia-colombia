import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';

/** Controlador de administración del sistema */
export class AdminController {
  /**
   * @param userRepository Repositorio de usuarios
   * @param conversationRepository Repositorio de conversaciones
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly conversationRepository: IConversationRepository,
  ) {}

  /**
   * Obtiene usuarios paginados
   * @returns Lista paginada de usuarios
   */
  async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.userRepository.findAll(page, limit);
      res.json({
        ...result,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el rol de un usuario
   * @returns Usuario con el rol actualizado
   */
  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { role } = req.body;

      if (!['ADMIN', 'USER'].includes(role)) {
        res.status(400).json({ error: 'Rol inválido' });
        return;
      }

      const user = await this.userRepository.update(id, { role });
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
   * Elimina un usuario del sistema
   * @returns 204 sin contenido
   */
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user!.userId === (req.params.id as string)) {
        res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
        return;
      }
      await this.userRepository.delete(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene las conversaciones de un usuario específico
   * @returns Conversaciones del usuario con sus mensajes
   */
  async getUserConversations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await this.userRepository.findById(id);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      const conversations = await this.conversationRepository.findByUserIdWithMessages(id as string);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  }
}

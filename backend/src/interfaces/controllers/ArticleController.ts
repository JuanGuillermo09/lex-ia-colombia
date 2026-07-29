import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { IArticleRepository } from '../../domain/repositories/IArticleRepository';

/** Controlador de artículos legales */
export class ArticleController {
  /**
   * @param articleRepository Repositorio de artículos
   */
  constructor(private readonly articleRepository: IArticleRepository) {}

  /**
   * Obtiene todos los artículos legales paginados
   * @returns Lista paginada de artículos
   */
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await this.articleRepository.findAll(page, limit);
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
}
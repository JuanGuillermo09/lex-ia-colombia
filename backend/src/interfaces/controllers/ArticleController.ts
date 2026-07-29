import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { IArticleRepository } from '../../domain/repositories/IArticleRepository';
import { UpdateArticlesUseCase } from '../../application/use-cases/UpdateArticlesUseCase';
import { ExportArticlesUseCase } from '../../application/use-cases/ExportArticlesUseCase';

/** Controlador de artículos legales */
export class ArticleController {
  constructor(
    private readonly articleRepository: IArticleRepository,
    private readonly updateArticlesUseCase?: UpdateArticlesUseCase,
    private readonly exportArticlesUseCase?: ExportArticlesUseCase,
  ) {}

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

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.updateArticlesUseCase) {
        res.status(500).json({ error: 'UpdateArticlesUseCase no configurado' });
        return;
      }
      const result = await this.updateArticlesUseCase.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async exportPdf(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.exportArticlesUseCase) {
        res.status(500).json({ error: 'ExportArticlesUseCase no configurado' });
        return;
      }
      const pdf = await this.exportArticlesUseCase.execute();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="articulos-lexia.pdf"');
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  }
}
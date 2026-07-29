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

  async updateStream(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    if (!this.updateArticlesUseCase) {
      res.status(500).json({ error: 'UpdateArticlesUseCase no configurado' });
      return;
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    const sendEvent = (event: string, data: any) => {
      if (res.destroyed) return;
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      if (typeof (res as any).flush === 'function') (res as any).flush();
    };
    sendEvent('start', { message: 'Iniciando actualización de artículos...' });
    try {
      const result = await this.updateArticlesUseCase.execute((message) => {
        sendEvent('progress', { message });
      });
      sendEvent('complete', result);
      res.end();
    } catch (error: any) {
      sendEvent('error', { message: error.message });
      res.end();
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
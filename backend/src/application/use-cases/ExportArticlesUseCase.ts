import { IArticleRepository } from '../../domain/repositories/IArticleRepository';
import { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';

export class ExportArticlesUseCase {
  constructor(
    private readonly articleRepository: IArticleRepository,
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(): Promise<Buffer> {
    const documents = await this.documentRepository.findAll();
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).font('Helvetica-Bold').text('LexIA Colombia - Artículos Legales', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Generado el ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' });
      doc.moveDown(2);

      const processDocs = async () => {
        for (const d of documents) {
          const articles = await this.articleRepository.findByDocumentId(d.id);
          if (articles.length === 0) continue;

          if (doc.y > 650) doc.addPage();
          doc.fontSize(16).font('Helvetica-Bold').text(d.name, { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(9).font('Helvetica').fillColor('#666').text(`Tipo: ${d.type} | ${articles.length} artículos`, { continued: false });
          doc.fillColor('#000');
          doc.moveDown();

          for (const article of articles) {
            if (doc.y > 680) doc.addPage();
            doc.fontSize(11).font('Helvetica-Bold').text(`Artículo ${article.number}`, { continued: false });
            if (article.title) {
              doc.fontSize(10).font('Helvetica-Oblique').fillColor('#444').text(article.title, { continued: false });
              doc.fillColor('#000');
            }
            doc.moveDown(0.3);
            doc.fontSize(9).font('Helvetica').text(article.text, { align: 'justify', lineGap: 2 });
            doc.moveDown(0.8);
          }
          doc.moveDown();
        }
        doc.end();
      };
      processDocs().catch(reject);
    });
  }
}

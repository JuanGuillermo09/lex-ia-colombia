import dotenv from 'dotenv';
import path from 'path';

/** Carga variables de entorno desde .env */
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** Configuración centralizada de la aplicación */
export const config = {
  /** Puerto del servidor */
  port: parseInt(process.env.PORT || '3000', 10),
  /** Entorno de ejecución: development | production */
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  ai: {
    /** Proveedor de IA activo: openai | llama | claude | gemini | mistral | groq */
    provider: process.env.AI_PROVIDER || 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.1'),
    },
    llama: {
      apiUrl: process.env.LLAMA_API_URL || 'http://localhost:11434/api/generate',
      model: process.env.LLAMA_MODEL || 'llama3.2',
      embeddingModel: process.env.LLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
    },
    claude: {
      apiKey: process.env.CLAUDE_API_KEY || '',
      model: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-pro',
    },
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY || '',
      model: process.env.MISTRAL_MODEL || 'mistral-large-latest',
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY || 'gsk-your-groq-api-key',
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      embeddingModel: process.env.GROQ_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
    },
  },
  embedding: {
    /** Dimensión de los vectores de embedding */
    dimension: parseInt(process.env.EMBEDDING_DIMENSION || '1536', 10),
    /** Máximo de artículos usados como contexto por consulta */
    maxContextArticles: parseInt(process.env.MAX_CONTEXT_ARTICLES || '10', 10),
    /** Umbral de similitud mínima para incluir artículos */
    similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.7'),
  },
  upload: {
    /** Directorio de archivos subidos */
    dir: process.env.UPLOAD_DIR || 'uploads',
    /** Tamaño máximo de archivo (20 MB por defecto) */
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520', 10),
  },
  cors: {
    /** Origen permitido para CORS */
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@lexia.com',
  },
};

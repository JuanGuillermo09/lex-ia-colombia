/** Fuente legal citada como referencia en la respuesta */
export interface IMessageSource {
  id: string;
  messageId: string;
  articleId: string;
  law: string;
  article: string;
  title: string;
}

/** Representa un mensaje dentro de una conversación */
export interface IMessage {
  id: string;
  conversationId: string;
  question: string;
  answer: string;
  createdAt: Date;
  sources?: IMessageSource[];
}

/** Entidad que contiene una pregunta y su respuesta generada por IA */
export class Message implements IMessage {
  constructor(
    public id: string,
    public conversationId: string,
    public question: string,
    public answer: string,
    public createdAt: Date = new Date(),
    public sources?: IMessageSource[],
  ) {}
}

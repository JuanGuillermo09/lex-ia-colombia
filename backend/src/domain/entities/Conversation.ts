import { IMessage } from './Message';

/** Representa una conversación entre el usuario y el asistente */
export interface IConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  messages?: IMessage[];
}

/** Entidad que agrupa mensajes en una conversación */
export class Conversation implements IConversation {
  constructor(
    public id: string,
    public userId: string,
    public title: string = 'Nueva conversación',
    public createdAt: Date = new Date(),
    public messages?: IMessage[],
  ) {}
}

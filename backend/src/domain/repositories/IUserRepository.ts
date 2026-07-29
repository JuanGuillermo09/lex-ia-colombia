import { IUser } from '../entities/User';

/** Repositorio para operaciones de persistencia de usuarios */
export interface IUserRepository {
  /** Busca un usuario por su ID */
  findById(id: string): Promise<IUser | null>;
  /** Busca un usuario por su email */
  findByEmail(email: string): Promise<IUser | null>;
  /** Crea un nuevo usuario */
  create(data: Omit<IUser, 'id' | 'createdAt'>): Promise<IUser>;
  /** Actualiza parcialmente un usuario */
  update(id: string, data: Partial<IUser>): Promise<IUser>;
  /** Elimina un usuario por su ID */
  delete(id: string): Promise<void>;
  /** Obtiene todos los usuarios con paginación */
  findAll(page: number, limit: number): Promise<{ users: IUser[]; total: number }>;
}

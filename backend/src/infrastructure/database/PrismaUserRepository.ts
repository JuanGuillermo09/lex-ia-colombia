import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, IUser, Role } from '../../domain/entities/User';

/** Repositorio de usuarios implementado con Prisma ORM. */
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Busca un usuario por su ID.
   * @param id - Identificador único del usuario
   * @returns Usuario o null si no existe
   */
  async findById(id: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.toDomain(user);
  }

  /**
   * Busca un usuario por su correo electrónico.
   * @param email - Correo del usuario
   * @returns Usuario o null si no existe
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.toDomain(user);
  }

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param data - Datos del usuario sin id ni createdAt
   * @returns Usuario creado
   */
  async create(data: Omit<IUser, 'id' | 'createdAt'>): Promise<IUser> {
    const user = await this.prisma.user.create({ data });
    return this.toDomain(user);
  }

  /**
   * Actualiza parcialmente un usuario.
   * @param id - ID del usuario
   * @param data - Campos a actualizar
   * @returns Usuario actualizado
   */
  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    const user = await this.prisma.user.update({ where: { id }, data });
    return this.toDomain(user);
  }

  /**
   * Elimina un usuario por su ID.
   * @param id - ID del usuario a eliminar
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  /**
   * Retorna una lista paginada de usuarios ordenados por fecha de creación descendente.
   * @param page - Número de página (1-indexed)
   * @param limit - Cantidad por página
   * @returns Lista de usuarios y total de registros
   */
  async findAll(page: number, limit: number): Promise<{ users: IUser[]; total: number }> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users: users.map((u) => this.toDomain(u)),
      total,
    };
  }

  /** Convierte un registro de Prisma a la entidad de dominio User. */
  private toDomain(user: any): IUser {
    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.role as Role,
      user.createdAt,
    );
  }
}

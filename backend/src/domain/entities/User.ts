/** Roles de usuario en el sistema */
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

/** Representa un usuario del sistema */
export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
}

/** Entidad que representa un usuario registrado en la plataforma */
export class User implements IUser {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public role: Role = Role.USER,
    public createdAt: Date = new Date(),
  ) {}
}

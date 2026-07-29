import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IAuthService, AuthTokens } from '../../domain/services/IAuthService';
import { RegisterDTO, AuthResponseDTO } from '../dtos/AuthDTOs';
import { User, Role } from '../../domain/entities/User';

/** Caso de uso: registrar un nuevo usuario en el sistema */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
  ) {}

  /**
   * Ejecuta el registro validando que el email no exista
   * @param dto - Datos del registro (nombre, email, contraseña)
   */
  async execute(dto: RegisterDTO): Promise<AuthResponseDTO> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('El correo ya está registrado');
    }

    const hashedPassword = await this.authService.hashPassword(dto.password);
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: Role.USER,
    });

    const tokens = this.authService.generateTokens({
      userId: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }
}

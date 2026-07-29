import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IAuthService } from '../../domain/services/IAuthService';
import { LoginDTO, AuthResponseDTO } from '../dtos/AuthDTOs';

/** Caso de uso: iniciar sesión con credenciales de usuario */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
  ) {}

  /**
   * Ejecuta el inicio de sesión validando credenciales
   * @param dto - Credenciales del usuario (email, contraseña)
   */
  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValid = await this.authService.comparePassword(dto.password, user.password);
    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }

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

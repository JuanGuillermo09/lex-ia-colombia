import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Crea el usuario administrador por defecto si no existe */
async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lexia.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@lexia.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`Admin user created: ${admin.email} (password: admin123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

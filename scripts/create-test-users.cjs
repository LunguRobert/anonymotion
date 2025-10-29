/* scripts/create-test-users.cjs
 * Creează/actualizează rapid N utilizatori cu parolă (Credentials).
 * Rulare:
 *   USERS=20 PASSWORD="Passw0rd!" DOMAIN="test.local" node scripts/create-test-users.cjs
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const USERS  = parseInt(process.env.USERS  || "20", 10);
const PASS   = process.env.PASSWORD || "Passw0rd!";
const DOMAIN = process.env.DOMAIN   || "test.local";

async function upsertUser(email, name, password) {
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hash,
      emailVerified: new Date(), // Credentials la tine cere emailVerified
      blocked: false,
    },
    create: {
      email,
      name,
      password: hash,
      emailVerified: new Date(),
      blocked: false,
    },
  });
}

async function main() {
  const emails = Array.from({ length: USERS }, (_, i) => `user${i + 1}@${DOMAIN}`);
  for (const [i, email] of emails.entries()) {
    const name = `User ${i + 1}`;
    await upsertUser(email, name, PASS);
    console.log(`✓ ${email}`);
  }
  console.log(`\nParola comună: ${PASS}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

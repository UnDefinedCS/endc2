import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

export async function HashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function CheckPassword(password: string, storedHash: string) {
    return bcrypt.compare(password, storedHash);
}
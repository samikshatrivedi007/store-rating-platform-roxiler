import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (plain: string, hash: string) => {
    return bcrypt.compare(plain, hash);
};

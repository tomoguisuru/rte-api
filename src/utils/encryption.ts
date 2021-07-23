import * as argon2 from "argon2";
import { randomBytes } from "crypto";

interface IEncryption {
    hash: string;
    salt: string;
}

export class EncryptionHelper {
    static async encrypt(password): Promise<IEncryption> {
        const salt = randomBytes(32);
        const hash = await argon2.hash(password, { salt });

        return {
            hash,
            salt: salt.toString('hex'),
        };
    }

    static async verifyPassword(password, hash) {
        return await argon2.verify(hash, password);
    }
}
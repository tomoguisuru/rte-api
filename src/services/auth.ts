import { User } from "../models/user";
import { EncryptionHelper } from "../utils/encryption";

export class AuthService {
    public async SignUp(email, password, firstName, lastName): Promise<any> {
        const { hash, salt } = await EncryptionHelper.encrypt(password);

        return await User.create({
            email,
            firstName,
            hash,
            lastName,
            salt,
        });
    }
}
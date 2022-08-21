import 'source-map-support/register'
import { SignupRequest } from "../request/signupRequest";
import { UserRepository } from "../repository/user";
import { createLogger } from "../utils/logger";
import { comparePassword, generatePassword } from "../security/utils";
import { User } from "../models/user";
import { SigninRequest } from "../request/signinRequest";
import { ErrorREST } from '../utils/error';
import { HttpStatusCode } from '../constants/httpStatusCode';

const logger = createLogger('AuthService')

const userRepo = new UserRepository()

export async function signup(request: SignupRequest): Promise<User> {

    const userWithThisEmail = await userRepo.findByEmail(request.email);
    if (userWithThisEmail) {
        logger.error(`Email already taken`, { email: request.email });
        throw new ErrorREST(HttpStatusCode.BadRequest, { email: `already taken` });
    }

    const userWithThisUsername = await userRepo.findByUsername(request.username);
    if (userWithThisUsername) {
        logger.error(`Username already taken`, { username: request.username });
        throw new ErrorREST(HttpStatusCode.BadRequest, { username: `already taken` });
    }

    const hashedPassword = await generatePassword(request.password);

    const now = new Date().toISOString();

    const newUser: User = {
        passwordHash: hashedPassword,
        createdAt: now,
        updatedAt: now,
        email: request.email,
        username: request.username,
        bio: '',
        image: 'https://api.realworld.io/images/smiley-cyrus.jpeg',
        followers: [],
        following: []
    };

    await userRepo.save(newUser);

    return newUser;
}

export async function signin(request: SigninRequest): Promise<User> {

    const user = await userRepo.findByEmail(request.email);
    if (!user) {
        logger.error(`Email not found`, { email: request.email });
        throw new ErrorREST(HttpStatusCode.BadRequest, { email: `not found` });
    }
    logger.info("Checking password");
    const match = await comparePassword(request.password, user.passwordHash)
    if (!match) {
        logger.error(`Wrong password`)
        throw new ErrorREST(HttpStatusCode.BadRequest, { password: `wrong` })
    }

    return user;
}

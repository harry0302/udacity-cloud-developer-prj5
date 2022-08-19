import 'source-map-support/register'
import { SignupRequest } from "../request/signupRequest";
import { UserRepository } from "../repository/user";
import { createLogger } from "../utils/logger";
import { comparePassword, generatePassword } from "../security/utils";
import { User } from "../models/user";
import { SigninRequest } from "../request/signinRequest";
import { ErrorREST } from '../utils/error';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatusCode } from '../constants/httpStatusCode';

const logger = createLogger('AuthService')

const userRepo = new UserRepository()

export async function signup(request: SignupRequest): Promise<User> {

    const userWithThisEmail = await userRepo.findByEmail(request.email);
    if (userWithThisEmail) {
        logger.error(`Email already taken: [${request.email}]`);
        throw new ErrorREST(HttpStatusCode.BadRequest, `Email already taken: [${request.email}]`);
    }

    const userWithThisUsername = await userRepo.findByUsername(request.username);
    if (userWithThisUsername) {
        logger.error(`Username already taken: [${request.username}]`);
        throw new ErrorREST(HttpStatusCode.BadRequest, `Username already taken: [${request.username}]`);
    }

    const hashedPassword = await generatePassword(request.password);

    const now = new Date().toISOString();

    const newUser: User = {
        userId: uuidv4(),
        passwordHash: hashedPassword,
        createdAt: now,
        updatedAt: now,
        email: request.email,
        username: request.username,
        bio: '',
        image: '',
        followers: []
    };

    await userRepo.save(newUser);

    return newUser;
}

export async function signin(request: SigninRequest): Promise<User> {

    const user = await userRepo.findByEmail(request.email);
    if (!user) {
        logger.error(`Email not found: [${request.email}]`);
        throw new ErrorREST(HttpStatusCode.BadRequest, `Email not found: [${request.email}]`);
    }
    logger.info("Checking password")
    const match = await comparePassword(request.password, user.passwordHash)
    if (!match) {
        logger.error(`Wrong password`)
        throw new ErrorREST(HttpStatusCode.BadRequest, `Wrong password`)
    }

    return user;
}

import 'source-map-support/register'
import { SignupRequest } from "../request/signupRequest";
import { UserRepository } from "../dataLayer/user";
import { createLogger } from "../utils/logger";
import * as bcrypt from "bcryptjs";
import { SignupResponse } from "../response/signupResponse";
import { generateToken } from "../security/utils";
import { User } from "../models/user";
import { SigninRequest } from "../request/signinRequest";
import { SigninResponse } from "../response/signinResponse";
import { ErrorREST, Errors } from '../utils/error';
import { v4 as uuidv4 } from 'uuid';

const saltRounds = 10

const logger = createLogger('AuthService')

const userRepo = new UserRepository()

async function generatePassword(plainTextPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainTextPassword, salt);
}

export async function signup(request: SignupRequest): Promise<SignupResponse> {

    const userWithThisEmail = await userRepo.findByEmail(request.email);
    if (userWithThisEmail) {
        logger.error(`Email already taken: [${request.email}]`);
        throw new ErrorREST(Errors.BadRequest, `Email already taken: [${request.email}]`);
    }

    const hashedPassword = await generatePassword(request.password);

    const now = new Date().toISOString();

    const newUser: User = {
        userId: uuidv4(),
        passwordHash: hashedPassword,
        createdAt: now,
        updatedAt: now,
        email: request.email,
    };

    await userRepo.create(newUser);

    return {
        token: generateToken(newUser.userId),
        user: {
            email: newUser.email,
            userId: newUser.userId
        },
    };
}

export async function signin(request: SigninRequest): Promise<SigninResponse> {

    const user = await userRepo.findByEmail(request.email);
    if (!user) {
        logger.error(`Username not found: [${request.email}]`);
        throw new ErrorREST(Errors.BadRequest, `Username not found: [${request.email}]`);
    }
    logger.info("Checking password")
    const match = await bcrypt.compare(request.password, user.passwordHash)
    if (!match) {
        logger.error(`Password not match`)
        throw new ErrorREST(Errors.BadRequest, `Password not match`)
    }

    return {
        token: generateToken(user.userId),
        user: {
            email: user.email,
            userId: user.userId
        },
    };
}

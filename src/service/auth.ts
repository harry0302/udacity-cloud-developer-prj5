import 'source-map-support/register'
import { SignupRequest } from "../dto/signupRequest";
import { UserRepository } from "../repository/user";
import { createLogger } from "../utils/logger";
import * as bcrypt from "bcryptjs";
import { SignupResponse } from "../dto/signupResponse";
import { generateToken } from "../security/utils";
import { User } from "../models/user";
import { SigninRequest } from "../dto/signinRequest";
import { SigninResponse } from "../dto/signinResponse";
import { ErrorREST, Errors } from '../utils/error';

const saltRounds = 10

const logger = createLogger('AuthService')

const userRepo = new UserRepository()

export async function signup(request: SignupRequest): Promise<SignupResponse> {
    const userWithThisUsername = await userRepo.findByUsername(request.username);
    if (userWithThisUsername) {
        logger.error(`Username already taken: [${request.username}]`)
        throw new ErrorREST(Errors.BadRequest, `Username already taken: [${request.username}]`)
    }

    const userWithThisEmail = await userRepo.findByEmail(request.email);
    if (userWithThisEmail) {
        logger.error(`Email already taken: [${request.email}]`)
        throw new ErrorREST(Errors.BadRequest, `Email already taken: [${request.email}]`)
    }

    const hashedPassword = await bcrypt.hash(request.password, saltRounds);

    const now = new Date().toISOString()

    const user : User = {
        passwordHash: hashedPassword,
        createdAt: now,
        updatedAt: now,
        displayName: request.displayName,
        email: request.email,
        username: request.username
    }

    await userRepo.create(user)

    return {
        user: {
            token: generateToken(user.username),
            displayName: user.displayName,
            email: user.email,
            username: user.username,
        }
    }
}

export async function signin(request: SigninRequest): Promise<SigninResponse> {

    const user = await userRepo.findByUsername(request.username)
    if (!user) {
        logger.error(`Username not found: [${request.username}]`)
        throw new ErrorREST(Errors.BadRequest, `Username not found: [${request.username}]`)
    }
    const match = await bcrypt.compare(request.password, user.passwordHash)
    if (!match) {
        logger.error(`Password not match`)
        throw new ErrorREST(Errors.BadRequest, `Password not match`)
    }

    return {
        user: {
            token: generateToken(user.username),
            displayName: user.displayName,
            email: user.email,
            username: user.username,
        }
    }
}

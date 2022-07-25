import 'source-map-support/register'
import { SignupRequest } from "../models/signupRequest";
import { UserRepository } from "../repository/user";
import { createLogger } from "../utils/logger";
import * as bcrypt from "bcryptjs";
import { SignupResponse } from "../models/signupResponse";
import { generateToken } from "../security/utils";
import { User } from "../entity/user";
import { SigninRequest } from "../models/signinRequest";
import { SigninResponse } from "../models/signinResponse";

const saltRounds = 10

const logger = createLogger('AuthService')

const userRepo = new UserRepository()

export async function signup(request: SignupRequest): Promise<SignupResponse> {
    const userWithThisUsername = await userRepo.findByUsername(request.username);
    if (userWithThisUsername) {
        logger.error(`Username already taken: [${request.username}]`)
        throw new Error(`Username already taken: [${request.username}]`)
    }

    const userWithThisEmail = await userRepo.findByEmail(request.username);
    if (userWithThisEmail) {
        logger.error(`Email already taken: [${request.email}]`)
        throw new Error(`Email already taken: [${request.email}]`)
    }

    const encryptedPassword = bcrypt.hashSync(request.password, saltRounds);

    const now = new Date().toISOString()

    const userCreated = {
        passwordHash: encryptedPassword,
        createdAt: now,
        updatedAt: now,
        ...request,
    } as User

    await userRepo.create(userCreated)

    return {
        user: {
            token: generateToken(userCreated.username),
            displayName: userCreated.displayName,
            email: userCreated.email,
            username: userCreated.username,
        }
    }
}

export async function signin(request: SigninRequest): Promise<SigninResponse> {

    const user = await userRepo.findByUsername(request.username)
    if (!user) {
        logger.error(`Username not found: [${request.username}]`)
        throw new Error(`Username not found: [${request.username}]`)
    }
    const hashedPassword = await bcrypt.hash(request.password, saltRounds)
    const match = await bcrypt.compare(user.passwordHash, hashedPassword)
    if (!match) {
        logger.error(`Password not match`)
        throw new Error(`Password not match`)
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

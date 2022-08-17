import { APIGatewayProxyEvent } from "aws-lambda";
import * as Jwt from "jsonwebtoken";
import { HttpStatusCode } from "../constants/httpStatusCode";
import { ErrorREST } from "../utils/error";
import { JwtPayload } from "./jwtPayload";
import * as bcrypt from "bcryptjs";

const { JWT_SECRET, TOKEN_EXPIRATION } = process.env;

const saltRounds = 10;

export async function generatePassword(plainTextPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);

  return await bcrypt.hash(plainTextPassword, salt);
}

export async function comparePassword(plainTextPassword: string, passwordHash: string): Promise<boolean> {
  const match = await bcrypt.compare(plainTextPassword, passwordHash);

  return match;
}

/**
* Generate a JWT token from userId
* @param userId parse to jwtpayload
* @returns generated JWT token
*/
export function generateToken(userId: string): string {
  const secret = JWT_SECRET as Jwt.Secret;

  const payload: JwtPayload = {
    sub: userId
  };

  return Jwt.sign(payload, secret, {
    expiresIn: TOKEN_EXPIRATION,
  });
}

/**
* Verify a JWT token and return a JwtPayload
* @param jwtToken JWT token to verify
* @returns a JwtPayload from the JWT token
*/
export function getJwtPayload(jwtToken: string): JwtPayload {
  const decodedJwt = Jwt.verify(jwtToken, JWT_SECRET) as JwtPayload;
  return decodedJwt;
}

/**
* Get JWT token from auth header
* @param authHeader auth header from request
* @returns a JWT token
*/
export function getToken(authHeader: string): string {
  if (!authHeader) throw new ErrorREST(HttpStatusCode.Unauthorized, 'No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new ErrorREST(HttpStatusCode.Unauthorized, 'Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}

/**
* Get a userId from an API Gateway event
* @param event an event from API Gateway
* @returns a user id from a JWT token
*/
export function getCurrentUser(event: APIGatewayProxyEvent): string {
  try {
    const authorization = event.headers.Authorization;
    const jwtToken = getToken(authorization);

    return getJwtPayload(jwtToken).sub;
  } catch (error) {
    return '';
  }
}
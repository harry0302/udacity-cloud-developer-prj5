import { APIGatewayProxyEvent } from "aws-lambda"
import * as Jwt from "jsonwebtoken"
import { ErrorREST, Errors } from "../utils/error"
import { JwtPayload } from "./jwtPayload"

const { JWT_SECRET, TOKEN_EXPIRATION } = process.env

/**
* Generate a JWT token from username
* @param username parse to jwtpayload
* @returns generated JWT token
*/
export function generateToken(username: string): string {
  const secret = JWT_SECRET as Jwt.Secret

  const payload : JwtPayload = {
    sub: username
  }

  return Jwt.sign(payload, secret, {
    expiresIn: TOKEN_EXPIRATION,
  })
}

/**
* Verify a JWT token and return a JwtPayload
* @param jwtToken JWT token to verify
* @returns a JwtPayload from the JWT token
*/
export function getJwtPayload(jwtToken: string): JwtPayload {
  const decodedJwt = Jwt.verify(jwtToken, JWT_SECRET) as JwtPayload
  return decodedJwt
}

/**
* Get JWT token from auth header
* @param authHeader auth header from request
* @returns a JWT token
*/
export function getToken(authHeader: string): string {
  if (!authHeader) throw new ErrorREST(Errors.Unauthorized, 'No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new ErrorREST(Errors.Unauthorized, 'Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

/**
* Get a username from an API Gateway event
* @param event an event from API Gateway
* @returns a user name from a JWT token
*/
export function getCurrentUser(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const jwtToken = getToken(authorization)

  return getJwtPayload(jwtToken).sub
}
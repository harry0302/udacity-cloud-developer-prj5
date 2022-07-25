import * as Jwt from "jsonwebtoken"
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
 * Parse a JWT token and return a username
 * @param jwtToken JWT token to parse
 * @returns a username from the JWT token
 */
export function getCurrentUser(jwtToken: string): string {
  const decodedJwt = Jwt.verify(jwtToken, JWT_SECRET) as JwtPayload
  return decodedJwt.sub
}

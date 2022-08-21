/**
 * A payload of a JWT token
 */
export interface JwtPayload {
  sub: string;
  iat?: number
  exp?: number
}

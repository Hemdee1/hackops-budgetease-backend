import jwt, { JwtPayload } from "jsonwebtoken";

const secret = "wavezboy";
const expiresIn = 60 * 15; // 15 minutes

export const createToken = (id: string) => {
  const token = jwt.sign({ id }, secret, { expiresIn });
  return token;
};

export const verifyToken = (token: string): string | null => {
  try {
    const { id } = jwt.verify(token, secret) as JwtPayload;

    return id;
  } catch (error) {
    console.log(error);
    return null;
  }
};

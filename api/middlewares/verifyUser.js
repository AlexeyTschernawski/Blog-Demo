import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(errorHandler(401, "Access denied. No token."));
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user; // { id, isAdmin, ... }
    next();
  } catch (err) {
    return next(errorHandler(403, "Invalid token"));
  }
};
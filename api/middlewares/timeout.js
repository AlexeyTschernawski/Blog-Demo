export const extendTimeout = (req, res, next) => {
  // timeout 5 min
  req.setTimeout(5 * 60 * 1000); // 5 min
  res.setTimeout(5 * 60 * 1000); 
  next();
};
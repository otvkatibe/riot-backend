export const successResponse = (res, status, message, data = {}) =>
  res.status(status).json({ message, ...data });

export const errorResponse = (res, status, message) =>
  res.status(status).json({ message });
import { Response } from 'express';

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const handleError = (err: Error, res: Response) => {
  console.error("Error: ", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
      },
    });
  }

  return res.status(500).json({
    error: {
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    },
  });
};

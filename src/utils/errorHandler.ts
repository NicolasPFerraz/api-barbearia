import { Response } from 'express';

// Classe de erro personalizada para API
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message); // Chama o construtor da classe Error (pai), definindo a mensagem do erro
    this.statusCode = statusCode; // Adiciona o status HTTP ao erro
  }
}

// Função para tratar erros e enviar resposta adequada ao cliente
export const handleError = (err: Error, res: Response) => {
  console.error("Error: ", err);

  // Se o erro for do tipo ApiError, retorna o status e mensagem definidos
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
      },
    });
  }

  // Para outros erros, retorna status 500 e mensagem genérica
  return res.status(500).json({
    error: {
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    },
  });
};

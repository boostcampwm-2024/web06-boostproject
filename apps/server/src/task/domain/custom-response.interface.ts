import { Response } from 'express';

export interface CustomResponse extends Response {
  userId: number;

  version: number;
}

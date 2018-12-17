import {Request, Response} from 'express';

export interface APIDefinition {
  [k: string]: (req: Request, res: Response) => void
}

export default interface IAPIService {
  namespace: string
  GET?: APIDefinition
  POST?: APIDefinition
}
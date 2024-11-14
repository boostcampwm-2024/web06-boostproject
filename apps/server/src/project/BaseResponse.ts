export class BaseResponse {
  status: number;

  message: string;

  result?: any;

  constructor(status: number, message: string, result?: any) {
    this.status = status;
    this.message = message;
    this.result = result;
  }

  static create(status: number, message: string, result?: any) {
    return new BaseResponse(status, message, result);
  }
}

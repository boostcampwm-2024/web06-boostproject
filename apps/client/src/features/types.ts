export interface BaseResponse<T = void> {
  status: number;
  message: string;
  result: T extends void ? never : T;
}

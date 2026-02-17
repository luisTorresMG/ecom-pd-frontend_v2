export interface IResponse {
  success: boolean;
  message: string;

  [key: string]: any;
}

export interface Response<T> extends IResponse {
  data: T;
}

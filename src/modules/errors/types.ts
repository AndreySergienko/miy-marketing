export interface IResponseErrorCreateMsg {
  message: string;
}

export interface IErrorApi {
  createMsg: (message: string) => IResponseErrorCreateMsg;
}

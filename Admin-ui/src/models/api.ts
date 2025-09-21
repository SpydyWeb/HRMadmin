export interface ApiResponse<T> {
  responseHeader: {
    errorCode: number
    errorMessage: string
  }
  responseBody: T
}

export interface IEncryptAPIResponse{
  responseEncryptedString:string
}

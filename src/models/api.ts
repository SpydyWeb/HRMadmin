export interface ApiResponse<T> {
  responseHeader: {
    errorCode: number
    errorMessage: string
  }
  responseBody: T
}
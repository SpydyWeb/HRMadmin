import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'

export type SaveProductPayload = {
  productId?: number
  productCode: string
  productName: string
  categoryId: number
  effectiveFrom: string
  effectiveTo: string
  isActive: boolean
}

export const productService = {
  saveProduct: async (payload: SaveProductPayload) => {
    const response = await callApi<ApiResponse<any>>(APIRoutes.SAVE_PRODUCT, [payload])
    return response
  },
  getProducts: async () => {
    const response = await callApi<ApiResponse<any>>(APIRoutes.GET_PRODUCTS, [{}])
    return response
  },
}


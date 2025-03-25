import { AxiosResponse } from "axios"

export type AxiosSyncCheckResponse = AxiosResponse<SyncCheckResponse, any>

export interface SyncCheckResponse {
    data: {
      ready: boolean
      pending: number
      epoch: string
    }
    error: {
      message: string
    }
  }
  
import { ENV } from '@config/env/env';
import { AxiosSyncCheckResponse } from '@interfaces/nas';
import axios, { isAxiosError } from 'axios'

export async function checkSync(epochDate: string): Promise<{ ready: boolean; pending: number; epoch: string }> {
    const nasApi = ENV.NAS_API?.trim()
    const nasApiKey = ENV.NAS_API_KEY?.trim()
  
    try {
      const response = await axios.get<any, AxiosSyncCheckResponse>(`${nasApi}/sync-check`, {
        params: {
          epoch_date: epochDate,
        },
        headers: {
          Authorization: `Bearer ${nasApiKey}`,
        },
      })
  
      if (response.data.error) {
        console.error('API Error during sync check:', response.data.error.message)
        return {
          ready: false,
          pending: 0,
          epoch: '',
        }
      }
  
      const { ready, pending, epoch } = response.data.data
      console.log('Sync check response:', { ready, pending, epoch })
  
      return {
        ready,
        pending,
        epoch,
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.error) {
        console.error('Error during sync check:', error.response.data.error.message)
      } else {
        console.error('Unexpected error during sync check:', error)
      }
  
      return {
        ready: false,
        pending: 0,
        epoch: '',
      }
    }
  }
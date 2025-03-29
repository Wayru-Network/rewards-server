import { ENV } from "@config/env/env"
import { getPoolPerEpochNumber, getTestnetAmount, getPoolPerEpochByEpoch as getPoolPerEpochByEpochQuery} from "./queries"
import moment from "moment"

export const getPoolPerEpochAmounts = async (epoch: Date) => {
    try {
        const period = ENV.REWARDS_PERIOD
        const epochNumber = await getPoolPerEpochNumber(epoch)
        const epochYear = period === 'mainnet' ? Math.ceil(epochNumber / 365) : Math.ceil(epochNumber / 7)
        let ubiPoolPercentage: number
        let upiPoolPercentage: number
        let manufacturersPoolPercentage: number

        switch (epochYear) {
            case 1:
                ubiPoolPercentage = 81
                upiPoolPercentage = 18
                manufacturersPoolPercentage = 1
                break
            case 2:
                ubiPoolPercentage = 63
                upiPoolPercentage = 36
                manufacturersPoolPercentage = 1
                break
            case 3:
                ubiPoolPercentage = 45
                upiPoolPercentage = 54
                manufacturersPoolPercentage = 1
                break
            case 4:
                ubiPoolPercentage = 27
                upiPoolPercentage = 72
                manufacturersPoolPercentage = 1
                break
            case 5:
                ubiPoolPercentage = 9
                upiPoolPercentage = 90
                manufacturersPoolPercentage = 1
                break
            case 6:
                if (period === 'testnet-2') {
                    ubiPoolPercentage = 27
                    upiPoolPercentage = 72
                    manufacturersPoolPercentage = 1
                    break
                } else {
                    ubiPoolPercentage = 9
                    upiPoolPercentage = 90
                    manufacturersPoolPercentage = 1
                    break
                }

            case 7:
                if (period === 'testnet-2') {
                    ubiPoolPercentage = 45
                    upiPoolPercentage = 54
                    manufacturersPoolPercentage = 1
                    break

                } else {
                    ubiPoolPercentage = 9
                    upiPoolPercentage = 90
                    manufacturersPoolPercentage = 1
                    break
                }
            case 8:
                if (period === 'testnet-2') {
                    ubiPoolPercentage = 63
                    upiPoolPercentage = 36
                    manufacturersPoolPercentage = 1
                    break

                } else {
                    ubiPoolPercentage = 9
                    upiPoolPercentage = 90
                    manufacturersPoolPercentage = 1
                    break
                }
            case 9:
                if (period === 'testnet-2') {

                    ubiPoolPercentage = 81
                    upiPoolPercentage = 18
                    manufacturersPoolPercentage = 1
                    break
                } else {
                    ubiPoolPercentage = 9
                    upiPoolPercentage = 90
                    manufacturersPoolPercentage = 1
                    break
                }
            default:
                ubiPoolPercentage = 9
                upiPoolPercentage = 90
                manufacturersPoolPercentage = 1
                break
        }
        const epochAmount = period === 'mainnet' ? BigInt(getPoolPerEpochAmount(epochNumber)) : getTestnetAmount(epochNumber)
        const upiAmount = BigInt((BigInt(epochAmount) * BigInt(upiPoolPercentage)) / BigInt(100))
        const ubiAmount = BigInt((BigInt(epochAmount) * BigInt(ubiPoolPercentage)) / BigInt(100))

        const manufacturersAmount = epochAmount - upiAmount - ubiAmount
        return { ubiAmount, upiAmount, manufacturersAmount, epochAmount }
    } catch (error) {
        console.error('getPoolPerEpochAmounts error', error);
        return null;
    }
}

export const getPoolPerEpochAmount = (epochNumber: number) => {
    if (epochNumber === 0) {
        return BigInt(0)
    }
    if (epochNumber === 1) {
        return BigInt(1200000000000)
    } else if (epochNumber === 36525) {
        return BigInt(70630823)
    } else if (epochNumber > 36525) {
        return BigInt(0)
    }

    const reductionPercentage = 0.999733349023419
    return BigInt((1200000000000 * Math.pow(Number(reductionPercentage), epochNumber - 1)).toFixed(0))
}

export const getPoolPerEpochByEpoch = async (epoch: Date) => {
  // Validate dateStr format
  if (!moment(epoch, 'YYYY-MM-DD', true).isValid()) {
    console.log('Invalid date format; not "YYYY-MM-DD"')
    return null
  }
  const epochDocument = await getPoolPerEpochByEpochQuery(epoch)
  return epochDocument
}
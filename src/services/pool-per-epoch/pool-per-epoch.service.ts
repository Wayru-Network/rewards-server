import { ENV } from "@config/env/env"
import { getPoolPerEpochNumber, getPoolPerEpochByEpoch as getPoolPerEpochByEpochQuery } from "./queries"
import moment from "moment"

export const getPoolPerEpochAmounts = async (epoch: Date) => {
    try {
        const { ubiPoolPercentage, upiPoolPercentage, period, epochNumber } = await getPoolPerEpochPercentage(epoch)
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

export const getPoolPerEpochPercentage = async (epochDate: Date) => {
    const period = ENV.REWARDS_PERIOD
    const epochNumber = await getPoolPerEpochNumber(epochDate)
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
    return { ubiPoolPercentage, upiPoolPercentage, manufacturersPoolPercentage, epochNumber, period }
}

export const getPoolPerEpochAmount = (epochNumber: number) => {
    if (epochNumber === 0) {
        return BigInt(0)
    }
    if (epochNumber === 1) {
        return BigInt(1200000000000)
    } else if (epochNumber === 36525) {
        return BigInt(70630713)
    } else if (epochNumber > 36525) {
        return BigInt(0)
    }

    const reductionPercentage = 0.999733349023419
    return BigInt((1200000000000 * Math.pow(Number(reductionPercentage), epochNumber - 1)).toFixed(0))
}

export const getPoolPerEpochAmountsMainnet = async (epochNumber: number, epochDate: Date) => {
    const { ubiPoolPercentage, upiPoolPercentage, period } = await getPoolPerEpochPercentage(epochDate)
    
    // total amount of the emission
    const totalEmissionAmount = period === 'mainnet' ? 
                        BigInt(getPoolPerEpochAmount(epochNumber)) :
                        getTestnetAmount(epochNumber)
    
    // 1: oracles: totalEmissionAmount * 20%
    const oraclesAmount = (totalEmissionAmount * BigInt(20)) / BigInt(100)
    
    // 2: manufacturers: (totalEmissionAmount * 80%) * 1%
    const totalForHotspotsAndManufacturers = (totalEmissionAmount * BigInt(80)) / BigInt(100)
    
    // Manufacturers receive 1% of that 80%
    const manufacturersAmount = (totalForHotspotsAndManufacturers * BigInt(1)) / BigInt(100)
    
    // 3: hotspots: (totalForHotspotsAndManufacturers * 80%) * 99%
    const hotspotsAmount = (totalForHotspotsAndManufacturers * BigInt(99)) / BigInt(100)

    // Calculation of UBI and UPI based on the hotspots amount
    // calculate with totalForHotspotsAndManufacturers because it's the 80% of the totalEmissionAmount
    // and upiPoolPercentage & ubiPoolPercentage has un percentage of 99% together, so we 
    // need to calculate with the 80% and not with the 79% that it's hotspotsAmount
    const upiAmount = ((totalForHotspotsAndManufacturers) * BigInt(upiPoolPercentage)) / BigInt(100)
    const ubiAmount = ((totalForHotspotsAndManufacturers) * BigInt(ubiPoolPercentage)) / BigInt(100)


    return { oraclesAmount, manufacturersAmount, hotspotsAmount, upiAmount, ubiAmount, totalEmissionAmount }
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

export const getTestnetAmount = (epochNumber: number) => (epochNumber > 0 ? BigInt(960000000000) : BigInt(0))

export const testPoolPerEpochAmountMainnet = async () => {
    
    // Function to format large numbers
    const formatNumber = (num: bigint) => {
        // Divide by 1,000,000 to get the correct representation
        const numValue = Number(num) / 1000000;
        return numValue.toLocaleString('en-US', {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6
        });
    };
    
    // Total for verification
    let totalEmissionSum = 0;
    let totalHotspotsSum = 0;
    let totalManufacturersSum = 0;
    let totalOraclesSum = 0;
    const startEpoch = 1;        // From the first epoch
    const endEpoch = 36525;      // Until the last
    
    console.log(`Calculating total emission from epoch ${startEpoch} to ${endEpoch}...`);
    
    let counter = 0;
    
    for (let i = startEpoch; i <= endEpoch;) {
        // Calculate the epoch number
        const epochNumber = i;
        const currentDate = moment.utc('2023-04-30T00:00:00Z').add(i-1, 'days');
        const formattedDate = currentDate.format('YYYY-MM-DD');
        
        // Get the amounts using the function
        const amounts = await getPoolPerEpochAmountsMainnet(epochNumber, currentDate.toDate());
        
        // Convert BigInts to formatted strings for JSON (keep this part)
        const readableAmounts = {
            date: formattedDate,
            epochNumber,
            totalEmission: {
                raw: amounts.totalEmissionAmount.toString(),
                formatted: formatNumber(amounts.totalEmissionAmount)
            },
            hotspots: {
                raw: amounts.hotspotsAmount.toString(),
                formatted: formatNumber(amounts.hotspotsAmount),
                percentage: "79.20%"
            },
            manufacturers: {
                raw: amounts.manufacturersAmount.toString(),
                formatted: formatNumber(amounts.manufacturersAmount),
                percentage: "0.80%"
            },
            oracles: {
                raw: amounts.oraclesAmount.toString(),
                formatted: formatNumber(amounts.oraclesAmount),
                percentage: "20.00%"
            },
            upi: {
                raw: amounts.upiAmount.toString(),
                formatted: formatNumber(amounts.upiAmount)
            },
            ubi: {
                raw: amounts.ubiAmount.toString(),
                formatted: formatNumber(amounts.ubiAmount)
            },
            totalPercentage: "100.00%"
        };
        
        // For this specific test, we do not save in the array to avoid memory
        //results.push(readableAmounts);
        
        // Add directly the numeric value without formatting to avoid NaN
        const emissionToAdd = Number(amounts.totalEmissionAmount) / 1000000;
        const hotspotsToAdd = Number(amounts.hotspotsAmount) / 1000000;
        const manufacturersToAdd = Number(amounts.manufacturersAmount) / 1000000;
        const oraclesToAdd = Number(amounts.oraclesAmount) / 1000000;
        
        // Verify if the value is valid
        if (isNaN(emissionToAdd) || isNaN(hotspotsToAdd) || isNaN(manufacturersToAdd) || isNaN(oraclesToAdd)) {
            console.error(`Found NaN at epoch ${epochNumber}`);
            console.error(`Emission: ${emissionToAdd}, Hotspots: ${hotspotsToAdd}, Manufacturers: ${manufacturersToAdd}, Oracles: ${oraclesToAdd}`);
            break;
        }
        
        totalEmissionSum += emissionToAdd;
        totalHotspotsSum += hotspotsToAdd;
        totalManufacturersSum += manufacturersToAdd;
        totalOraclesSum += oraclesToAdd;
        
        // Show progress every 1000 epochs
        counter++;
        if (counter % 1000 === 0 || epochNumber === endEpoch) {
            console.log(`Processed ${counter} epochs. Current total: ${totalEmissionSum.toFixed(6)}`);
        }
        
        i++;
    }

    const emissionExpectedTotal = 4500000000.000000;
    const hotspotsExpectedTotal = Number('3,564,000,000.000000'.replace(/,/g, '')); // 79.20% of the emission
    const manufacturersExpectedTotal = Number('36,000,000.000000'.replace(/,/g, '')); // 0.80% of the emission
    const oraclesExpectedTotal = Number('900,000,000.000000'.replace(/,/g, '')); // 20.00% of the emission
    
    console.log('***************** ----- Emissions results ------- *****************');
    console.log(`Total emission sum: ${totalEmissionSum.toFixed(6)}`);
    console.log(`Expected total: ${emissionExpectedTotal.toFixed(6)}`);
    const emissionDifference = totalEmissionSum - emissionExpectedTotal;
    console.log(`Difference: ${(emissionDifference).toFixed(6)}`);
    console.log('***************** ----- hotspots results ------- *****************');
    console.log(`Total hotspots sum: ${totalHotspotsSum.toFixed(6)}`);
    console.log(`Expected total: ${hotspotsExpectedTotal.toFixed(6)}`);
    const hotspotsDifference = totalHotspotsSum - hotspotsExpectedTotal;
    console.log(`Difference: ${(hotspotsDifference).toFixed(6)}`);
    console.log('***************** ----- manufacturers results ------- *****************');
    console.log(`Total manufacturers sum: ${totalManufacturersSum.toFixed(6)}`);
    console.log(`Expected total: ${manufacturersExpectedTotal.toFixed(6)}`);
    const manufacturersDifference = totalManufacturersSum - manufacturersExpectedTotal;
    console.log(`Difference: ${(manufacturersDifference).toFixed(6)}`);
    console.log('***************** ----- oracles results ------- *****************');
    console.log(`Total oracles sum: ${totalOraclesSum.toFixed(6)}`);
    console.log(`Expected total: ${oraclesExpectedTotal.toFixed(6)}`);
    const oraclesDifference = totalOraclesSum - oraclesExpectedTotal;
    console.log(`Difference: ${(oraclesDifference).toFixed(6)}`);

    // do not save the results in a JSON file because it's too big
    // Save in a JSON file
    //const fs = require('fs');
    //const outputPath = 'pool_amounts_test.json';
    //fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    //console.log(`Results saved to ${outputPath}`);
    
    
    console.log(`Test completed.`);
    return totalEmissionSum;
}
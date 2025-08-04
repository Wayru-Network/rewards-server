import { initiateRewardsProcessing } from "@services/rewards-per-epoch/rabbit-rewards-messages/initiate-rewards-processing.service";
import {
    getPoolPerEpochNumber,
    getPoolPerEpochByEpoch as getPoolPerEpochByEpochQuery,
    getPoolPerEpochToRegenerate,
    deleteRewardsByPoolPerEpochId,
    updatePoolPerEpochById,
} from "./queries";
import moment from "moment";

export const getPoolPerEpochPercentage = async (epochDate: Date) => {
    const epochNumber = await getPoolPerEpochNumber(epochDate);
    console.log("epochNumber", epochNumber);
    const epochYear = Math.ceil(epochNumber / 365);
    let ubiPoolPercentage: number;
    let upiPoolPercentage: number;
    let manufacturersPoolPercentage: number;

    switch (epochYear) {
        case 1:
            ubiPoolPercentage = 81;
            upiPoolPercentage = 18;
            manufacturersPoolPercentage = 1;
            break;
        case 2:
            ubiPoolPercentage = 63;
            upiPoolPercentage = 36;
            manufacturersPoolPercentage = 1;
            break;
        case 3:
            ubiPoolPercentage = 45;
            upiPoolPercentage = 54;
            manufacturersPoolPercentage = 1;
            break;
        case 4:
            ubiPoolPercentage = 27;
            upiPoolPercentage = 72;
            manufacturersPoolPercentage = 1;
            break;
        case 5:
            ubiPoolPercentage = 9;
            upiPoolPercentage = 90;
            manufacturersPoolPercentage = 1;
            break;
        case 6:
            ubiPoolPercentage = 9;
            upiPoolPercentage = 90;
            manufacturersPoolPercentage = 1;
            break;
        case 7:
            ubiPoolPercentage = 9;
            upiPoolPercentage = 90;
            manufacturersPoolPercentage = 1;
            break;
        case 8:
            ubiPoolPercentage = 9;
            upiPoolPercentage = 90;
            manufacturersPoolPercentage = 1;
            break;
        case 9:
            ubiPoolPercentage = 9;
            upiPoolPercentage = 90;
            manufacturersPoolPercentage = 1;
            break;
        default:
            ubiPoolPercentage = 9;
            upiPoolPercentage = 90;
            manufacturersPoolPercentage = 1;
            break;
    }
    return {
        ubiPoolPercentage,
        upiPoolPercentage,
        manufacturersPoolPercentage,
        epochNumber,
    };
};

export const getPoolPerEpochAmount = (epochNumber: number) => {
    if (epochNumber === 0) {
        return BigInt(0);
    }
    if (epochNumber === 1) {
        return BigInt(120000000000000);
    } else if (epochNumber === 36525) {
        return BigInt(7063071300);
    } else if (epochNumber > 36525) {
        return BigInt(0);
    }

    const reductionPercentage = 0.999733349023419;
    return BigInt(
        (
            120000000000000 * Math.pow(Number(reductionPercentage), epochNumber - 1)
        ).toFixed(0)
    );
};

export const getPoolPerEpochAmountsMainnet = async (epochDate: Date) => {
    const { ubiPoolPercentage, upiPoolPercentage, epochNumber } =
        await getPoolPerEpochPercentage(epochDate);
    // total amount of the emission
    const totalEmissionAmount = BigInt(getPoolPerEpochAmount(epochNumber));

    // 1: oracles: totalEmissionAmount * 20%
    const oraclesAmount = (totalEmissionAmount * BigInt(20)) / BigInt(100);

    // 2: manufacturers: (totalEmissionAmount * 80%) * 1%
    const totalForHotspotsAndManufacturers =
        (totalEmissionAmount * BigInt(80)) / BigInt(100);

    // Manufacturers receive 1% of that 80%
    const manufacturersAmount =
        (totalForHotspotsAndManufacturers * BigInt(1)) / BigInt(100);

    // 3: hotspots: (totalForHotspotsAndManufacturers * 80%) * 99%
    const hotspotsAmount =
        (totalForHotspotsAndManufacturers * BigInt(99)) / BigInt(100);

    // Calculation of UBI and UPI based on the hotspots amount
    // calculate with totalForHotspotsAndManufacturers because it's the 80% of the totalEmissionAmount
    // and upiPoolPercentage & ubiPoolPercentage has un percentage of 99% together, so we
    // need to calculate with the 80% and not with the 79% that it's hotspotsAmount
    const upiAmount =
        (totalForHotspotsAndManufacturers * BigInt(upiPoolPercentage)) /
        BigInt(100);
    const ubiAmount =
        (totalForHotspotsAndManufacturers * BigInt(ubiPoolPercentage)) /
        BigInt(100);

    return {
        oraclesAmount,
        manufacturersAmount,
        hotspotsAmount,
        upiAmount,
        ubiAmount,
        totalEmissionAmount,
        epochNumber,
    };
};

export const getPoolPerEpochByEpoch = async (epoch: Date) => {
    // Validate dateStr format
    if (!moment(epoch, "YYYY-MM-DD", true).isValid()) {
        console.log('Invalid date format; not "YYYY-MM-DD"');
        return null;
    }
    const epochDocument = await getPoolPerEpochByEpochQuery(epoch);
    return epochDocument;
};

export const testPoolPerEpochAmountMainnet = async () => {
    // Total for verification
    let totalEmissionSum: number = 0;
    let totalHotspotsSum: number = 0;
    let totalManufacturersSum: number = 0;
    let totalOraclesSum: number = 0;
    const startEpoch = 1; // From the first epoch
    const endEpoch = 36525; // Until the last

    console.log(
        `Calculating total emission from epoch ${startEpoch} to ${endEpoch}...`
    );

    let counter = 0;
    let results = [];

    for (let i = startEpoch; i <= endEpoch;) {
        // Calculate the epoch number
        const epochNumber = i;
        const currentDate = moment.utc("2025-04-30T00:00:00Z").add(i - 1, "days");
        const formattedDate = currentDate.format("YYYY-MM-DD");

        // Get the amounts using the function
        const amounts = await getPoolPerEpochAmountsMainnet(currentDate.toDate());

        // Convert BigInts to formatted strings for JSON (keep this part)
        const readableAmounts = {
            date: formattedDate,
            epochNumber,
            totalEmission: {
                raw: amounts.totalEmissionAmount.toString(),
                formatted: formatPoolNumber(amounts.totalEmissionAmount).formatted,
            },
            hotspots: {
                raw: amounts.hotspotsAmount.toString(),
                formatted: formatPoolNumber(amounts.hotspotsAmount).formatted,
                percentage: "79.20%",
            },
            manufacturers: {
                raw: amounts.manufacturersAmount.toString(),
                formatted: formatPoolNumber(amounts.manufacturersAmount).formatted,
                percentage: "0.80%",
            },
            oracles: {
                raw: amounts.oraclesAmount.toString(),
                formatted: formatPoolNumber(amounts.oraclesAmount).formatted,
                percentage: "20.00%",
            },
            upi: {
                raw: amounts.upiAmount.toString(),
                formatted: formatPoolNumber(amounts.upiAmount).formatted,
            },
            ubi: {
                raw: amounts.ubiAmount.toString(),
                formatted: formatPoolNumber(amounts.ubiAmount).formatted,
            },
            totalPercentage: "100.00%",
        };

        // For this specific test, we do not save in the array to avoid memory
        results.push(readableAmounts);

        // Add directly the numeric value without formatting to avoid NaN
        const emissionToAdd = Number(readableAmounts.totalEmission.formatted);
        const hotspotsToAdd = Number(readableAmounts.hotspots.formatted);
        const manufacturersToAdd = Number(readableAmounts.manufacturers.formatted);
        const oraclesToAdd = Number(readableAmounts.oracles.formatted);

        totalEmissionSum += emissionToAdd;
        totalHotspotsSum += hotspotsToAdd;
        totalManufacturersSum += manufacturersToAdd;
        totalOraclesSum += oraclesToAdd;

        // Show progress every 1000 epochs
        counter++;
        if (counter % 1000 === 0 || epochNumber === endEpoch) {
            console.log(
                `Processed ${counter} epochs. Current total: ${totalEmissionSum}`
            );
        }

        i++;
    }

    const emissionExpectedTotal = 4500000000.0;
    const hotspotsExpectedTotal = Number(
        "3,564,000,000.00000000".replace(/,/g, "")
    ); // 79.20% of the emission
    const manufacturersExpectedTotal = Number(
        "36,000,000.00000000".replace(/,/g, "")
    ); // 0.80% of the emission
    const oraclesExpectedTotal = Number("900,000,000.00000000".replace(/,/g, "")); // 20.00% of the emission

    console.log(
        "***************** ----- Emissions results ------- *****************"
    );
    const emissionSumNumber = totalEmissionSum;
    console.log(`Total emission sum: ${emissionSumNumber.toFixed(8)}`);
    console.log(`Expected total: ${emissionExpectedTotal.toFixed(8)}`);
    const emissionDifference = emissionExpectedTotal - emissionSumNumber;
    console.log(`Difference: ${emissionDifference.toFixed(8)}`);
    console.log(
        "***************** ----- hotspots results ------- *****************"
    );
    const hotspotsSumNumber = totalHotspotsSum;
    console.log(`Total hotspots sum: ${hotspotsSumNumber.toFixed(8)}`);
    console.log(`Expected total: ${hotspotsExpectedTotal.toFixed(8)}`);
    const hotspotsDifference = hotspotsExpectedTotal - hotspotsSumNumber;
    console.log(`Difference: ${hotspotsDifference.toFixed(8)}`);
    console.log(
        "***************** ----- manufacturers results ------- *****************"
    );
    const manufacturersSumNumber = totalManufacturersSum;
    console.log(`Total manufacturers sum: ${manufacturersSumNumber.toFixed(8)}`);
    console.log(`Expected total: ${manufacturersExpectedTotal.toFixed(8)}`);
    const manufacturersDifference =
        manufacturersExpectedTotal - manufacturersSumNumber;
    console.log(`Difference: ${manufacturersDifference.toFixed(8)}`);
    console.log(
        "***************** ----- oracles results ------- *****************"
    );
    const oraclesSumNumber = totalOraclesSum;
    console.log(`Total oracles sum: ${oraclesSumNumber.toFixed(8)}`);
    console.log(`Expected total: ${oraclesExpectedTotal.toFixed(8)}`);
    const oraclesDifference = oraclesExpectedTotal - oraclesSumNumber;
    console.log(`Difference: ${oraclesDifference.toFixed(8)}`);

    // do not save the results in a JSON file because it's too big
    // Save in a JSON file
    const fs = require("fs");
    const outputPath = "pool_amounts_test.json";
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    //console.log(`Results saved to ${outputPath}`);

    console.log(`Test completed.`);
    return totalEmissionSum;
};

export const formatPoolNumber = (num: bigint) => {
    // Divide by 1,000,000 to get the correct representation
    const numValue = Number(num) / 100000000;
    const formattedNumber = numValue.toFixed(6);
    return {
        numValue: numValue,
        formatted: formattedNumber,
    };
};

export const regenerateRewards = async () => {
    try {
        const poolPerEpoch = await getPoolPerEpochToRegenerate();
        if (!poolPerEpoch) {
            console.log("🐇 No pool per epoch to regenerate");
            return;
        }
        // update the pool per epoch status to regenerating rewards
        await updatePoolPerEpochById(poolPerEpoch.id, {
            regenerate_rewards_status: "regenerating_rewards",
        });

        // delete rewards by pool per epoch id
        const { error, message, rewardsDeleted } =
            await deleteRewardsByPoolPerEpochId(
                poolPerEpoch.id,
                poolPerEpoch.regenerate_rewards_type
            );
        if (error) {
            console.error("🐇 Error deleting rewards:", message);
            console.log(
                "updating pool per epoch status to error_regenerating_rewards, id: ",
                poolPerEpoch.id
            );
            await updatePoolPerEpochById(poolPerEpoch.id, {
                regenerate_rewards_status: "error_regenerating_rewards",
                processing_metrics: {
                    ...poolPerEpoch?.processing_metrics,
                    regenerate_rewards_error_message: message,
                    rewards_deleted: rewardsDeleted,
                },
            });
            return;
        } else {
            console.log(
                "🐇 Rewards deleted: " +
                rewardsDeleted +
                " with type: " +
                poolPerEpoch.regenerate_rewards_type,
                "pool per epoch id: " + poolPerEpoch.id
            );

            // start to process rewards
            await initiateRewardsProcessing(
                poolPerEpoch.id,
                poolPerEpoch.regenerate_rewards_type
            );
        }
    } catch (error) {
        console.error("regenerateRewards error", error);
    }
};

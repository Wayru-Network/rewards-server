
export const roundDownTo6Decimals = (num: number): string => {
    const factor = 1000000;
    const roundedDown = Math.floor(num * factor) / factor;
    return roundedDown.toFixed(6);
}
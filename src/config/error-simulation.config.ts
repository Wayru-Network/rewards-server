import { ENV } from "./env/env";

export const ERROR_SIMULATION = {
    enabled: ENV.ENABLE_ERROR_SIMULATION,
    scenarios: {
        wupiSync: {
            enabled: true,
            failureRate: 100, // percentage of failure
            errorMessage: 'Simulated WUPI sync failure'
        },
        // ... other scenarios
    }
} as const;
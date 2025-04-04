import { ERROR_SIMULATION } from "@config/error-simulation.config";

export class ErrorSimulator {
    private static instance: ErrorSimulator;
    private config: typeof ERROR_SIMULATION;

    private constructor() {
        this.config = ERROR_SIMULATION;
    }

    static getInstance(): ErrorSimulator {
        if (!ErrorSimulator.instance) {
            ErrorSimulator.instance = new ErrorSimulator();
        }
        return ErrorSimulator.instance;
    }

    shouldSimulateError(scenario: keyof typeof ERROR_SIMULATION.scenarios): boolean {
        if (!this.config.enabled) return false;
        
        const scenarioConfig = this.config.scenarios[scenario];
        if (!scenarioConfig.enabled) return false;

        return Math.random() * 100 < scenarioConfig.failureRate;
    }

    getErrorMessage(scenario: keyof typeof ERROR_SIMULATION.scenarios): string {
        return this.config.scenarios[scenario].errorMessage;
    }
}
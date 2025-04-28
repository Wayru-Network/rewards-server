import { ENV } from '@config/env/env';

/**
 * Rate limiter service to control the rate of processing messages
 * This helps prevent RPC errors due to too many requests
 */
class RateLimiter {
  private static instance: RateLimiter;
  private tokens: number;
  private lastRefill: number;
  private readonly refillRate: number;
  private readonly maxTokens: number;
  private processingQueue: Array<() => Promise<void>> = [];
  private isProcessing: boolean = false;
  private lastExecutionTime: number = 0;
  private readonly minInterval: number;

  private constructor() {
    // Get rate limit from environment or use default (50 requests per second)
    this.maxTokens = ENV.RABBIT_RATE_LIMIT_PER_SECOND || 50;
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.refillRate = 1000; // 1 second in milliseconds
    this.minInterval = 1000 / this.maxTokens;
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillRate) * this.maxTokens;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  /**
   * Process the queue of tasks
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      this.refillTokens();
      
      if (this.tokens <= 0) {
        // Wait for tokens to refill
        const waitTime = this.refillRate - (Date.now() - this.lastRefill);
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.refillTokens();
      }

      const now = Date.now();
      const wait = Math.max(0, this.lastExecutionTime + this.minInterval - now);
      if (wait > 0) {
        await new Promise(resolve => setTimeout(resolve, wait));
      }
      this.lastExecutionTime = Date.now();

      const task = this.processingQueue.shift();
      if (task) {
        this.tokens--;
        console.log(`[RateLimiter] processing message at ${new Date().toISOString()}`);
        try {
          await task();
        } catch (error) {
          console.error('Error processing rate-limited task:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Add a task to the rate-limited queue
   * @param task The task to execute
   */
  public async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.processingQueue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          console.error('Error processing rate-limited task:', error);
          reject(error);
        }
      });
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }
}

export const rateLimiter = RateLimiter.getInstance(); 
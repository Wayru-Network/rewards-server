# Rate Limiter for RabbitMQ Consumers

This document explains how to use the rate limiter for RabbitMQ consumers to prevent RPC errors due to too many requests.

## Overview

The rate limiter controls how many messages are processed per second by the RabbitMQ consumers. This helps prevent RPC errors due to too many requests, especially when processing large batches of messages.

## Configuration

The rate limiter is configured using the `RABBIT_RATE_LIMIT_PER_SECOND` environment variable. This variable specifies the maximum number of messages that can be processed per second.

### Default Value

If not specified, the default value is 50 messages per second.

### Setting the Rate Limit

You can set the rate limit by adding the following to your `.env` file:

```
RABBIT_RATE_LIMIT_PER_SECOND=30
```

This will limit the processing to 30 messages per second.

## How It Works

The rate limiter uses a token bucket algorithm to control the rate of message processing. Each message requires one token to be processed. Tokens are refilled at a rate specified by the `RABBIT_RATE_LIMIT_PER_SECOND` environment variable.

If there are no tokens available, the rate limiter will wait until tokens are refilled before processing more messages.

## Monitoring

You can monitor the rate limiter by checking the logs. If the rate limiter is working correctly, you should see a steady flow of messages being processed, without any RPC errors due to too many requests.

## Adjusting the Rate Limit

If you're still experiencing RPC errors, you may need to adjust the rate limit. Try reducing the rate limit to a lower value, such as 20 or 10 messages per second.

If you're not experiencing any RPC errors and want to process messages faster, you can increase the rate limit.

## Example

For the data you provided:

```
{
  "status": "completed",
  "endTime": "2025-04-26T00:11:26.308Z",
  "epochId": 230,
  "startTime": "2025-04-26T00:10:38.616Z",
  "processingTimeMs": 47692,
  "totalWubiNFNodes": 1361,
  "totalWupiNFNodes": 1384,
  "averageTimePerNode": "17.37ms per node",
  "processingTimeFormatted": "0h 0m 47s"
}
```

With a rate limit of 50 messages per second, it would take approximately 55 seconds to process all 2745 nodes (1361 + 1384). This is slightly longer than the current processing time of 47 seconds, but it should prevent RPC errors.

If you want to maintain the current processing time of 47 seconds, you would need a rate limit of approximately 59 messages per second (2745 / 47). However, this might lead to RPC errors. A better approach would be to increase the rate limit gradually, starting with 50 messages per second, and monitoring for RPC errors. 
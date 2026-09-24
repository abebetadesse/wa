/**
 * tokenBucketRateLimiter.ts — Pillar 3, Point 11
 *
 * Simple in-process token-bucket rate limiter for NCBI E-Utilities and
 * other external HTTP APIs to prevent HTTP 429 rate-limit errors.
 *
 * NCBI rules (unauthenticated): 3 requests/second
 * NCBI rules (API key):         10 requests/second
 *
 * Usage:
 *   const limiter = createTokenBucket({ ratePerSec: 3, burstSize: 5 });
 *   await limiter.throttle(); // waits until a token is available
 */

export interface TokenBucketOptions {
  /** Maximum sustained requests per second */
  ratePerSec: number;
  /** Maximum burst tokens (initial balance). Defaults to ratePerSec * 2. */
  burstSize?: number;
}

export interface TokenBucket {
  /** Acquire a token, waiting if none are available. */
  throttle(): Promise<void>;
  /** Inspect current token balance (for monitoring). */
  readonly tokens: number;
}

/**
 * Creates a token-bucket rate limiter.
 * Thread-safe within a single Node.js event loop tick.
 */
export function createTokenBucket(opts: TokenBucketOptions): TokenBucket {
  const { ratePerSec } = opts;
  const burstSize = opts.burstSize ?? ratePerSec * 2;
  const intervalMs = 1000 / ratePerSec;

  let tokens = burstSize;
  let lastRefill = Date.now();

  function refill() {
    const now = Date.now();
    const elapsed = now - lastRefill;
    const newTokens = Math.floor(elapsed / intervalMs);
    if (newTokens > 0) {
      tokens = Math.min(burstSize, tokens + newTokens);
      lastRefill = now;
    }
  }

  const bucket: TokenBucket = {
    get tokens() {
      refill();
      return tokens;
    },
    async throttle(): Promise<void> {
      refill();
      if (tokens > 0) {
        tokens--;
        return;
      }
      // Wait for the next token
      const wait = intervalMs - (Date.now() - lastRefill);
      await new Promise<void>((resolve) => setTimeout(resolve, wait > 0 ? wait : intervalMs));
      return bucket.throttle();
    },
  };

  return bucket;
}

/**
 * Singleton PubMed/NCBI rate limiter.
 * Reads NCBI_API_KEY from environment to select the correct rate.
 */
const _globalLimiters = globalThis as unknown as {
  _ncbiRateLimiter?: TokenBucket;
};

export function getNcbiRateLimiter(): TokenBucket {
  if (!_globalLimiters._ncbiRateLimiter) {
    const hasApiKey = !!process.env.NCBI_API_KEY;
    _globalLimiters._ncbiRateLimiter = createTokenBucket({
      ratePerSec: hasApiKey ? 10 : 3,
      burstSize:  hasApiKey ? 20 : 6,
    });
  }
  return _globalLimiters._ncbiRateLimiter;
}

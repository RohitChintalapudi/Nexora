import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

/**
 * Get or initialize the Upstash Redis client
 * @returns {Redis|null}
 */
export const getRedis = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      });
    } catch (err) {
      console.warn('⚠️ Could not initialize Upstash Redis client:', err.message);
      return null;
    }
  }

  return redisClient;
};

export const CacheService = {
  /**
   * Retrieve cached value by key
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    try {
      const redis = getRedis();
      if (!redis) return null;
      const data = await redis.get(key);
      return data;
    } catch (err) {
      console.warn(`⚠️ [Redis Cache] Failed to get key '${key}':`, err.message);
      return null;
    }
  },

  /**
   * Set cache key with optional TTL (default 10 minutes = 600s)
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlSeconds=600]
   * @returns {Promise<boolean>}
   */
  async set(key, value, ttlSeconds = 600) {
    try {
      const redis = getRedis();
      if (!redis) return false;
      if (ttlSeconds > 0) {
        await redis.set(key, value, { ex: ttlSeconds });
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (err) {
      console.warn(`⚠️ [Redis Cache] Failed to set key '${key}':`, err.message);
      return false;
    }
  },

  /**
   * Invalidate a cached key
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async del(key) {
    try {
      const redis = getRedis();
      if (!redis) return false;
      await redis.del(key);
      return true;
    } catch (err) {
      console.warn(`⚠️ [Redis Cache] Failed to delete key '${key}':`, err.message);
      return false;
    }
  }
};

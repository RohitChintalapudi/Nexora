import dotenv from 'dotenv';
dotenv.config();
import { CacheService, getRedis } from '../src/config/redis.js';

async function testUpstashRedis() {
  console.log('Testing Upstash Redis connection...');

  try {
    const redis = getRedis();
    if (!redis) {
      throw new Error('Upstash Redis client not configured.');
    }

    const testKey = 'nexora:test:ping';
    const testVal = { status: 'online', timestamp: new Date().toISOString() };

    console.log('[INFO] Writing key to Upstash Redis...');
    await CacheService.set(testKey, testVal, 60);

    console.log('[INFO] Reading key from Upstash Redis...');
    const result = await CacheService.get(testKey);

    console.log('[PASS] Retrieved from Upstash Redis:', result);

    await CacheService.del(testKey);
    console.log('\n[SUCCESS] Upstash Redis is active, connected, and operating at high speed!');
  } catch (err) {
    console.error('[ERROR] Upstash Redis test failed:', err);
  }
}

testUpstashRedis();

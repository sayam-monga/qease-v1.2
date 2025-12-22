const redis = require('../redis');

class QueueService {
  constructor() {
    this.redis = redis;
  }

  // Add user to the waiting queue (Sorted Set)
  // Score = timestamp (FIFO)
  async enqueue(projectId, userId) {
    const timestamp = Date.now();
    await this.redis.zadd(`queue:${projectId}:waiting`, timestamp, userId);
    return timestamp;
  }

  // Get user's position in the queue
  async getPosition(projectId, userId) {
    // ZRANK returns 0-based index. +1 for human readable position.
    // If user is not in waiting list, it returns null.
    const rank = await this.redis.zrank(`queue:${projectId}:waiting`, userId);
    if (rank === null) return null;
    return rank + 1;
  }

  // Move N users from waiting to active
  async dequeue(projectId, count) {
    // Get top N users
    const users = await this.redis.zrange(`queue:${projectId}:waiting`, 0, count - 1);

    if (users.length > 0) {
      // Add to active set
      await this.redis.sadd(`queue:${projectId}:active`, ...users);
      // Remove from waiting list
      await this.redis.zrem(`queue:${projectId}:waiting`, ...users);
    }

    return users;
  }

  // Check if user is allowed to enter
  async isAllowed(projectId, userId) {
    const isMember = await this.redis.sismember(`queue:${projectId}:active`, userId);
    return isMember === 1;
  }

  // Remove user from active (e.g. session end)
  async leave(projectId, userId) {
    await this.redis.srem(`queue:${projectId}:active`, userId);
    await this.redis.zrem(`queue:${projectId}:waiting`, userId);
  }
}

module.exports = new QueueService();

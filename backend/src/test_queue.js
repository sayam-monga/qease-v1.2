const queueService = require('./services/queueService');
const redis = require('./redis');

async function testQueue() {
  const projectId = 'test-project';
  const user1 = 'user-1';
  const user2 = 'user-2';
  const user3 = 'user-3';

  console.log('Cleaning up...');
  await redis.del(`queue:${projectId}:waiting`);
  await redis.del(`queue:${projectId}:active`);

  console.log('Enqueuing users...');
  await queueService.enqueue(projectId, user1);
  await queueService.enqueue(projectId, user2);
  await queueService.enqueue(projectId, user3);

  console.log('Checking positions...');
  console.log('User 1 pos:', await queueService.getPosition(projectId, user1)); // Should be 1
  console.log('User 2 pos:', await queueService.getPosition(projectId, user2)); // Should be 2
  console.log('User 3 pos:', await queueService.getPosition(projectId, user3)); // Should be 3

  console.log('Checking allowance before dequeue...');
  console.log('User 1 allowed?', await queueService.isAllowed(projectId, user1)); // False

  console.log('Dequeueing 2 users...');
  const activeUsers = await queueService.dequeue(projectId, 2);
  console.log('Dequeued:', activeUsers); // [user1, user2]

  console.log('Checking positions after dequeue...');
  console.log('User 1 pos:', await queueService.getPosition(projectId, user1)); // Null (not in waiting)
  console.log('User 3 pos:', await queueService.getPosition(projectId, user3)); // Should be 1

  console.log('Checking allowance after dequeue...');
  console.log('User 1 allowed?', await queueService.isAllowed(projectId, user1)); // True
  console.log('User 2 allowed?', await queueService.isAllowed(projectId, user2)); // True
  console.log('User 3 allowed?', await queueService.isAllowed(projectId, user3)); // False

  console.log('Test Complete.');
  process.exit(0);
}

testQueue().catch(console.error);

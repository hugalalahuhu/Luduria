import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createConversation, expireMessages, sendMessage, viewFor } from './game.ts';
import { windowMsFor } from './rules.ts';

const A = 'user_a';
const B = 'user_b';

test('window schedule starts at 3s and grows by 1s', () => {
  assert.equal(windowMsFor(1), 3000);
  assert.equal(windowMsFor(2), 4000);
  assert.equal(windowMsFor(100), 30000);
});

test('stay vs stay pays 3 each and continues', () => {
  const conv = createConversation(A, B);
  sendMessage(conv, A, 'hi', 'stay', 0);
  const { results } = sendMessage(conv, B, 'hey', 'stay', 1000);
  assert.deepEqual(results[0]?.deltas, { [A]: 3, [B]: 3 });
  assert.equal(conv.status, 'active');
});

test('a silent reply counts as Skip, so Stay loses 5 and the other gains 5', () => {
  const conv = createConversation(A, B);
  sendMessage(conv, A, 'hi', 'stay', 0);
  const results = expireMessages(conv, 3001);
  assert.deepEqual(results[0]?.deltas, { [A]: -5, [B]: 5 });
  assert.equal(conv.status, 'active');
});

test('mutual Skip ends the conversation and pays 0.1 each', () => {
  const conv = createConversation(A, B);
  sendMessage(conv, A, 'bye', 'skip', 0);
  const { results } = sendMessage(conv, B, 'bye', 'skip', 1000);
  assert.deepEqual(results[0]?.deltas, { [A]: 0.1, [B]: 0.1 });
  assert.equal(conv.status, 'ended');
});

test('a Skip message with no reply ends the conversation', () => {
  const conv = createConversation(A, B);
  sendMessage(conv, A, 'bye', 'skip', 0);
  expireMessages(conv, 3001);
  assert.equal(conv.status, 'ended');
});

test('a reply answers the oldest open message from the other player (FIFO)', () => {
  const conv = createConversation(A, B);
  sendMessage(conv, A, 'one', 'stay', 0);
  sendMessage(conv, A, 'two', 'skip', 100);
  const { results } = sendMessage(conv, B, 'reply', 'stay', 500);
  assert.deepEqual(results[0]?.deltas, { [A]: 3, [B]: 3 });
  assert.equal(conv.open[A].length, 1);
  assert.equal(conv.open[A][0]?.text, 'two');
});

test('simultaneous messages resolve as one round', () => {
  const conv = createConversation(A, B);
  sendMessage(conv, A, 'a', 'stay', 0);
  const { results } = sendMessage(conv, B, 'b', 'skip', 0);
  assert.equal(results.length, 1);
  assert.deepEqual(results[0]?.deltas, { [A]: -5, [B]: 5 });
  assert.equal(conv.open[B].length, 1);
});

test('the player view contains no choices', () => {
  const conv = createConversation(A, B);
  sendMessage(conv, A, 'hi', 'skip', 0);
  const json = JSON.stringify(viewFor(conv, B, 100));
  assert.ok(!json.includes('"choice"'));
});

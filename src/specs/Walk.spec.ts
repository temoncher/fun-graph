import { walk } from '@/index';

describe('Walk', () => {
  test('is closed', () => {
    // arrange
    const walkToCheck: walk.Walk = [['A', 'B'], ['B', 'C'], ['C', 'A']];

    // act
    const isWalkClosed = walk.isClosed(walkToCheck);

    // assert
    expect(isWalkClosed).toBe(true);
  });

  test('is open', () => {
    // arrange
    const walkToCheck: walk.Walk = [['A', 'B'], ['B', 'C'], ['C', 'A']];

    // act
    const isWalkClosed = walk.isOpen(walkToCheck);

    // assert
    expect(isWalkClosed).toBe(false);
  });
});

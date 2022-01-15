import { walk, trail } from '@/index';

describe('Trail', () => {
  test('is trail', () => {
    // arrange
    const walkToCheck: walk.Walk = [['A', 'B'], ['B', 'C'], ['C', 'A']];

    // act
    const isWalkClosed = trail.isTrail(walkToCheck);

    // assert
    expect(isWalkClosed).toBe(true);
  });

  test('is not trail', () => {
    // arrange
    const walkToCheck: walk.Walk = [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'C']];

    // act
    const isWalkClosed = trail.isTrail(walkToCheck);

    // assert
    expect(isWalkClosed).toBe(false);
  });
});

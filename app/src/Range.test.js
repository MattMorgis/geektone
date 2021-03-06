import Range from './Range.js';

describe('range', () => {
  const range = new Range(5, 10);
  it('contains number between start and end', () => {
    expect(range.contains(7)).toBeTruthy();
  })

  it('does not contain number outside of start and end', () => {
    expect(range.contains(17)).toBeFalsy();
  })

  it('contains number at start or end', () => {
    expect(range.contains(10)).toBeTruthy();
    expect(range.contains(5)).toBeTruthy();
  })
});
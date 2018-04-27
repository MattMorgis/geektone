import Note from './Note.js';

describe('note increment/decrement', () => {
  it('bumps up a half note', () => {
    const note = new Note("C#4");
    note.incrementHalf();
    expect(note.name()).toEqual("D4");
  });

  it('increments octave when necessary', () => {
    const note = new Note("B4");
    note.incrementHalf();
    expect(note.name()).toEqual("C5");
  });

  it('bumps down a half note', () => {
    const note = new Note("C#4");
    note.decrementHalf();
    expect(note.name()).toEqual("C4");
  });

  it('decrements octave when necessary', () => {
    const note = new Note("C4");
    note.decrementHalf();
    expect(note.name()).toEqual("B3");
  });

  it('ignores attempts to go below octave 1', () => {
    const note = new Note("C1");
    note.decrementHalf();
    expect(note.name()).toEqual("C1");
  });

  it('ignores attempts to go above octave 8', () => {
    const note = new Note("C8");
    note.incrementHalf();
    expect(note.name()).toEqual("C8");
  });
})
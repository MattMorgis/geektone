import Bar from './Bar';
import Note from './Note';
import * as Duration from './Duration';

describe('a bar', () => {
  let bar;
  beforeEach(() => {
    bar = new Bar();
  });

  it('is empty when created', () => {
    expect(bar.isEmpty()).toBeTruthy();
    expect(bar.isFull()).toBeFalsy();
    expect(bar.sixteenths).toEqual(0);
  });

  it('is not empty after note pushed', () => {
    bar.push(new Note('E4'));

    expect(bar.isEmpty()).toBeFalsy();
  });

  it('is not full when less than 16 sixteenths', () => {
    bar.push(new Note('E4', Duration.half));

    expect(bar.isFull()).toBeFalsy();
  });

  it('updates sixteenths on push', () => {
    bar.push(new Note('E4', Duration.half));

    expect(bar.sixteenths).toEqual(8);
  });

  it('is full when contains 16 sixteenths', () => {
    bar.push(new Note('E4', Duration.whole));

    expect(bar.isFull()).toBeTruthy();
  });

  describe('accommodating new notes', () => {
    it('can not accommodate notes when full', () => {
      bar.push(new Note('E4', Duration.whole));

      expect(bar.canAccommodate(new Note('E4', Duration.sixteenth))).toBeFalsy();
    });

    it('can not accommodate note larger than remaining size', () => {
      bar.push(new Note('E4', Duration.half));

      expect(bar.canAccommodate(new Note('E4', Duration.whole))).toBeFalsy();
    });

    it('can accommodate note less than remaining size', () => {
      bar.push(new Note('E4', Duration.half));

      expect(bar.canAccommodate(new Note('E4', Duration.quarter))).toBeTruthy();
    });
  });

  describe('number of positions required for notes within', () => {
    it('is 1 for whole note', () => {
      bar.push(new Note('E5', Duration.whole));

      expect(bar.positionsRequired()).toEqual(1);
    });

    describe('no dotted notes', () => {
      it('is 2 if smallest note is a half', () => {
        bar.push(new Note('E5', Duration.whole));
        bar.push(new Note('E5', Duration.half));

        expect(bar.positionsRequired()).toEqual(2);
      });

      it('is 4 if smallest note is a quarter', () => {
        bar.push(new Note('E5', Duration.whole));
        bar.push(new Note('E5', Duration.quarter));

        expect(bar.positionsRequired()).toEqual(4);
      });

      it('is 8 if smallest note is an eighth', () => {
        bar.push(new Note('E5', Duration.whole));
        bar.push(new Note('E5', Duration.eighth));

        expect(bar.positionsRequired()).toEqual(8);
      });

      it('is 16 if smallest note is a sixteenth', () => {
        bar.push(new Note('E5', Duration.whole));
        bar.push(new Note('E5', Duration.sixteenth));

        expect(bar.positionsRequired()).toEqual(16);
      });
    });

    describe('with dotted notes', () => {
      it('is 4 if smallest note is dotted half', () => {
        bar.push(new Note('E5', Duration.whole));
        bar.push(new Note('E5', '4n.'));

        expect(bar.positionsRequired()).toEqual(8);
      });

      it('is 8 if smallest note is dotted quarter', () => {
        bar.push(new Note('E5', Duration.whole));
        bar.push(new Note('E5', '4n.'));

        expect(bar.positionsRequired()).toEqual(8);
      });

      it('is 16 if smallest note is dotted eighth', () => {
        bar.push(new Note('E5', Duration.whole));
        bar.push(new Note('E5', '8n.'));

        expect(bar.positionsRequired()).toEqual(16);
      });
    });
  })
});
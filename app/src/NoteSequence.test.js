import NoteSequence from './NoteSequence'
import * as Duration from './Duration'
import Note from './Note'

describe('NoteSequence', () => {
  let sequence

  describe('empty sequence', () => {
    describe('toJSON', () => {
      it('converts a notesequence to persistable JSON', () => {
        sequence = new NoteSequence([['E4', '4n'], ['F4', '8n'], ['G4', '16n']])

        expect(sequence.toJSON()).toEqual([
          { name: 'E4', duration: '4n', isNote: true },
          { name: 'F4', duration: '8n', isNote: true },
          { name: 'G4', duration: '16n', isNote: true }
        ])
      })
    })

    describe('construction', () => {
      it('can be constructed with multiple notes', () => {
        sequence = new NoteSequence(['E4', 'F4'])

        expect(sequence.allNoteNames()).toEqual(['E4', 'F4'])
      })

      it('can be constructed with multiple notes', () => {
        sequence = new NoteSequence([['E4', '4n'], ['F4', '8n']])

        expect(sequence.note(0).duration).toEqual('4n')
        expect(sequence.note(1).duration).toEqual('8n')
      })

      it('restores rest boolean', () => {
        sequence = new NoteSequence([['E4', '4n', false]])

        expect(sequence.note(0).isNote).toBeFalsy()
      })
    })
  })

  describe('create ties for too-long note', () => {
    let sequence
    const halfNote = new Note('E4', '2n')
    const quarterNote = new Note('E4', '4n')
    const dottedEighthNote = new Note('E4', '8n.')
    const eighthNote = new Note('E4', '8n')
    const sixteenthNote = new Note('E4', '16n')

    beforeEach(() => {
      sequence = new NoteSequence()
    })

    it('splits a half', () => {
      const sixteenthsAvailable = 4
      const ties = sequence.createTies(halfNote, sixteenthsAvailable)

      expect(ties.map(t => t.duration)).toEqual([Duration.quarter, Duration.quarter])
    })

    it('splits to timeremaining plus new note', () => {
      const sixteenthsAvailable = 2
      const ties = sequence.createTies(quarterNote, sixteenthsAvailable)

      expect(ties.map(t => t.duration)).toEqual([Duration.eighth, Duration.eighth])
    })

    it('creates ties for dotted notes too', () => {
      const sixteenthsAvailable = 3
      const ties = sequence.createTies(quarterNote, sixteenthsAvailable)

      expect(ties.map(t => t.duration)).toEqual(['8n.', Duration.sixteenth])
    })

    it('stores start tie in end tie', () => {
      const sixteenthsAvailable = 4
      const [startTie, endTie] = sequence.createTies(halfNote, sixteenthsAvailable)

      expect(endTie.startTie).toBe(startTie)
    })
  })

  describe('undo / redo', () => {
    let sequence

    beforeEach(() => {
      sequence = new NoteSequence([['E4', '4n'], ['F4', '4n']])
    })

    it('supports multiple undo', () => {
      sequence.selectFirst()
      sequence.toggleDotForSelected()
      sequence.selectFirst()
      sequence.duplicateNote()

      sequence.undo()
      sequence.undo()

      expect(sequence.allNoteNames()).toEqual(['E4', 'F4'])
    })
  })

  describe('bar sequence after rebar', () => {
    const e = new Note('E4', '4n')
    const f4Half = new Note('F4', '2n')
    let sequence

    beforeEach(() => {
      sequence = new NoteSequence()
    })

    it('creates a tie for notes that do not fit', () => {
      sequence.addAll(e, e, e, f4Half)

      const bars = sequence.bars()

      const firstBarNotes = bars[0].notes
      const lastNoteOfFirstBar = firstBarNotes[firstBarNotes.length - 1]
      expect(lastNoteOfFirstBar.name()).toEqual('F4')
    })

    it('fills a bar with four beats', () => {
      sequence.addAll(e, e, e, e)

      const bars = sequence.bars()

      expect(bars.length).toEqual(1)
      expect(bars[0].notes).toEqual([e, e, e, e])
    })

    it('puts a bar inbetween every 4 beats', () => {
      sequence.addAll(e, e, e, e, e, e, e, e, e)

      const bars = sequence.bars()

      expect(bars.length).toEqual(3)
      expect(bars[0].notes).toEqual([e, e, e, e])
      expect(bars[1].notes).toEqual([e, e, e, e])
      expect(bars[2].notes).toEqual([e])
    })

    it('tracks the start index for each bar', () => {
      sequence.addAll(e, e, e, e, e, e, e, e, e)

      const bars = sequence.bars()

      expect(bars[0].startIndex).toEqual(0)
      expect(bars[1].startIndex).toEqual(4)
      expect(bars[2].startIndex).toEqual(8)
    })

    it('handles all notes', () => {
      const fHalf = new Note('F4', '2n')
      sequence.addAll(e, e, fHalf, e)

      const bars = sequence.bars()

      expect(bars.length).toEqual(2)
      expect(bars[0].notes).toEqual([e, e, fHalf])
      expect(bars[1].notes).toEqual([e])
    })
  })
  
  describe('a rebar', () => {
    const e = new Note('E4', '4n')
    let sequence
    let rebar
    let existingRebar

    beforeEach(() => {
      // TODO better way in Jest?
      existingRebar = NoteSequence.prototype.rebar
    })

    afterEach(() => {
      NoteSequence.prototype.rebar = existingRebar
    })

    describe('on construction', () => {
      it('triggers once with any notes', () => {
        rebar = jest.fn()
        NoteSequence.prototype.rebar = rebar
        sequence = new NoteSequence(['E4', 'E5'])
        expect(rebar).toHaveBeenCalledTimes(1)
      })

      it('does not trigger if no notes added', () => {
        rebar = jest.fn()
        NoteSequence.prototype.rebar = rebar
        sequence = new NoteSequence([])
        expect(rebar).not.toHaveBeenCalled()
      })
    })

    // TODO move to command tests and maybe use abstract test
    describe('after construction', () => {
      beforeEach(() => {
        sequence = new NoteSequence(['E4', 'F4', 'G4'])
        sequence.selectFirst()
        rebar = jest.fn()
        NoteSequence.prototype.rebar = rebar
      })

      it('triggers on call to add', () => {
        sequence.add(e)
        expect(rebar).toHaveBeenCalled()
      })

      it('triggers on call to deleteSelected', () => {
        sequence.deleteSelected()

        expect(rebar).toHaveBeenCalled()
      })

      it('triggers on call to duplicateNote', () => {
        sequence.duplicateNote()

        expect(rebar).toHaveBeenCalled()
      })

      it('triggers on call to halveSelectedDuration', () => {
        sequence.halveSelectedDuration()

        expect(rebar).toHaveBeenCalled()
      })

      it('triggers on call to doubleSelectedDuration', () => {
        sequence.doubleSelectedDuration()

        expect(rebar).toHaveBeenCalled()
      })

      it('triggers on call to toggleDotForSelected', () => {
        sequence.toggleDotForSelected()

        expect(rebar).toHaveBeenCalled()
      })

      it('triggers on call to setSelectedTo', () => {
        sequence.setSelectedTo(Duration.half)

        expect(rebar).toHaveBeenCalled()       
      })
    })
  })

  describe('sequence with 3 notes', () => {
    beforeEach(() => {
      sequence = new NoteSequence(['E4', 'F4', 'G4'])
    })

    describe('note sequence', () => {
      it('allows adding notes', () => {
        sequence.add(new Note('A4'))

        expect(sequence.allNoteNames()).toEqual(['E4', 'F4', 'G4', 'A4'])
      })
    })

    describe('isNoteSelected', () => {
      it('returns true after selection', () => {
        sequence.selectFirst()

        expect(sequence.isNoteSelected()).toBeTruthy()
      })

      it('returns false by default', () => {
        expect(sequence.isNoteSelected()).toBeFalsy()
      })
    })

    describe('note selection', () => {
      it('returns null when no note selected', () => {
        const currentNote = sequence.selectedNote()

        expect(currentNote.name()).toEqual('null')
      })

      it('returns selected note', () => {
        sequence.selectFirst()

        expect(sequence.selectedNote().name()).toEqual('E4')
      })

      it('removes selection on deselectAll', () => {
        sequence.selectFirst()

        sequence.deselectAll()

        expect(sequence.isNoteSelected()).toBeFalsy()
      })
    })

    describe('click on position', () => {
      it('deselects if already selected', () => {
        sequence.selectFirst()

        sequence.click(0)

        expect(sequence.firstNote().isSelected).toBeFalsy()
      })

      it('selects if not selected', () => {
        sequence.selectLast()

        sequence.click(0)

        const note = sequence.firstNote()
        expect(sequence.firstNote().isSelected).toBeTruthy()
        expect(sequence.lastNote().isSelected).toBeFalsy()
      })
    })

    describe('clickHitNote', () => {
      it('returns false when no note hit', () => {
        const clickPoint = { x: -1, y: -1 }

        const wasNoteHit = sequence.clickHitNote(clickPoint)

        expect(wasNoteHit).toBeFalsy()
      })

      describe('hit note', () => {
        let firstNoteClickPoint
        let note

        beforeEach(() => {
          const position = 1
          note = sequence.note(position)
          note.position = position
          firstNoteClickPoint = { x: note.x(), y: note.y() }
        })

        it('returns true when note hit', () => {
          const wasNoteHit = sequence.clickHitNote(firstNoteClickPoint)

          expect(wasNoteHit).toBeTruthy()
        })

        it('clicks note hit', () => {
          sequence.clickHitNote(firstNoteClickPoint)

          expect(note.isSelected)
        })
      })
    })

    describe('next/prev bar', () => {
      const bar1Note1 = 'E4'
      const bar2Note1 = 'F4'
      const bar3Note1 = 'F4'
      const other = 'C1'
      beforeEach(() => {
        sequence = new NoteSequence(
          [bar1Note1, other, other, other, 
          bar2Note1, other, other, other,
          bar3Note1, other, other, other
        ])
      })

      it('selects first of prev', () => {
        sequence.selectLast();

        sequence.selectPrevBar();

        expect(sequence.selectedNote().name()).toEqual(bar2Note1)
      })

      it('selects first of prev when selected is last note of bar', () => {
        sequence.select(3);

        sequence.selectPrevBar();

        expect(sequence.selectedNote().name()).toEqual(bar3Note1)
      })

      it('selects first of last bar when selected is in first bar', () => {
        sequence.selectFirst();

        sequence.selectPrevBar();

        expect(sequence.selectedNote().name()).toEqual(bar3Note1)
      })

      it('selects first of next bar', () => {
        sequence.selectFirst();

        sequence.selectNextBar();

        expect(sequence.selectedNote().name()).toEqual(bar2Note1)
      })

      it('selects first of next bar when selected is last note of bar', () => {
        sequence.select(3);

        sequence.selectNextBar();

        expect(sequence.selectedNote().name()).toEqual(bar2Note1)
      })

      it('selects first note when selected is in last bar', () => {
        sequence.selectLast();

        sequence.selectNextBar();

        expect(sequence.selectedNote().name()).toEqual(bar1Note1)
      })
    })

    describe('next/prev note', () => {
      it('sets selected to subsequent note', () => {
        sequence.selectFirst()
        const first = sequence.selectedNote()

        sequence.selectNext()

        const note = sequence.selectedNote()
        expect(note.name()).toEqual('F4')
        expect(note.isSelected).toBeTruthy()
        expect(first.isSelected).toBeFalsy()
      })

      it('sets selected to previous note', () => {
        sequence.selectFirst()
        const first = sequence.selectedNote()

        sequence.selectPrev()

        const note = sequence.selectedNote()
        expect(note.name()).toEqual('G4')
        expect(note.isSelected).toBeTruthy()
        expect(first.isSelected).toBeFalsy()
      })

      it('sets selected to null if no current selection is empty', () => {
        sequence.deselectAll()

        sequence.selectNext()

        expect(sequence.selectedNote().name()).toBe('null')
      })

      it('prev sets selected to null if no current selection is empty', () => {
        sequence.deselectAll()

        sequence.selectPrev()

        expect(sequence.selectedNote().name()).toBe('null')
      })
    })
  })
})
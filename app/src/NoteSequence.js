import Note from './Note'
import Tie from './Tie'
import * as Duration from './Duration'
import { prev, next } from './js/ArrayUtil'
import Bar from './Bar'
import { DuplicateNoteCommand,
  ToggleDotCommand,
  ChangeDurationCommand,
  DeleteCommand,
  IncrementCommand,
  DecrementCommand,
  ToggleRestCommand } from './notesequence_commands'
import Commander from './Commander'

const nullNote = {
  name: () => 'null',
  select: () => {},
  deselect: () => {},
  toggleDot: () => {},
  isSelected: false
}

export default class NoteSequence {
  constructor(noteNames = []) {
    this.notes = []
    noteNames.forEach(n => {
      if (Array.isArray(n)) {
        const [name, duration, isNote] = n
        this.baseAdd(new Note(name, duration), isNote)
      }
      else {
        const noteName = n
        this.baseAdd(new Note(noteName))
      }
    })
    if (noteNames.length > 0) this.rebar()
    this.currentNoteSequenceIndex = -1

    this.commander = new Commander(this)
  }

  undo() {
    this.commander.executeUndo()
  }

  redo() {
    this.commander.executeRedo()
  }

  add(note) {
    this.baseAdd(note, note.isNote)
    this.rebar()
  }
  
  baseAdd(note, isNote=true) {
    note.isNote = isNote
    this.notes.push(note)
  }

  addAll() {
    this.notes = Array.prototype.concat.apply(this.notes, arguments)
    this.rebar()
  }

  length() {
    return this.notes.length
  }

  allNotes() {
    return this.notes
  }

  allNoteNames() {
    return this.notes.map(n => n.name())
  }

  allNotesWithDurations() {
    return this.notes.map(n => [n.name(), n.duration])
  }

  note(position) {
    return this.notes[position]
  }

  firstNote() {
    return this.notes[0]
  }

  lastNote() {
    return this.notes[this.notes.length - 1]
  }

  toJSON() {
    return this.allNotes().map(note => note.toJSON())
  }

  isNoteSelected() {
    return this.currentNoteSequenceIndex !== -1
  }

  selectedNote() {
    if (this.currentNoteSequenceIndex === -1) return nullNote
    return this.notes[this.currentNoteSequenceIndex]
  }

  isSelected(sequenceIndex) {
    return this.note(sequenceIndex).isSelected
  }

  clickHitNote(clickPoint) {
    for (let sequenceIndex = 0; sequenceIndex < this.notes.length; sequenceIndex++)
      if (this.notes[sequenceIndex].isHit(clickPoint)) {
        this.click(sequenceIndex)
        return true
      }
    return false
  }

  click(sequenceIndex) {
    if (this.isSelected(sequenceIndex))
      this.deselect(sequenceIndex)
    else {
      this.deselectAll()
      this.select(sequenceIndex)
    }
  }

  deselect(sequenceIndex) {
    this.note(sequenceIndex).deselect()
    this.currentNoteSequenceIndex = -1
  }

  deselectAll() {
    this.selectedNote().deselect()
    this.currentNoteSequenceIndex = -1
  }

  select(sequenceIndex) {
    this.currentNoteSequenceIndex = sequenceIndex
    this.notes[sequenceIndex].select()
  }

  selectFirst() {
    this.select(0)
  }

  selectLast() {
    this.select(this.notes.length - 1)
  }

  selectNext() {
    this.selectedNote().deselect()
    this.currentNoteSequenceIndex = next(this.notes, this.currentNoteSequenceIndex)
    this.selectedNote().select()
  }

  selectPrev() {
    this.selectedNote().deselect()
    this.currentNoteSequenceIndex = prev(this.notes, this.currentNoteSequenceIndex)
    this.selectedNote().select()
  }

  currentBarIndex() {
    return this.bars().findIndex(bar => 
      bar.startIndex + bar.length() > this.currentNoteSequenceIndex)
  }

  selectNextBar() {
    this.selectedNote().deselect()
    const barIndex = next(this.bars(), this.currentBarIndex())
    this.currentNoteSequenceIndex = this.bars()[barIndex].startIndex
    this.selectedNote().select()
  }

  selectPrevBar() {
    this.selectedNote().deselect()
    const barIndex = prev(this.bars(), this.currentBarIndex())
    this.currentNoteSequenceIndex = this.bars()[barIndex].startIndex
    this.selectedNote().select()
  }

  setSelectedTo(duration) {
    this.commander.execute(new ChangeDurationCommand(duration))
  }

  halveSelectedDuration() {
    this.setSelectedTo(Duration.halveDuration(this.selectedNote().duration))
  }

  doubleSelectedDuration() {
    this.setSelectedTo(Duration.doubleDuration(this.selectedNote().duration))
  }

  duplicateNote() {
    this.commander.execute(new DuplicateNoteCommand())
  }

  toggleDotForSelected() {
    this.commander.execute(new ToggleDotCommand())
  }

  incrementSelected() {
    this.commander.execute(new IncrementCommand())
  }

  decrementSelected() {
    this.commander.execute(new DecrementCommand())
  }

  deleteSelected() {
    if (this.notes.length === 1) return

    this.commander.execute(new DeleteCommand())
  }

  toggleRestForSelected() {
    this.commander.execute(new ToggleRestCommand())
  }

  createTies(note, timeRemaining) {
    const excessTime = note.sixteenths() - timeRemaining

    const startDurations = Duration.notesForSixteenths(timeRemaining)
    const startTies = startDurations.map(duration => 
      new Tie(note.name(), duration, note.isSelected))

    const endDurations = Duration.notesForSixteenths(excessTime)
    const endTies = endDurations.map(duration => 
      new Tie(note.name(), duration, note.isSelected))

    endTies[endTies.length - 1].startTie = startTies[0]

    note.setTies(startTies, endTies) // TODO test

    return [startTies, endTies]
  }

  // TODO: optimization if needed: rebar from changed location only
  rebar() {
    const barSequence = []
    let bar = new Bar()
    bar.startIndex = 0
    this.notes.forEach((note, i) => {
      note.clearTie() // TODO test in context
      if (!bar.canAccommodate(note)) {
        if (bar.isFull()) {
          barSequence.push(bar)
          bar = new Bar(i, note)
        }
        else {
          const [tieStartNotes, tieEndNotes] = this.createTies(note, bar.sixteenthsAvailable())
          tieStartNotes.forEach(note => bar.push(note))
          barSequence.push(bar)
          bar = new Bar(i)
          tieEndNotes.forEach(note => bar.push(note))
        }
      }
      else {
        bar.push(note)
      }
    })
    if (!bar.isEmpty()) barSequence.push(bar)
    this.barSequence = barSequence
  }

  bars() {
    return this.barSequence
  }
}

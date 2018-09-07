import Note from './Note';
import * as Duration from './Duration';
import { prev, next } from './js/ArrayUtil';
import Bar from './Bar';
import Tie from './Tie';

const nullNote = {
  name: () => 'null',
  select: () => {},
  deselect: () => {},
  toggleDot: () => {},
  isSelected: false
};

export default class NoteSequence {
  constructor(noteNames = []) {
    this.notes = [];
    noteNames.forEach(n => {
      if (Array.isArray(n))
        this.add(new Note(n[0], n[1]));
      else {
        const noteName = n;
        this.add(new Note(noteName));
      }
    });
    this.currentNoteSequenceIndex = -1;
  }

  add(note) {
    this.notes.push(note);
  }

  addAll() {
    this.notes = Array.prototype.concat.apply(this.notes, arguments);
  }

  // ==

  allNotes() {
    return this.notes;
  }

  allNoteNames() {
    return this.notes.map(n => n.name());
  }

  note(position) {
    return this.notes[position];
  }

  firstNote() {
    return this.notes[0];
  }

sHit
  lastNote() {
    return this.notes[this.notes.length - 1];
  }

  // ==

  toJSON() {
    return this.allNotes().map(note => note.toJSON());
  }

  // ==

  isNoteSelected() {
    return this.currentNoteSequenceIndex !== -1;
  }

  selectedNote() {
    if (this.currentNoteSequenceIndex === -1) return nullNote;
    return this.notes[this.currentNoteSequenceIndex];
  }

  isSelected(sequenceIndex) {
    return this.note(sequenceIndex).isSelected;
  }

  clickHitNote(clickPoint) {
    for (let sequenceIndex = 0; sequenceIndex < this.notes.length; sequenceIndex++)
      if (this.notes[sequenceIndex].isHit(clickPoint)) {
        this.click(sequenceIndex);
        return true;
      }
    return false;
  }

  click(sequenceIndex) {
    if (this.isSelected(sequenceIndex))
      this.deselect(sequenceIndex);
    else {
      this.deselectAll();
      this.select(sequenceIndex);
    }
  }

  deselect(sequenceIndex) {
    this.note(sequenceIndex).deselect();
    this.currentNoteSequenceIndex = -1;
  }

  deselectAll() {
    this.selectedNote().deselect();
    this.currentNoteSequenceIndex = -1;
  }

  select(sequenceIndex) {
    this.currentNoteSequenceIndex = sequenceIndex;
    this.notes[sequenceIndex].select();
  }

  selectFirst() {
    this.select(0);
  }

  selectLast() {
    this.select(this.notes.length - 1);
  }

  selectNext() {
    this.selectedNote().deselect();
    this.currentNoteSequenceIndex = next(this.notes, this.currentNoteSequenceIndex);
    this.selectedNote().select();
  }

  selectPrev() {
    this.selectedNote().deselect();
    this.currentNoteSequenceIndex = prev(this.notes, this.currentNoteSequenceIndex);
    this.selectedNote().select();
  }

  deleteSelected() {
    this.notes.splice(this.currentNoteSequenceIndex, 1);
    this.currentNoteSequenceIndex = Math.max(0, this.currentNoteSequenceIndex - 1);
    this.select(this.currentNoteSequenceIndex);
  }

  duplicateNote() {
    const note = this.selectedNote();
    const copy = new Note(note.name());
    copy.duration = note.duration;
    this.notes.splice(this.currentNoteSequenceIndex + 1, 0, copy);
    this.selectNext();
  }

  setSelectedTo(duration) {
    this.selectedNote().duration = duration;
  }

  halveSelectedDuration() {
    this.selectedNote().duration = Duration.halveDuration(this.selectedNote().duration);
  }

  doubleSelectedDuration() {
    this.selectedNote().duration = Duration.doubleDuration(this.selectedNote().duration);
  }

  toggleDotForSelected() {
    this.selectedNote().toggleDot();
  }

  incrementSelected() {
    this.selectedNote().increment();
  }

  decrementSelected() {
    this.selectedNote().decrement();
  }

  bars() {
    const barSequence = [];
    let bar = new Bar();
    this.notes.forEach(note => {
      if (bar.canAccommodate(note)) {
        bar.push(note);
        if (bar.isFull()) {
          barSequence.push(bar);
          bar = new Bar();
        }
      }
    });
    if (!bar.isEmpty()) barSequence.push(bar);
    return barSequence;
  }
}

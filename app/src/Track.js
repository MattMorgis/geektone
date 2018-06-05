import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import Staff, { drawSharp } from './Staff';
import * as keyHandler from './KeyHandler';
import { changeTrackInstrument, toggleSharpsMode } from './actions';

export class Track extends Component {
  componentDidMount() {
    this.addKeyListeners();
    this.addMouseListener();
    this.draw();
  }

  trackId(id) {
    return `track${id}`;
  }

  addMouseListener() {
    this.canvas().addEventListener('mousedown', this.click.bind(this));
  }

  addKeyListeners() {
    const canvas = document.getElementById(this.trackId(this.props.id));
    canvas.addEventListener('keyup', this.handleKeyPress.bind(this));
  }

  instrumentChange(e) {
    this.props.changeTrackInstrument(e.target.value, this.props.id);
  }

  // TODO create first-class canvas component and move in some of the drawing funcs
  render() {
    return (
      <div>
        <select value={this.trackData().instrument} onChange={this.instrumentChange.bind(this)}>
          <option value='piano'>Piano</option>
          <option value='violin'>Violin</option>
        </select>
        <Button onClick={() => { this.props.toggleSharpsMode(); this.draw(); } }>Add #</Button>
        <canvas key={this.props.id} id={this.trackId(this.props.id)} border='0' tabIndex={this.props.id} 
          width='1200' height='144'
          style={{marginLeft: 10, marginRight: 10, marginTop: 20}} />
      </div>);
  }

  trackContext() {
    return this.canvas().getContext('2d');
  }

  canvas() {
    return document.getElementById(this.trackId(this.props.id));
  }

  handleKeyPress(e) {
    if (e.key === 's') { this.save(); return; }
    if (keyHandler.handleKey(e, this.trackData().notes)) this.draw();
  }

  trackData() {
    return this.props.song.tracks[this.props.id];
  }

  draw() {
    this.trackContext().clearRect(0, 0, this.canvas().width, this.canvas().height);
    new Staff(this.trackContext()).draw();
    // drawStaff(this.trackContext());
    this.trackData().notes.allNotes()
      .forEach((note, i) => note.drawOn(this.trackContext(), i));
  }

  mousePosition(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
      y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
  }

  click(e) {
    const clickPoint = this.mousePosition(this.canvas(), e);
    if (this.trackData().notes.clickHitNote(clickPoint))
      this.draw();
  }
}

const mapStateToProps = ({composition}) => ({song: composition.song});
const mapDispatchToProps = { changeTrackInstrument, toggleSharpsMode };
export default connect(mapStateToProps, mapDispatchToProps)(Track);
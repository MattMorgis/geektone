import * as Draw from '../util/Draw'
import * as Duration from '../Duration'
import Rect from '../Rect'
import * as Constants from '../Constants'

const stemHeight = 36

const noteWidth = 7
const restWidth = 20
const noteHeight = 5
const noteStroke = 2
const highlightStroke = 4
const rotation = 0

const lineColor = 'black'
const highlightColor = 'red'
const wholeFill = 'white'
const quarterFill = 'black'
const solidFill = 'black'

export const restRectangle = x => {
  const width = (restWidth + 16)
  return new Rect(
    x - width / 2, Draw.y(Constants.restRectangleTop), 
    width, Draw.y(Constants.restRectangleBottom) - Draw.y(Constants.restRectangleTop))
}

export default class NoteWidget {
  constructor(context, note) {
    this.context = context
    this.note = note
  }

  x() { return this.note.x() }
  y() { return this.note.y() }
  isRest() { return this.note.isRest() }
  duration() { return this.note.duration }
  isDotted() { return this.note.isDotted() }
  isRepresentedAsTie() { return this.note.isRepresentedAsTie() }
  isSelected() { return this.note.isSelected }
  position() { return this.note.position }
  startTie() { return this.note.startTie }

  drawNoteEllipse(extraRadius=0) {
    this.context.ellipse(
      this.x(), this.y(),
      noteWidth + extraRadius, noteHeight + extraRadius,
      rotation, 0, 2 * Math.PI)
  }

  drawStaffLine() {
    this.context.strokeStyle = lineColor
    this.context.lineWidth = 1
    const halfWidth = noteWidth + 6
    this.context.moveTo(this.x() - halfWidth, this.y())
    this.context.lineTo(this.x() + halfWidth, this.y())
  }

  drawFilledNoteEllipse(color, extraRadius=0) {
    this.drawNoteEllipse(extraRadius)
    this.context.fillStyle = color
    this.context.fill()
  }

  stemDirection() {
    return this.y() < Draw.y(Constants.HighestUpStemNote) ? 1 : -1
  }

  stemHeightDelta() {
    return this.stemDirection() * stemHeight
  }

  drawStem() {
    this.context.moveTo(this.x() + noteWidth, this.y())
    this.context.lineTo(this.x() + noteWidth, this.y() + this.stemHeightDelta())
  }

  drawFlagAt(y) {
    this.context.moveTo(this.x() + noteWidth, y + this.stemHeightDelta())
    this.context.lineTo(this.x() + noteWidth + 6,
      y + this.stemHeightDelta() - (this.stemHeightDelta() / 2))
  }

  drawFlag() {
    this.drawFlagAt(this.y())
  }

  drawLowerFlag() {
    this.drawFlagAt(this.y() - ((this.stemHeightDelta() / 2) - (this.stemDirection() * 6)))
  }

  drawWhole() {
    this.drawFilledNoteEllipse(wholeFill)
  }

  drawHalf() {
    this.drawFilledNoteEllipse(wholeFill)
    this.drawStem()
  }

  drawQuarter() {
    this.drawFilledNoteEllipse(quarterFill)
    this.drawStem()
  }

  drawEighth() {
    this.drawFilledNoteEllipse(quarterFill)
    this.drawStem()
    this.drawFlag()
  }

  drawSixteenth() {
    this.drawFilledNoteEllipse(quarterFill)
    this.drawStem()
    this.drawFlag()
    this.drawLowerFlag()
  }

  drawDot(y) {
    const dotSize = 2
    const dotPad = 3
    const dotDescension = 5
    const x = this.x() + noteWidth + (2 * dotSize + dotPad)
    y = y + dotDescension
    this.context.moveTo(x, y)
    this.context.ellipse(x, y, dotSize, dotSize, rotation, 0, 2 * Math.PI)
  }

  drawRestHighlight() {
    restRectangle(this.x()).drawOn(this.context, highlightColor, highlightStroke)
  }

  highlightNote() {
    this.context.beginPath()
    this.context.strokeStyle = highlightColor
    this.context.lineWidth = highlightStroke
    if (this.isRest())
      this.drawRestHighlight()
    else
      this.drawNoteEllipse(highlightStroke)
    this.context.stroke()
  }

  drawEighthRest() {
    let x = this.x() - noteWidth / 2
    const restY = Draw.y(Constants.EighthRestY) - 6
    let y = restY - 20
    
    const radius = 4
    this.context.ellipse(x, y, radius, radius, rotation, 0, 2 * Math.PI)
    this.context.fillStyle = quarterFill
    this.context.fill()
    y += radius - 2
    this.context.moveTo(x, y)
    this.context.bezierCurveTo(x, y + 6, x + 6, y, x + 16, y - 10)
    x += 16
    y -= 10
    this.context.moveTo(x, y)
    this.context.lineTo(x - 8, y + 30)
  }

  r16ball(x, y, radius) {
    this.context.moveTo(x, y)
    this.context.ellipse(x, y, radius, radius, rotation, 0, 2 * Math.PI)
    this.context.fillStyle = quarterFill
    this.context.fill()
  }

  r16swoop(x, y, radius) {
    y += radius - 2
    this.context.moveTo(x, y)
    this.context.bezierCurveTo(x, y + 6, x + 6, y, x + 16, y - 10)
  }

  drawSixteenthRest() {
    const radius = 4
    let x = this.x() - noteWidth / 2
    let y = Draw.y(Constants.SixteenthsRestY) - 16
    
    this.r16ball(x, y, radius)
    this.r16swoop(x, y, radius)

    this.r16ball(x - 4, y + radius + 8, radius)
    this.r16swoop(x - 4, y + radius + 8, radius)

    // ew hardcoded, use trig funcs instead
    x += 16
    y -= 10
    this.context.moveTo(x, y)
    this.context.lineTo(x - 8, y + 30)
  }

  drawWholeOrHalfRest(heightOffset=0) {
    const width = 20
    const height = 8
    let x = this.x()
    let y = Draw.y(Constants.wholeOrHalfRestY)
    this.context.rect(
      x - (width / 2), y + (heightOffset * height), 
      width, height);
    this.context.fillStyle = solidFill
    this.context.fill()
  }

  drawWholeRest() {
    this.drawWholeOrHalfRest(0)
  }

  drawHalfRest() {
    this.drawWholeOrHalfRest(-1)
  }

  drawQuarterRest() {
    let x = this.x()
    let y = Draw.y(Constants.QuarterRestY) - 6
    this.context.lineWidth = 4
    this.context.moveTo(x, y)
    this.context.bezierCurveTo(x - 8, y - 4, x - 3, y - 10, x + 5, y - 5)
    x = x + 5
    y = y - 5
    this.context.moveTo(x, y)
    this.context.bezierCurveTo(x - 20, y - 18, x + 6, y - 16, x - 5, y - 22)
  }
//  experiment w/ beziers: http://jsfiddle.net/halfsoft/Gsz2a/

  drawRest() {
    if (Duration.isQuarterBase(this.duration())) this.drawQuarterRest()
    else if (Duration.isEighthBase(this.duration())) this.drawEighthRest()
    else if (Duration.isHalfBase(this.duration())) this.drawHalfRest()
    else if (Duration.isWholeBase(this.duration())) this.drawWholeRest()
    else if (Duration.isSixteenthBase(this.duration())) this.drawSixteenthRest()
  }

  drawNote() {
      // TODO inject function into note instead?
    if (Duration.isWholeBase(this.duration())) this.drawWhole()
    else if (Duration.isHalfBase(this.duration())) this.drawHalf()
    else if (Duration.isQuarterBase(this.duration())) this.drawQuarter()
    else if (Duration.isEighthBase(this.duration())) this.drawEighth()
    else if (Duration.isSixteenthBase(this.duration())) this.drawSixteenth()
    if (Constants.NotesToStrikeThrough.includes(this.note.name()))
      this.drawStaffLine()
  }

  restDotLocation() {
    return Duration.isHalfBase(this.duration()) ? Draw.y(Constants.wholeOrHalfRestY) : Draw.y(Constants.restRectangleBottom) - 12 
  }

  drawElementOn() {
    this.context.beginPath()
    this.context.lineWidth = noteStroke
    this.context.strokeStyle = lineColor

    if (this.isRest())
      this.drawRest()
    else
      this.drawNote()

    if (this.isDotted())
      this.drawDot(this.isRest() ? this.restDotLocation() : this.y())

    this.context.stroke()
  }

  draw() {
    this.drawElementOn()
    if (this.isSelected())
      this.highlightNote()
  }
}
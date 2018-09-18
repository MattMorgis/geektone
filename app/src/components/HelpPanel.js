import React, { Component } from 'react';

class HelpPanel extends Component{
  render() {
    return (
      <div>
        &lt;- prev  -&gt; next  ^ up  v down<br />
        d dup  x del  . toggle<br />
        1: whole 2: half 4: quarter 8: eighth *: double /: halve<br />
        r: rest<br />
      </div>);
  }
}

export default HelpPanel;
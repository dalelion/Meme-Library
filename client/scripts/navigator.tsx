import * as React from "react";
import * as ReactDOM from "react-dom";

export class Navigator extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div>
        {[
        ["gallery", "Gallery"],
        [],
        ["upload", "Upload Files"],
        [],
        ["register", "Register Testing"],
        [],
        ["login", "Login Testing"],
        [],
        ["download", "Download Testing"]
      ].map(([href, label], index) => href && label && <a href={`/${href}.html`} key={index}>{label}</a> || " | ")}
        <hr/>
      </div>
    );
  }
}

ReactDOM.render(<Navigator/>, document.querySelector('#navigator'));
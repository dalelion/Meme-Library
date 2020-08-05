import * as React from "react";
import * as ReactDOM from "react-dom";

var onSearch = function(e) {
  let request = req({method: 'GET', url: `/file?tags=${document.getElementById(`tags`).value.replace(/[; ]/, ";")}`});
  return request.then(console.log);
};
var makePlain = function (html) {
  var elt = document.createElement("div");
  elt.innerHTML = html;
  return elt.textContent.replace(/\n[^]*|\s+$/g, "");
};

var req = function(conf) {
  let req = new XMLHttpRequest(), aborted = false;
  let result = new Promise((success, failure) => {
    req.open(conf.method, conf.url, true);
    req.addEventListener("load", () => {
      if (aborted) return;
      if (req.status < 400) {
        success(req.responseText);
      } else {
        let text = req.responseText;
        if (text && /html/.test(req.getResponseHeader("content-type"))) text = makePlain(text);
        let err = new Error("Request failed: " + req.statusText + (text ? "\n\n" + text : ""));
        err.status = req.status;
        failure(err);
      }
    })
    req.addEventListener("error", () => {
      if (!aborted) failure(new Error("Network error"));
    })
    if (conf.headers) for (let header in conf.headers) req.setRequestHeader(header, conf.headers[header]);
    req.send(conf.body || null);
  })
  result.abort = () => {
    if (!aborted) {
      req.abort();
      aborted = true;
    }
  }
  return result;
};

export class Download extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }
  
  render() {
    return <div>
      <input type="text" name="tags" id="tags"/>
      <input type="button" value="Find Image" name="submit" onClick={onSearch}/>
    </div>;
  }
}

ReactDOM.render(<Download/>, document.querySelector('#download'));
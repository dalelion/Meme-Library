import * as React from "react";
import * as ReactDOM from "react-dom";
import {Buffer} from "safe-buffer";
import crypto, {BinaryLike} from "crypto";
import _ from "lodash";
import Xhr from "xhr";

type UploadState = {
  disabled: boolean;
}

export class Upload extends React.Component<any, UploadState> {
  constructor(props) {
    super(props);
    this.state = {
      disabled: true
    };
  }
  
  render() {
    return (
      <form action="/file" method="post" encType="multipart/form-data">
        Select image(s) to upload and apply tags:
        <br/>
        <input type="file" name="fileToUpload" id="fileToUpload" multiple onChange={e => {
          this.setState({disabled: true});
          Promise.all(_.map(e.target.files, file => {
            return new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.onload = function (event) {
                let data = Buffer.from(event.target.result as ArrayBuffer) as unknown;
                let hash = crypto.createHash("md5");
                hash.update(data as BinaryLike);
                resolve(hash.digest('hex'));
              };
              reader.onerror = function (event) {
                reject(event)
              };
              reader.readAsArrayBuffer(file);
            });
          })).then(checksums => {
            Xhr.get(`/file?md5=${checksums.join(",")}`,{json: true}, (error, response, body) => {
              if (error) {
                throw error;
              } else {
                this.setState({disabled: _.negate(_.isEmpty)(body.files)});
              }
            });
          });
        }}/>
        <br/>
        <input type="text" name="tags" id="tags"/>
        <input type="submit" value="Upload Image" name="submit" disabled={this.state.disabled}/>
      </form>
    );
  }
}

ReactDOM.render(<Upload/>, document.querySelector("#mount"));
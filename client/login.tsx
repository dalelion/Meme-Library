import React, {Component} from 'react';
import ReactDOM from 'react-dom'
import Xhr from "xhr";

type LoginProps = {}

type LoginState = {
  username: string;
  password: string;
}

export class Login extends Component<LoginProps, LoginState> {
  constructor(props) {
    super(props);
    this.state = {username: "", password: ""};
  }
  
  handleSubmit(e) {
    Xhr.post("/auth", {
        body: this.state,
        json: true
      },
      (error, response, body) => {
        if (error) {
          console.error(error);
        } else {
          switch (body.status) {
            case "SUCCESS":
              window.location.href = "/gallery.html";
              break;
            case "FAIL":
              //TODO: NOAH DOES THINGS WITH THIS IN THE UI BECAUSE YOU CAN OKAY!?
              break;
          }
        }
      }
    )
  }
  
  render() {
    return (
      <div>
        <label>Username</label>
        <input type={'text'} placeholder={'ex. Memes'} name={'Username'} value={this.state.username} onChange={e => this.setState({username: e.target.value})} required/>
        <div>
          <label>Password</label>
          <input type={'password'} placeholder={'M3M35'} name={'Password'} onChange={e => this.setState({password: e.target.value})} required/>
        </div>
        <div>
          <button type={'submit'} onClick={e => this.handleSubmit(e)}>Login</button> <a href={'/register.html'}>New Account?</a>
        </div>
      </div>
    );
  }
  
}

ReactDOM.render(<Login/>, document.querySelector('#mount'));

import React, {Component} from 'react';
import ReactDOM from 'react-dom'
import Xhr from "xhr";

type LoginProps = {}

type LoginState = {
  username: string;
  password1: string;
  password2: string;
}

export class Login extends Component<LoginProps, LoginState> {
  constructor(props) {
    super(props);
    this.state = {username: "", password1: "", password2: ""};
  }
  
  handleSubmit(e) {
    Xhr.post("/user", {
        body: this.state,
        json: true
      },
      (error, response, body) => {
        if (error) {
          console.error(error);
        } else {
          console.log(response, body);
        }
      }
    );
  }
  
  render() {
    return (
      <div>
        <label>Username</label>
        <input type={'text'} placeholder={'ex. Memes'} name={'Username'} value={this.state.username} onChange={e => this.setState({username: e.target.value})} required/>
        <div>
          <label>Password</label>
          <input type={'password'} placeholder={'Password'} name={'Password1'} value={this.state.password1} onChange={e => this.setState({password1: e.target.value})} required/>
        </div>
        <div>
          <label>Re-enter Password</label>
          <input type={'password'} placeholder={'Re-enter Password'} name={'Password2'} value={this.state.password2} onChange={e => this.setState({password2: e.target.value})} required/>
        </div>
        <div>
          <button type={'submit'} onClick={e => this.handleSubmit(e)}>Register</button>
        </div>
      </div>
    );
  }
  
}

ReactDOM.render(<Login/>, document.querySelector('#mount'));

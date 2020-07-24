import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom'
import Carousel, { Modal, ModalGateway } from 'react-images';
import Xhr from "xhr";
import _ from "lodash";

type LoginProps = {
  UserInfo: string ;
}

type LoginState = {
  HasCookie: boolean;
  UserInfo: string;
}

export class Login extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { HasCookie: false, UserInfo: "User:Pass"};
  }
  
  handleSubmit(e) {
  
  }
  
  render () {
    return (
      <Fragment>
        <div>
          <form onSubmit={this.handleSubmit}>
            <label>Username</label>
            <input type={'text'} placeholder={'ex. Memes'} name={'Username'} required/>
            <div>
            <label>Password</label>
            <input type={'password'} placeholder={'M3M35'} name={'Password'} required/>
            </div>
            <div>
            <button type={'submit'}>Login</button>
            </div>
          </form>
        </div>
      </Fragment>
    );
  }
  
}

ReactDOM.render(<Login/>, document.querySelector('#mount'));

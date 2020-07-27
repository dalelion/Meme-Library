import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom'
import Carousel, { Modal, ModalGateway } from 'react-images';
import Xhr from "xhr";
import _ from "lodash";

type GalleryProps = {
  images: {source: string }[];
}

type GalleryState = {
  modalIsOpen: boolean;
  images: {source: string }[];
}

type InputBoxState = {
  images: {source: string}[];
}

export class InputBox extends Component<any, InputBoxState> {
  private textRef: React.RefObject<HTMLInputElement>;
  private session_: number;

  constructor(props) {
    super(props);
    this.state = {images: []};
    this.textRef = React.createRef();
  }
  
  render() {
    return (
      <div id={'memes'}>
        <input ref={this.textRef} type={'text'}/>
        <input type={'button'} onClick={event => {
          new Promise( (resolve, reject) => {
            Xhr.get(`/file?tags=${this.textRef.current.value}`, (error, res) => {
              if (error) {
                reject(error);
              } else {
                let result = _.isString(res.body) ? JSON.parse(res.body) : res.body;
                resolve(result.files);
              }
            });
          }).then((results: File[]) => {
            console.log(results);
            debugger;
            this.setState({images: results.map(result => ({source: `/file/${result.filepath.replace(/Files[\/\\]/, '')}`}))})
          });
        }}/>
        <Gallery images={this.state.images}/>
      </div>
      
    );
  }
  
  componentWillMount(): void {
    window.clearInterval(this.session_);
    this.session_ = window.setInterval(() => {
      Xhr.put("/auth", (error, res) => {
        if (res.statusCode >= 400) {
          window.location.href = "/";
        }
      });
    }, 60000);
  }
  
  componentWillUnmount(): void {
    window.clearInterval(this.session_);
  }
}

export class Gallery extends Component<GalleryProps, GalleryState> {
  constructor(props) {
    super(props);
    this.state = { modalIsOpen: false, images: this.props.images || [] }
  }
  
  toggleModal () {
    this.setState(state => ({ modalIsOpen: !state.modalIsOpen }));
  }
  
  render () {
    return (
      <Fragment>
        <GalleryView>
          {this.props.images.map((image, index) => (
            <Image
              onClick={() => this.toggleModal() }
              key={index}
            >
              <img
                alt={'roar'}
                src={image.source}
                style={{
                  cursor: 'pointer',
                  position: 'absolute',
                  maxWidth: '100%',
                }}
              />
            </Image>
          ))}
        </GalleryView>
    
        <ModalGateway>
          {this.state.modalIsOpen ? (
            <Modal onClose={() => this.toggleModal()}>
              <Carousel
                views={this.props.images}
              />
            </Modal>
          ) : null}
        </ModalGateway>
      </Fragment>
    );
  }

}

const gutter = 2;
const GalleryView = (props: any) => (
  <div
    style={{
      overflow: 'hidden',
      marginLeft: -gutter,
      marginRight: -gutter,
    }}
    {...props}
  />
);

const Image = (props: any) => (
  <div
    style={{
      backgroundColor: '#eee',
      boxSizing: 'border-box',
      float: 'left',
      margin: gutter,
      overflow: 'hidden',
      paddingBottom: '16%',
      position: 'relative',
      width: `calc(25% - ${gutter * 2}px)`,
      ':hover': {
        opacity: 0.9,
      },
    }}
    {...props}
  />
);

type File = {
  filename: string;
  filepath: string;
  mimetype: string;
  tags: string[];
  _id: string;
}

Xhr.put("/auth", (error, res) => {
  if (res.statusCode >= 400) {
    window.location.href = "/";
  } else {
    ReactDOM.render(<InputBox/>, document.querySelector('#mount'));
  }
});
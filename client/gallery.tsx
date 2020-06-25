import React, { Component, Fragment } from 'react';
import Carousel, { Modal, ModalGateway } from 'react-images';

const images = [{source: 'https://media.discordapp.net/attachments/318246233384943617/715035866619445339/1590539278770.png'},
  { source: 'https://media.discordapp.net/attachments/318246233384943617/710706091725422663/ah.jpg' },
  { source: 'https://media.discordapp.net/attachments/318246233384943617/710704688336470026/1589142723752.png' },
  { source: 'https://media.discordapp.net/attachments/318246233384943617/710702298300678255/Vigne_holds_Concepts_of_Programming_Languages_by_Sebesta.png'},
  { source: 'https://media.discordapp.net/attachments/318246233384943617/710702194671747212/1586387625160.gif'},
  { source: 'https://media.discordapp.net/attachments/474324174828077056/722174280548352040/onsa_40.png'},
  { source: 'https://media.discordapp.net/attachments/474324174828077056/718980758613655582/fa404b6b-5845-4825-a40c-9812884f09ae.jpg'},
  { source: 'https://media.discordapp.net/attachments/474324174828077056/711185685830434826/1571197657910.jpg'}];

export class Gallery extends Component<unknown, unknown> {
  constructor(props) {
    super(props);
  }
  
  state = { modalIsOpen: false }
  toggleModal = () => {
    this.setState(state => ({ modalIsOpen: !state.modalIsOpen }));
  }
  
  render() {
    //const { modalIsOpen } = this.state;
    
    return (
      <Fragment>
          <GalleryView>
            {images.map((image) => (
              <Image
                onClick={() => this.toggleModal() }
                key={image.source}
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
                views={images}
              />
            </Modal>
          ) : null}
        </ModalGateway>
      </Fragment>);
      /*
      <ModalGateway>
        {modalIsOpen ? (
          <Modal onClose={this.toggleModal}>
            <Carousel views={images} />
          </Modal>
        ) : null}
      </ModalGateway>
    );*/
    //return (<Carousel views={images} />);
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

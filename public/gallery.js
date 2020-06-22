import React from 'react';
import Carousel from 'react-images';

const images = [{ source: 'Files/upload_6c8dff6bee1c87105eba16bf66be3b72.png' }, { source: 'Files/upload_9fb4167356de560ed1827dae2d6904e7.png' }];

class Component extends React.Component {
	render() {
		return <Carousel views={images} />;
	}
}
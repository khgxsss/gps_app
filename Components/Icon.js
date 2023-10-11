import React from 'react';
import { Icon } from 'galio-framework';
import { createIconSet } from 'react-native-vector-icons';
import GalioConfig from '../assets/fonts/galioExtra.json';

const IconGalioExtra = createIconSet(GalioConfig.glyphs, 'GalioExtra', 'galioExtra.ttf');

class IconExtra extends React.Component {
  state = {
    fontLoaded: true,
  }

  render() {
    const { name, family, ...rest } = this.props;
    
    if (name && family) {
      if (family === 'GalioExtra') {
        return <IconGalioExtra name={name} {...rest} />;
      }
      return <Icon name={name} family={family} {...rest} />;
    }

    return null;
  }
}

export default IconExtra;

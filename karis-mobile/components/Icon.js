import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default class Icon extends React.Component {
  constructor(props) {
    super(props);
    this.color = this.props.color || 'black';
    this.name = `${(Platform.OS == 'ios') ? 'ios': 'md'}-${this.props.name}`;
    this.size = this.props.size || 32 ;
  }

  render() {
    return (
      <Ionicons
        color={this.color}
        size={this.size}
        name={this.name}
      />
    );
  }
}

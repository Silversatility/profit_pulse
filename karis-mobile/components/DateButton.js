import React, { Component } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import {
  TouchableRipple,
  Text,
} from 'react-native-paper';

import Icon from './Icon';
import Colors from '../constants/Colors';


export default class DateButton extends Component {
  static defaultProps = {
    onChange: () => null,
    onPress: () => null,
    value: new Date(),
  }

  _getDisplay = () => {
    const value = this.props.value;
    const month = (value.getMonth() + 1).toString().padStart(2, 0);
    const day = value.getDate().toString().padStart(2, 0);
    const year = value.getFullYear().toString().padStart(2, 0);
    return `${month}/${day}/${year}`;
  }

  render() {
    return (
      <TouchableRipple
        style={localStyles.container}
        rippleColor={Colors.lightButtonUnderlay}
        onPress={this.props.onPress}
      >
        <View style={localStyles.innerContainer}>
          <View style={localStyles.textContainer}>
            <Text style={localStyles.label}>{this._getDisplay()}</Text>
          </View>
          <View style={localStyles.buttonContainer}>
            <Icon name='calendar' color={Colors.text} size={25} />
          </View>
        </View>
      </TouchableRipple>
    );
  }
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center',
    paddingLeft: 15,
  },
  label: {
    color: Colors.text,
    fontFamily: 'RobotoMedium',
    fontWeight: 'bold',
    fontSize: 12.5,
  },
  innerContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.lightButtonUnderlay,
    borderRadius: 2.5,
  },
  buttonContainer: {
    borderLeftWidth: 1.5,
    borderLeftColor: Colors.lightButtonUnderlay,
    padding: 5,
  },
});

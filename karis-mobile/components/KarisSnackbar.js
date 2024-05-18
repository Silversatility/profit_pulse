import React from 'react';
import { Snackbar } from 'react-native-paper';

import Styles from '../constants/Styles';


export default class KarisSnackbar extends React.Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    dismissLabel: 'try again',
  }

  render() {
    return (
      <Snackbar
        visible={this.props.visible}
        onDismiss={this.props.onDismiss}
        action={{
          label: this.props.dismissLabel,
          onPress: this.props.onDismiss,
        }}
        style={Styles.snackbar}
      >
        {this.props.message}
      </Snackbar>
    );
  }
}

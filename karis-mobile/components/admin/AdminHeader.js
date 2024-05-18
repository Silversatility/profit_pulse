import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Image,
  StatusBar,
} from 'react-native';
import Constants from 'expo-constants';
import {
  Text,
  Button
} from 'react-native-paper';


import { retrieveMe } from '../../redux/actions';
import Colors from '../../constants/Colors';
import Styles from '../../constants/Styles';
import Icon from '../../components/Icon';


class AdminHeader extends Component {
  _goToAdminSettings = async () => {
    await this.props.retrieveMe();
    this.props.navigation.navigate('AdminSettings');
  }

  render() {
    return (
      <View style={Styles.headerContainer}>
        <StatusBar barStyle='dark-content' translucent backgroundColor='rgba(0, 0, 0, 0)' />
        <Image
          style={{
            marginTop: Constants.statusBarHeight,
            height: 75,
            resizeMode: 'contain',
            alignSelf: 'center'
          }}
          source={require('../../assets/idispense.png')}
        />
        <View style={Styles.header}>
          <View style={{ width: 64 }}>
          </View>
          <Text style={Styles.headerTitle}>{this.props.headerTitle}</Text>
          <Button
            color={Colors.headerSetting}
            onPress={this._goToAdminSettings}
          >
            <Icon name='settings' size={25} color={Colors.headerSetting} />
          </Button>
        </View>
      </View>
    );
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    retrieveMe: () => dispatch(retrieveMe()),
  };
};


export default connect(null, mapDispatchToProps)(AdminHeader);

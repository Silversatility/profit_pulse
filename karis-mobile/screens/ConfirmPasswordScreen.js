import React from 'react';
import {
  Image,
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import Constants from 'expo-constants';
import {
  Text,
  Button,
} from 'react-native-paper';

import { OAuth2API } from '../api';

import KarisSnackbar from '../components/KarisSnackbar';
import { errorParser } from '../helpers';
import Colors from '../constants/Colors';
import Styles from '../constants/Styles';


export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      snackbar: {
        message: null,
        visible: false,
        dismissLabel: null,
      },
      verificationCode: null,
      newPassword: null,
      confirmPassword: null,
    };
  }

  _dismissSnackbar = () => {
    this.setState({ snackbar: { message: null, visible: false } });
  }

  _backToLogin = (params = {}) => {
    this.props.navigation.push('Login', params);
  }

  _handleConfirmPassword = async () => {
    const data = {
      token: this.state.verificationCode,
      password: this.state.newPassword,
      confirm_password: this.state.confirmPassword,
    };
    try {
      await OAuth2API.confirmPassword(data);
      this._backToLogin({ snackbar: { visible: true, message: 'Password successfully changed, you can now login using your new password.', dismissLabel: 'Close' } });
    } catch (error) {
      this.setState({ snackbar: { visible: true, message: errorParser(error.response.data), dismissLabel: 'TRY AGAIN', } });
    }
  }

  render() {
    return (
      <View style={Styles.container}>
        <KarisSnackbar
          message={this.state.snackbar.message}
          visible={this.state.snackbar.visible}
          onDismiss={this._dismissSnackbar}
          dismissLabel={this.state.snackbar.dismissLabel}
        />
        <View style={localStyles.header}>
          <Image
            style={localStyles.logo}
            source={require('../assets/karis-logo.png')}
          />
        </View>
        <View style={localStyles.form}>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Verification Code</Text>
            <TextInput
              selectionColor={Colors.tint}
              style={localStyles.textInput}
              onChangeText={(text) => this.setState({ verificationCode: text })}
              keyboardType='email-address'
              autoCapitalize='none'
              value={this.state.verificationCode}
            />
          </View>

          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>New Password</Text>
            <TextInput
              selectionColor={Colors.tint}
              style={localStyles.textInput}
              onChangeText={(text) => this.setState({ newPassword: text })}
              secureTextEntry
              autoCapitalize='none'
              value={this.state.newPassword}
            />
          </View>

          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Confirm Password</Text>
            <TextInput
              selectionColor={Colors.tint}
              style={localStyles.textInput}
              onChangeText={(text) => this.setState({ confirmPassword: text })}
              secureTextEntry
              autoCapitalize='none'
              value={this.state.confirmPassword}
            />
          </View>
          <Button
            loading={this.state.loading}
            style={localStyles.login}
            onPress={this._handleConfirmPassword}
            color={Colors.white}
          >
            Continue
          </Button>
          <TouchableWithoutFeedback onPress={this._backToLogin}>
            <Text style={localStyles.backToLogin}>Back to Sign In</Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  inputGroup: {
    marginBottom: 15,
  },
  header: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 25,
  },
  imageBackground: {
    zIndex: -1,
    position: 'absolute',
    left: 0,
    top: 25,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  logo: {
    alignSelf: 'center',
    width: 146,
    height: 80,
    resizeMode: 'stretch'
  },
  label: {
    marginBottom: 7,
    color: Colors.text,
    fontFamily: 'RobotoMedium',
    fontWeight: 'bold',
  },
  form: {
    padding: 50,
    flex: 3,
  },
  textInput: {
    fontFamily: 'RobotoMedium',
    color: Colors.text,
    padding: 5,
    borderRadius: 5,
    borderWidth: 0,
    backgroundColor: Colors.white,
  },
  login: {
    marginTop: 20,
    backgroundColor: Colors.tint,
  },
  backToLogin: {
    color: Colors.tint,
    marginTop: 20,
    alignSelf: 'center',
    fontWeight: 'bold',
    borderBottomWidth: .75,
    borderBottomColor: Colors.underline,
  },
  titleText: {
    color: Colors.text,
    fontFamily: 'RobotoMedium',
    marginBottom: 15,
    fontSize: 22,
    fontWeight: 'bold',
  },
  subText: {
    color: Colors.text,
    fontFamily: 'Roboto',
    marginBottom: 15,
    fontSize: 14,
  },
});

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
      },
      email: null,
    };
  }

  _backToLogin = () => {
    this.props.navigation.push('Login');
  }

  _goToConfirmPassword = () => {
    this.props.navigation.push('ConfirmPassword');
  }

  _dismissSnackbar = () => {
    this.setState({ snackbar: { message: null, visible: false } });
  }

  _sendForgotPasswordEmail = async () => {
    const data = {
      email: this.state.email,
    };
    try {
      await OAuth2API.forgotPassword(data);
      this._goToConfirmPassword();
    } catch (error) {
      this.setState({ snackbar: { visible: true, message: errorParser(error.response.data) } });
    }

  }

  render() {
    return (
      <View style={Styles.container}>
        <KarisSnackbar
          message={this.state.snackbar.message}
          visible={this.state.snackbar.visible}
          onDismiss={this._dismissSnackbar}
        />
        <View style={localStyles.header}>
          <Image
            style={localStyles.logo}
            source={require('../assets/karis-logo.png')}
          />
        </View>
        <View style={localStyles.form}>
          <Text style={localStyles.titleText}>Forgot password?</Text>
          <Text style={localStyles.subText}>
            Enter your Email address you are using for
            your account and we will send you reset link
          </Text>

          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Email</Text>
            <TextInput
              selectionColor={Colors.tint}
              style={localStyles.textInput}
              onChangeText={(text) => this.setState({ email: text })}
              keyboardType='email-address'
              autoCapitalize='none'
              value={this.state.email}
            />
          </View>
          <Button
            loading={this.state.loading}
            style={localStyles.login}
            onPress={this._sendForgotPasswordEmail}
            color={Colors.white}
          >
            Continue
          </Button>
          <TouchableWithoutFeedback onPress={this._goToConfirmPassword}>
            <Text style={localStyles.backToLogin}>Already have a code?</Text>
          </TouchableWithoutFeedback>
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

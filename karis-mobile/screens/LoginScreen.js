import React from 'react';
import { connect } from 'react-redux';
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
import * as LocalAuthentication from 'expo-local-authentication';

import { Storage } from '../api';
import { retrieveMe } from '../redux/actions';
import { OAuth2API } from '../api';
import KarisSnackbar from '../components/KarisSnackbar';
import Colors from '../constants/Colors';
import Styles from '../constants/Styles';


class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    const snackbar  = this.props.navigation.getParam('snackbar', {});
    this.state = {
      username: null,
      password: null,
      loading: false,
      snackbar: {
        message: null,
        visible: false,
        ...snackbar,
      },
      localAuth: {
        hasLocalAuth: false,
        authenticationTypes: [], // ex: [<FINGERPRINT>1, <FACIAL_RECOGNITION>2]
      },
    };
  }

  async componentDidMount() {
    let localAuth = {
      hasLocalAuth: false,
      authenticationTypes: [], // ex: [<FINGERPRINT>1, <FACIAL_RECOGNITION>2]
    };
    localAuth.hasLocalAuth = await LocalAuthentication.hasHardwareAsync();
    const oauth2Data = await Storage.getItem(Storage.Keys.OLD_OAUTH2_DATA);
    if (localAuth.hasLocalAuth && oauth2Data) {
      localAuth.authenticationTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      this.setState({ localAuth });
    }
  }

_performLogin = async () => {
    this.setState({ loading: true });
    try {
      const data = {
        username: this.state.username,
        password: this.state.password,
      };
      await OAuth2API.login(data);

      await this.props.retrieveMe();
      const { me } = this.props;
      const isAdmin = me.user.is_admin;
      const isCustomer = me.user.is_customer;
      const isSalesRepresentative = me.user.is_sales_representative;
      this.setState({ loading: false });
      if (isAdmin) {
        this.props.navigation.navigate('AdminApp');
      } else if (isCustomer) {
        this.props.navigation.navigate('CustomerApp');
      } else if (isSalesRepresentative) {
        this.props.navigation.navigate('SalesRepApp');
      }
    } catch (error) {
      const errorMessage = (error.response)
        ? error.response.data.error_description || 'Incorrect Username or Password'
        : 'Check your internet connection';
      this.setState({
        snackbar: {
          message: errorMessage,
          visible: true
        }
      });
      this.setState({ loading: false });
    }
  }

  _handleForgotPassword = async () => {
    this.props.navigation.push('ForgotPassword');
  }

  _dismissSnackbar = () => {
    this.setState((state, props) => {
      return {
        snackbar: { ...state.snackbar, message: null, visible: false }
      };
    });
  }

  _performLocalAuthLogin = async () => {
    const authenticated = await LocalAuthentication.authenticateAsync();
    if (authenticated.success) {
      const oauth2Data = await Storage.getItem(Storage.Keys.OLD_OAUTH2_DATA);
      await Storage.setItem(Storage.Keys.OAUTH2_DATA, oauth2Data);
      await Storage.removeItem(Storage.Keys.OLD_OAUTH2_DATA);
      this.props.navigation.navigate('InitialLoading');
    } else {
      const errorMessage = 'Authentication failed.';
      this.setState({
        snackbar: {
          message: errorMessage,
          visible: true
        }
      });
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
            source={require('../assets/idispense.png')}
          />
        </View>
        <View style={localStyles.form}>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Email</Text>
            <TextInput
              selectionColor={Colors.tint}
              style={localStyles.textInput}
              onChangeText={(text) => this.setState({ username: text })}
              keyboardType='email-address'
              autoCapitalize='none'
            />
          </View>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Password</Text>
            <TextInput
              selectionColor={Colors.tint}
              style={localStyles.textInput}
              onChangeText={(text) => this.setState({ password: text })}
              secureTextEntry
            />
          </View>
          <Button
            loading={this.state.loading}
            style={localStyles.login}
            onPress={this._performLogin}
            color={Colors.white}
          >
            Login
          </Button>
          {
            this.state.localAuth.hasLocalAuth &&
            <Button
              loading={this.state.loading}
              style={localStyles.login}
              onPress={this._performLocalAuthLogin}
              color={Colors.white}
            >
              Login via {
                this.state.localAuth.authenticationTypes.map((type) => {
                  if (type == 1) {
                    return 'Fingerprint';
                  } else if (type == 2) {
                    return 'Facial Recognition';
                  }
                }).join('/')
              }
            </Button>
          }
          <TouchableWithoutFeedback onPress={this._handleForgotPassword}>
            <Text style={localStyles.forgotPasswordText}>Forgot password?</Text>
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
    width: '90%',
    resizeMode: 'contain'
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
    color: Colors.tint,
    padding: 5,
    borderRadius: 5,
    borderWidth: 0,
    backgroundColor: Colors.opaqueTint,
  },
  login: {
    marginTop: 20,
    backgroundColor: Colors.tint,
  },
  forgotPasswordText: {
    color: Colors.tint,
    marginTop: 20,
    alignSelf: 'center',
    fontWeight: 'bold',
    borderBottomWidth: .75,
    borderBottomColor: Colors.underline,
  },
});


const mapStateToProps = (state) => (
  {
    me: state.me,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    retrieveMe: () => dispatch(retrieveMe()),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import Constants from 'expo-constants';
import {
  Text,
  Divider,
  Portal,
  Button,
  Switch,
} from 'react-native-paper';

import { Storage } from '../../api';
import { updateAdminMe, logoutMe, changePasswordMe } from '../../redux/actions';
import { errorParser } from '../../helpers';
import KarisSnackbar from '../../components/KarisSnackbar';
import Icon from '../../components/Icon';
import Colors from '../../constants/Colors';
import Styles from '../../constants/Styles';


class AdminSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: this.props.me.user.first_name,
      lastName: this.props.me.user.last_name,
      email: this.props.me.user.email,
      phoneNumber: this.props.me.phone_number,
      companyGoal: this.props.me.company_goal,
      customerGoal: this.props.me.customer_goal,
      commissionsOwed: this.props.me.commissions_owed,
      hasLocalAuth: this.props.me.user.has_local_auth,
      currentPassword: null,
      newPassword: null,
      confirmPassword: null,
      snackbar: {
        visible: false,
        message: null,
        dismissLabel: null,
      },
    };
  }

  _dismissSnackbar = () => {
    this.setState({ snackbar: { message: null, visible: false, dismissLabel: null } });
  }

  _handleGoBack = () => {
    this.props.navigation.goBack();
  }

  _handleLogout = async () => {
    const hasLocalAuth = this.props.me.user.has_local_auth;
    if (hasLocalAuth) {
      const oauth2Data = await Storage.getItem(Storage.Keys.OAUTH2_DATA);
      await Storage.setItem(Storage.Keys.OLD_OAUTH2_DATA, oauth2Data);
      await Storage.removeItem(Storage.Keys.OAUTH2_DATA);
    } else {
      await Storage.clear();
    }
    this.props.logoutMe();
    this.props.navigation.navigate('Auth');
  }

  _handleSaveChanges = async () => {
    const data = {
      commissions_owed: this.state.commissionsOwed,
      company_goal: this.state.companyGoal,
      customer_goal: this.state.customerGoal,
      phone_number: this.state.phoneNumber,
      user: {
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        email: this.state.email,
        has_local_auth: this.state.hasLocalAuth,
      },
    };
    const id = this.props.me.user.id;
    try {
      await this.props.updateAdminMe(id, data);
      this.setState((state, props) => {
        return {
          firstName: props.me.user.first_name,
          lastName: props.me.user.last_name,
          email: props.me.user.email,
          phoneNumber: props.me.phone_number,
          companyGoal: props.me.company_goal,
          customerGoal: props.me.customer_goal,
          commissionsOwed: props.me.commissions_owed,
          hasLocalAuth: props.me.user.has_local_auth,
        };
      });
      if (
        this.state.currentPassword &&
        this.state.newPassword &&
        this.state.confirmPassword
      ) {
        const data = {
          old_password: this.state.currentPassword,
          new_password1: this.state.newPassword,
          new_password2: this.state.confirmPassword,
        };
        await this.props.changePasswordMe(data);
        this.setState({
          currentPassword: null,
          newPassword: null,
          confirmPassword: null,
        });
      }
      this.setState({
        snackbar: {
          message: 'Updated successfully.',
          dismissLabel: 'close',
          visible: true,
        }
      });
    } catch (error) {
      this.setState({
        snackbar: {
          message: this.props.me.error ? errorParser(this.props.me.error) : 'Something went wrong.',
          dismissLabel: 'try again',
          visible: true,
        }
      });
    }
  }

  _initialize = () => {

  }

  render() {
    return(
      <View style={Styles.container}>
        <StatusBar barStyle='dark-content' translucent backgroundColor='rgba(0, 0, 0, 0)' />
        <Portal>
          <KarisSnackbar
            message={this.state.snackbar.message}
            visible={this.state.snackbar.visible}
            onDismiss={this._dismissSnackbar}
            dismissLabel={this.state.snackbar.dismissLabel}
          />
        </Portal>
        <View style={{ height: Constants.statusBarHeight }} />
        <View style={Styles.header}>
          <View style={{ width: 64 }} />
          <Text style={Styles.headerTitle}>Settings</Text>
          <Button
            color={Colors.headerSetting}
            onPress={this._handleGoBack}
          >
            <Icon name='close' size={35} color={Colors.headerSetting} />
          </Button>
        </View>
      <ScrollView contentContainerStyle={[Styles.scrollableContainer, localStyles.content]}>
        <View style={localStyles.inputRow}>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>First Name</Text>
            <TextInput
              value={this.state.firstName}
              selectionColor={Colors.tint}
              style={localStyles.textInput}
              onChangeText={(text) => this.setState({ firstName: text })}
              autoCapitalize='words'
            />
          </View>
          <View style={localStyles.inputGroupDivider} />
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Last Name</Text>
            <TextInput
              value={this.state.lastName}
              selectionColor={Colors.tint}
              style={localStyles.textInput}
              onChangeText={(text) => this.setState({ lastName: text })}
              autoCapitalize='words'
            />
          </View>
        </View>

        <View style={localStyles.inputRow}>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Email Address</Text>
            <TextInput
              value={this.state.email}
              selectionColor={Colors.tint}
              style={localStyles.textInput}
              onChangeText={(text) => this.setState({ email: text })}
              keyboardType='email-address'
              autoCapitalize='none'
            />
          </View>
        </View>
        <View style={localStyles.inputRow}>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Phone Number</Text>
            <TextInput
              value={this.state.phoneNumber}
              selectionColor={Colors.tint}
              style={localStyles.textInput}
              onChangeText={(text) => this.setState({ phoneNumber: text })}
              keyboardType='phone-pad'
              autoCapitalize='none'
            />
          </View>
        </View>

        <View style={localStyles.inputRow}>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Company Goal</Text>
            <View style={localStyles.inputIcon}>
              <Text style={localStyles.IconInput}>$</Text>
              <TextInput
                value={this.state.companyGoal}
                style={localStyles.textInputWithIcon}
                selectionColor={Colors.tint}
                onChangeText={(text) => this.setState({ companyGoal: text })}
                keyboardType='decimal-pad'
                autoCapitalize='none'
                />
            </View>
          </View>
          <View style={localStyles.inputGroupDivider} />
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Customer Goal</Text>
            <View style={localStyles.inputIcon}>
              <Text style={localStyles.IconInput}>$</Text>
              <TextInput
                value={this.state.customerGoal}
                style={localStyles.textInputWithIcon}
                selectionColor={Colors.tint}
                onChangeText={(text) => this.setState({ customerGoal: text })}
                keyboardType='decimal-pad'
                autoCapitalize='none'
                />
            </View>
          </View>
        </View>

        <View style={localStyles.inputRow}>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Commissions Owed (% of Total Insurance Paid)</Text>
              <View style={localStyles.inputIcon}>
                <Text style={localStyles.IconInput}>%</Text>
                <TextInput
                  value={this.state.commissionsOwed}
                  style={localStyles.textInputWithIcon}
                  selectionColor={Colors.tint}
                  onChangeText={(text) => this.setState({ commissionsOwed: text })}
                  keyboardType='decimal-pad'
                  autoCapitalize='none'
                  />
              </View>
          </View>
          <View style={localStyles.inputGroupDivider} />
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Enable Local Authentication</Text>
              <View style={localStyles.inputIcon}>
                <Icon name='finger-print' size={20} color={Colors.lightButtonUnderlay} />
                <Switch
                  value={this.state.hasLocalAuth}
                  onValueChange={() => this.setState({ hasLocalAuth: !this.state.hasLocalAuth })}
                  color={Colors.tint}
                />
              </View>
          </View>
        </View>

        <Divider style={localStyles.contentDivider}/>

        <View style={localStyles.inputRow}>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Current Password</Text>
              <TextInput
                value={this.state.currentPassword}
                selectionColor={Colors.tint}
                style={localStyles.textInput}
                onChangeText={(text) => this.setState({ currentPassword: text })}
                autoCapitalize='none'
                secureTextEntry
              />
          </View>
        </View>

        <View style={localStyles.inputRow}>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>New Password</Text>
              <TextInput
                value={this.state.newPassword}
                selectionColor={Colors.tint}
                style={localStyles.textInput}
                onChangeText={(text) => this.setState({ newPassword: text })}
                autoCapitalize='none'
                secureTextEntry
              />
          </View>
        </View>

        <View style={localStyles.inputRow}>
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.label}>Confirm Password</Text>
              <TextInput
                value={this.state.confirmPassword}
                selectionColor={Colors.tint}
                style={localStyles.textInput}
                onChangeText={(text) => this.setState({ confirmPassword: text })}
                autoCapitalize='none'
                secureTextEntry
              />
          </View>
        </View>

        <Button
          style={localStyles.save}
          color={Colors.white}
          onPress={this._handleSaveChanges}
        >
          Save Changes
        </Button>
        <Button
          onPress={this._handleLogout}
          style={localStyles.logout}
          color={Colors.white}
        >
          Logout
        </Button>

      </ScrollView>
      </View>
    );
  }
}


const localStyles = StyleSheet.create({
  content: {
    paddingVertical: 25,
    backgroundColor: Colors.white,
  },
  inputGroupDivider: {
    flex: .2,
  },
  inputRow: {
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    marginBottom: 7,
    color: Colors.text,
    fontFamily: 'RobotoMedium',
    fontWeight: 'bold',
  },
  textInput: {
    fontFamily: 'RobotoMedium',
    color: Colors.text,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.lightButtonUnderlay,
    backgroundColor: Colors.white,
  },
  inputIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'RobotoMedium',
    color: Colors.text,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.lightButtonUnderlay,
    backgroundColor: Colors.white,
  },
  textInputWithIcon: {
    width: '100%',
    paddingHorizontal: 10,
    fontFamily: 'RobotoMedium',
    color: Colors.text,
  },
  IconInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.lightButtonUnderlay,
  },
  contentDivider: {
    borderColor: Colors.lightButtonUnderlay,
    borderWidth: 1,
    marginBottom: 15,
  },
  save: {
    marginHorizontal: 25,
    marginTop: 20,
    backgroundColor: Colors.tint,
  },
  logout: {
    marginHorizontal: 25,
    marginTop: 10,
    backgroundColor: Colors.red,
  },
});


const mapStateToProps = (state) => (
  {
    me: state.me,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    logoutMe: () => dispatch(logoutMe()),
    updateAdminMe: (id, data) => dispatch(updateAdminMe(id, data)),
    changePasswordMe: (data) => dispatch(changePasswordMe(data)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(AdminSettings);

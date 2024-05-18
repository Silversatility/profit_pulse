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
  TouchableRipple,
  Portal,
  Dialog,
  Button,
  RadioButton,
  Divider
} from 'react-native-paper';

import { Storage } from '../../api';
import { updateCustomerMe, logoutMe, changePasswordMe } from '../../redux/actions';
import { errorParser } from '../../helpers';
import KarisSnackbar from '../../components/KarisSnackbar';
import Icon from '../../components/Icon';
import Colors from '../../constants/Colors';
import Styles from '../../constants/Styles';


class CustomerSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      businessName: this.props.me.business_name,
      firstName: this.props.me.user.first_name,
      lastName: this.props.me.user.last_name,
      email: this.props.me.user.email,
      phoneNumber: this.props.me.phone_number,
      clinicType: this.props.me.clinic_type,
      currentPassword: null,
      newPassword: null,
      confirmPassword: null,
      snackbar: {
        visible: false,
        message: null,
        dismissLabel: null,
      },
      _clinic_type: null,
      dialogVisibility: false,
    };
  }

  _dismissSnackbar = () => {
    this.setState({ snackbar: { message: null, visible: false, dismissLabel: null } });
  }

  _handleGoBack = () => {
    this.props.navigation.goBack();
  }

  _handleLogout = async () => {
    this.props.navigation.navigate('Auth');
    this.props.logoutMe();
    await Storage.removeItem(Storage.Keys.OAUTH2_DATA);
  }

  _handleSaveChanges = async () => {
    const data = {
      business_name: this.state.businessName,
      phone_number: this.state.phoneNumber,
      clinic_type: this.state.clinicType,
      user: {
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        email: this.state.email,
      },
    };
    const id = this.props.me.user.id;
    try {
      await this.props.updateCustomerMe(id, data);
      this.setState((state, props) => {
        return {
          businessName: props.me.business_name,
          firstName: props.me.user.first_name,
          lastName: props.me.user.last_name,
          email: props.me.user.email,
          phoneNumber: props.me.phone_number,
          clinicType: props.me.clinic_type,
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

  _setTemporaryDialogClinicType = (value) => {
    this.setState({ _clinic_type: value });
  }

  _selectClinicTypeDialog = () => {
    this.setState((state, props) => {
      return {
        dialogVisibility: false,
        _clinic_type: null,
        clinicType: state._clinic_type,
      };
    });
  }

  _showClinicTypeDialog = () => {
    this.setState((state, props) => {
      return {
        dialogVisibility: true,
        _clinic_type: state.clinicType,
      };
    });
  }

  _hideClinicTypeDialog = () => {
    this.setState((state, props) => {
      return {
        dialogVisibility: false,
        _clinic_type: null,
      };
    });
  }

  _getClinicType = (type) => {
    const displayMap = {
      orthopedics: 'Orthopedics',
      podiatry: 'Podiatry',
      pain_management: 'Pain Management',
      opthalmology: 'Opthalmology',
      dermatology: 'Dermatology'
    };
    return displayMap[type];
  }

  _initialize = () => {

  }

  render() {
    return (
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
              <Text style={localStyles.label}>Business Name</Text>
              <TextInput
                value={this.state.businessName}
                selectionColor={Colors.tint}
                style={localStyles.textInput}
                onChangeText={(text) => this.setState({ businessName: text })}
                autoCapitalize='words'
              />
            </View>
          </View>
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
            <TouchableRipple
              style={localStyles.inputGroup}
              onPress={this._showClinicTypeDialog}
              rippleColor={Colors.lightButtonUnderlay}
              activeOpacity={1}
            >
              <View style={localStyles.customClinicFilter}>
                <Text style={localStyles.tableFilterPlaceholder}>{this._getClinicType(this.state.clinicType)}</Text>
                <Icon name='arrow-dropdown' size={15} color={Colors.text} />
              </View>
            </TouchableRipple>
            <Portal>
            <Dialog
              visible={this.state.dialogVisibility}
              onDismiss={this._hideClinicTypeDialog}
            >
              <Dialog.Title style={{ color: Colors.tint }}> Clinic Type </Dialog.Title>
              <Dialog.ScrollArea style={{ height: '30%' }}>
                <ScrollView>
                  <RadioButton.Group
                    onValueChange={(value) => this._setTemporaryDialogClinicType(value)}
                    value={this.state._clinic_type}
                  >
                    <TouchableRipple onPress={() => this._setTemporaryDialogClinicType('orthopedics')}>
                      <View style={localStyles.filterDialogItemRow}>
                        <RadioButton color={Colors.tint} value='orthopedics' />
                        <Text style={localStyles.filterDialogItemLabel}>{this._getClinicType('orthopedics')}</Text>
                      </View>
                    </TouchableRipple>
                    <Divider />
                    <TouchableRipple onPress={() => this._setTemporaryDialogClinicType('podiatry')}>
                      <View style={localStyles.filterDialogItemRow}>
                        <RadioButton color={Colors.tint} value='podiatry' />
                        <Text style={localStyles.filterDialogItemLabel}>{this._getClinicType('podiatry')}</Text>
                      </View>
                    </TouchableRipple>
                    <Divider />
                    <TouchableRipple onPress={() => this._setTemporaryDialogClinicType('pain_management')}>
                      <View style={localStyles.filterDialogItemRow}>
                        <RadioButton color={Colors.tint} value='pain_management' />
                        <Text style={localStyles.filterDialogItemLabel}>{this._getClinicType('pain_management')}</Text>
                      </View>
                    </TouchableRipple>
                    <Divider />
                    <TouchableRipple onPress={() => this._setTemporaryDialogClinicType('opthalmology')}>
                      <View style={localStyles.filterDialogItemRow}>
                        <RadioButton color={Colors.tint} value='opthalmology' />
                        <Text style={localStyles.filterDialogItemLabel}>{this._getClinicType('opthalmology')}</Text>
                      </View>
                    </TouchableRipple>
                    <Divider />
                    <TouchableRipple onPress={() => this._setTemporaryDialogClinicType('dermatology')}>
                      <View style={localStyles.filterDialogItemRow}>
                        <RadioButton color={Colors.tint} value='dermatology' />
                        <Text style={localStyles.filterDialogItemLabel}>{this._getClinicType('dermatology')}</Text>
                      </View>
                    </TouchableRipple>
                  </RadioButton.Group>
                </ScrollView>
              </Dialog.ScrollArea>
              <Dialog.Actions>
                <Button color={Colors.underline} onPress={this._hideClinicTypeDialog}>Cancel</Button>
                <Button color={Colors.tint} onPress={this._selectClinicTypeDialog}>Select Type</Button>
              </Dialog.Actions>
            </Dialog>
            </Portal>
          </View>
          <Divider style={localStyles.contentDivider} />

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
  tableFilterPlaceholder: {
    fontFamily: 'RobotoMedium',
    fontWeight: 'bold',
    fontSize: 12.5,
    color: Colors.text,
  },
  filterDialogItemRow: {
    flexDirection: 'row',
  },
  filterDialogItemLabel: {
    color: Colors.text,
    fontFamily: 'Roboto',
    alignSelf: 'center',
    marginLeft: 25,
  },
  customClinicFilter: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    height: 40,
    borderWidth: 1.5,
    borderColor: Colors.lightButtonUnderlay,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});


const mapStateToProps = (state) => (
  {
    me: state.me,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    logoutMe: () => dispatch(logoutMe()),
    updateCustomerMe: (id, data) => dispatch(updateCustomerMe(id, data)),
    changePasswordMe: (data) => dispatch(changePasswordMe(data)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(CustomerSettings);

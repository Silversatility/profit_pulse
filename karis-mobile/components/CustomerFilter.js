import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  TouchableRipple,
  Portal,
  Dialog,
  Button,
  RadioButton,
  Divider,
} from 'react-native-paper';

import Icon from '../components/Icon';
import Colors from '../constants/Colors';


export default class CustomerFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.visible,
      customer: this.props.customer,
    };
  }

  static defaultProps = {
    onChange: () => {},
    customers: { results: [], params: {} },
    customer: 'all',
  }

  _showFilterDialog = () => {
    this.setState((state, props) => {
      return {
        customer: state.customer,
        visible: true,
      };
    });
  }

  _hideFilterDialog = () => {
    this.setState((state, props) => {
      return {
        visible: false,
        customer: 'all',
      };
    });
  }

  _handleOptionChange = (customer) => {
    this.setState({ customer });
  }

  _applyFilterDialog = () => {
    this.setState((state, props) => {
      const customer = state.customer;
      this.props.onChange(customer);
      return {
        customer,
        visible: false,
      };
    });
  }

  _getDisplay(customer) {
    if (customer == 'all') {
      return 'Select a Customer';
    }
    return this.props.customers.results.find((item) => item.user == customer).business_name;
  }

  render() {
    return(
      <View>
        <TouchableRipple
          onPress={this._showFilterDialog}
          rippleColor={Colors.lightButtonUnderlay}
          activeOpacity={1}
        >
          <View style={this.props.containerStyle}>
            <Text style={localStyles.tableFilterPlaceholder}>{this._getDisplay(this.state.customer)}</Text>
            <Icon name='arrow-dropdown' size={15} color={Colors.text} />
          </View>
        </TouchableRipple>
        <Portal>
          <Dialog
           visible={this.state.visible}
           onDismiss={this._hideFilterDialog}
          >
            <Dialog.Title style={{ color: Colors.tint }}>Select a Filter</Dialog.Title>
            <Dialog.ScrollArea style={{ height: '50%' }}>
              <ScrollView>
                <RadioButton.Group
                  onValueChange={(customer) => this._handleOptionChange(customer)}
                  value={this.state.customer}
                >
                  <TouchableRipple onPress={() => this._handleOptionChange('all')}>
                    <View style={localStyles.filterDialogItemRow}>
                      <RadioButton color={Colors.tint} value={'all'} />
                      <Text style={localStyles.filterDialogItemLabel}>All Customers</Text>
                      <Divider />
                    </View>
                  </TouchableRipple>
                  {
                    this.props.customers.results.map((customer) => (
                      <TouchableRipple key={customer.user} onPress={() => this._handleOptionChange(customer.user)}>
                        <View style={localStyles.filterDialogItemRow}>
                          <RadioButton color={Colors.tint} value={customer.user} />
                          <Text style={localStyles.filterDialogItemLabel}>{customer.business_name}</Text>
                          <Divider />
                        </View>
                      </TouchableRipple>
                    ))
                  }
                </RadioButton.Group>
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <Button color={Colors.underline} onPress={this._hideFilterDialog}>Cancel</Button>
              <Button color={Colors.tint} onPress={this._applyFilterDialog}>Apply Filter</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  filterDialogItemRow: {
    flexDirection: 'row',
  },
  filterDialogItemLabel: {
    color: Colors.text,
    fontFamily: 'Roboto',
    alignSelf: 'center',
    marginLeft: 25,
  },
  tableFilterPlaceholder: {
    fontFamily: 'RobotoMedium',
    fontWeight: 'bold',
    fontSize: 12.5,
    color: Colors.text,
  },
});

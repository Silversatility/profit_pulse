import React from 'react';
import {
  View,
  StyleSheet,
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


export default class DateFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.visible,
      filter: this.props.filter,
      _filter: null,
    };
  }

  static defaultProps = {
    onChange: () => {},
    verbose: false,
    filter: 'year_to_date',
  }

  _showFilterDialog = () => {
    this.setState((state, props) => {
      return {
        visible: true,
        _filter: state.filter,
      };
    });
  }

  _hideFilterDialog = () => {
    this.setState((state, props) => {
      return {
        visible: false,
        _filter: null,
      };
    });
  }

  _setTemporaryDialogFilter = (value) => {
    this.setState({ _filter: value });
  }

  _applyFilterDialog = () => {
    this.setState((state, props) => {
      this.props.onChange(state._filter);
      return {
        visible: false,
        _filter: null,
        filter: state._filter,
      };
    });
  }

  _getDisplay(filter) {
    const displayMap = {
        today: 'Today',
        yesterday: 'Yesterday',
        this_week: 'Weekly',
        this_month: 'Monthly',
        year_to_date: 'Year to Date',
        last_year_to_date: 'Last Year to Date',
        last_3_years: 'Last 3 Years',
      }

    return displayMap[filter];
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
            <Text style={localStyles.tableFilterPlaceholder}>{this._getDisplay(this.state.filter)}</Text>
            <Icon name='arrow-dropdown' size={15} color={Colors.text} />
          </View>
        </TouchableRipple>
        <Portal>
          <Dialog
           visible={this.state.visible}
           onDismiss={this._hideFilterDialog}
          >
            <Dialog.Title style={{ color: Colors.tint }}>Select a Filter</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group
                onValueChange={(value) => this._setTemporaryDialogFilter(value)}
                value={this.state._filter}
              >
                <TouchableRipple onPress={() => this._setTemporaryDialogFilter('today')}>
                  <View style={localStyles.filterDialogItemRow}>
                    <RadioButton color={Colors.tint} value='today' />
                    <Text style={localStyles.filterDialogItemLabel}>{this._getDisplay('today')}</Text>
                  </View>
                </TouchableRipple>
                <Divider />
                <TouchableRipple onPress={() => this._setTemporaryDialogFilter('yesterday')}>
                  <View style={localStyles.filterDialogItemRow}>
                    <RadioButton color={Colors.tint} value='yesterday' />
                    <Text style={localStyles.filterDialogItemLabel}>{this._getDisplay('yesterday')}</Text>
                  </View>
                </TouchableRipple>
                <Divider />
                <TouchableRipple onPress={() => this._setTemporaryDialogFilter('this_week')}>
                  <View style={localStyles.filterDialogItemRow}>
                    <RadioButton color={Colors.tint} value='this_week' />
                    <Text style={localStyles.filterDialogItemLabel}>{this._getDisplay('this_week')}</Text>
                  </View>
                </TouchableRipple>
                <Divider />
                <TouchableRipple onPress={() => this._setTemporaryDialogFilter('this_month')}>
                  <View style={localStyles.filterDialogItemRow}>
                    <RadioButton color={Colors.tint} value='this_month' />
                    <Text style={localStyles.filterDialogItemLabel}>{this._getDisplay('this_month')}</Text>
                  </View>
                </TouchableRipple>
                <Divider />
                <TouchableRipple onPress={() => this._setTemporaryDialogFilter('year_to_date')}>
                  <View style={localStyles.filterDialogItemRow}>
                    <RadioButton color={Colors.tint} value='year_to_date' />
                    <Text style={localStyles.filterDialogItemLabel}>{this._getDisplay('year_to_date')}</Text>
                  </View>
                </TouchableRipple>
                <Divider />
                <TouchableRipple onPress={() => this._setTemporaryDialogFilter('last_year_to_date')}>
                  <View style={localStyles.filterDialogItemRow}>
                    <RadioButton color={Colors.tint} value='last_year_to_date' />
                    <Text style={localStyles.filterDialogItemLabel}>{this._getDisplay('last_year_to_date')}</Text>
                  </View>
                </TouchableRipple>
                <Divider />
                <TouchableRipple onPress={() => this._setTemporaryDialogFilter('last_3_years')}>
                  <View style={localStyles.filterDialogItemRow}>
                    <RadioButton color={Colors.tint} value='last_3_years' />
                    <Text style={localStyles.filterDialogItemLabel}>{this._getDisplay('last_3_years')}</Text>
                  </View>
                </TouchableRipple>
              </RadioButton.Group>
            </Dialog.Content>
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  ActivityIndicator,
  Searchbar,
  Button,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import { listDispenseHistories, listMinifiedCustomers } from '../../redux/actions';
import KarisSnackbar from '../../components/KarisSnackbar';
import Colors from '../../constants/Colors';
import Styles from '../../constants/Styles';
import CustomerHeader from '../../components/customer/CustomerHeader';
import DateButton from '../../components/DateButton';
import Table from '../../components/Table';


class CustomerDispenseHistory extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;
    this.state = {
      snackbar: {
        visible: false,
        message: null,
      },
      datePicker: {
        visible: false,
        value: null,
        saveTo: null,
      },
      search: '',
      sdate: (this.props.dispenseHistories.params.sdate
        ? new Date(new Date(this.props.dispenseHistories.params.sdate).getTime() + timezoneOffset)
        : new Date(today.getFullYear(), today.getMonth(), 1)
      ),
      edate: (this.props.dispenseHistories.params.edate
        ? new Date(new Date(this.props.dispenseHistories.params.edate).getTime() + timezoneOffset)
        : today
      ),
      customer: this.props.dispenseHistories.params.customer || 'all',
      tableConfig: {
        headers: [
          {
            key: 'physician.last_name',
            display: 'Dr Last Name',
            flex: 1,
            sortable: true,
          },
          {
            key: 'product.title',
            display: 'Drug Name',
            flex: 1,
            sortable: true,
          },
          {
            key: 'margin',
            display: 'Profit',
            flex: .7,
            formatter: (data) => '$' + parseFloat(data).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
            sortable: true,
          },
        ],
      },
    };
  }

  _dismissSnackbar = () => {
    this.setState({ snackbar: { message: null, visible: false } });
  }

  _initialize = async () => {
    this.props.listDispenseHistories({
      ...this.props.minifiedCustomers.params,
      ...(this.state.customer !== 'all' && { customer: this.state.customer }),
      page_size: 10,
      sdate: this.state.sdate.toISOString().split('T')[0],
      edate: this.state.edate.toISOString().split('T')[0],
    });
    this.props.listMinifiedCustomers();
  }

  async componentDidMount() {
    if (this.props.dispenseHistories.results.length === 0) {
      await this._initialize();
    }
  }

  _showStartDatePicker = () => {
    this.setState((state, props) => {
      return { datePicker: { visible: true, value: state.sdate, saveTo: 'sdate' } };
    });
  }

  _showEndDatePicker = () => {
    this.setState((state, props) => {
      return { datePicker: { visible: true, value: state.edate, saveTo: 'edate' } };
    });
  }

  _handleSearch = () => {
    const params = {
      ...this.props.dispenseHistories.params,
      search: this.state.search,
      page: 1,
    };
    this.props.listDispenseHistories(params);
  }

  _handleSearchChangeText = (search) => {
    this.setState({ search });
    const params = {
      ...this.props.dispenseHistories.params,
      search,
      page: 1,
    };
    this.props.listDispenseHistories(params);
  }

  _setCustomer = (customer) => {
    this.setState((state, props) => {
      const params = {
        ...this.props.dispenseHistories.params,
        page: 1,
      };
      delete params.customer;
      if (customer !== 'all') {
        params.customer = customer;
      }
      this.props.listDispenseHistories(params);
      return { customer };
    });
  }

  _setDate = (event, date) => {
    if (Platform.OS === 'ios' && event.type === undefined) {
      this.setState((state, props) => {
        return {
          datePicker: {
            visible: true,
            value: date,
            saveTo: state.datePicker.saveTo,
          }
        };
      });
      return;
    }
    if (event.type === 'forceSubmit') {
      date = this.state.datePicker.value;
    }
    if (date === undefined) {
      return this.setState({ datePicker: { visible: false, value: null, saveTo: null } });
    }
    this.setState((state, props) => {
      date = new Date(date);
      const params = {
        ...this.props.dispenseHistories.params,
        sdate: state.sdate.toISOString().split('T')[0],
        edate: state.edate.toISOString().split('T')[0],
        [state.datePicker.saveTo]: date.toISOString().split('T')[0],
        ...(state.customer !== 'all' && { customer: state.customer }), // conditionally add customer property if there not falsey
        page: 1,
      };
      this.props.listDispenseHistories(params);
      return {
        [state.datePicker.saveTo]: date,
        datePicker: { visible: false, value: null, saveTo: null },
      };
    });
  }

  render() {
    return(
      <View style={Styles.container}>
        {
          this.state.datePicker.visible &&
          <View>
            <DateTimePicker
              value={this.state.datePicker.value}
              onChange={this._setDate}
            />
            {
              Platform.OS === 'ios' &&
              <View>
                <Button
                  color={Colors.tint}
                  onPress={() => {
                    this._setDate({ type: 'forceSubmit' });
                  }}
                  >
                  Apply Filter
                </Button>
                <Button color={Colors.underline} onPress={() => this.setState({ datePicker: { visible: false, value: null, saveTo: null } })}>Cancel</Button>
              </View>
            }
        </View>
        }
        <KarisSnackbar
          message={this.state.snackbar.message}
          visible={this.state.snackbar.visible}
          onDismiss={this._dismissSnackbar}
        />
        <CustomerHeader navigation={this.props.navigation} headerTitle='Dispense History' previousScreen='CustomerDispenseHistory' />
        <ScrollView alwaysBounceVertical={false} contentContainerStyle={[Styles.scrollableContainer, Styles.content]}>
          {
            this.props.dispenseHistories.loading &&
              <View style={Styles.loadingOverlay}>
                <ActivityIndicator animating={true} size='large' color={Colors.tint}/>
              </View>
          }
          <Searchbar
            value={this.state.search}
            onChangeText={this._handleSearchChangeText}
            onIconPress={this._handleSearch}
            iconColor={Colors.text}
            placeholder='Search...'
            theme={{ colors: { placeholder: Colors.text } }}
            style={{
              borderRadius: 25,
              height: 30,
              color: 'pink',
              elevation: 0,
              borderWidth: 1.5,
              borderColor: Colors.lightButtonUnderlay,
            }}
            inputStyle={{
              color: Colors.text,
              fontSize: 12.5,
            }}
          />
          <View style={{ height: 15 }} />
          <View style={localStyles.dateButtonRow}>
            <DateButton
              onPress={this._showStartDatePicker}
              value={this.state.sdate}
            />
          <View style={{ width: 15 }} />
            <DateButton
              onPress={this._showEndDatePicker}
              value={this.state.edate}
            />
          </View>
          <View style={{ height: 15 }} />
          <Table
            payload={this.props.dispenseHistories}
            headers={this.state.tableConfig.headers}
            api={this.props.listDispenseHistories}
          />
        </ScrollView>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  dateFilterContainerStyle: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    height: 35,
    borderWidth: 1.5,
    borderColor: Colors.lightButtonUnderlay,
    borderRadius: 2.5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  tableFilterPlaceholder: {
    fontFamily: 'RobotoMedium',
    fontWeight: 'bold',
    fontSize: 12.5,
    color: Colors.text,
  },
});

const mapStateToProps = (state) => (
  {
    dispenseHistories: state.dispenseHistories,
    minifiedCustomers: state.minifiedCustomers,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    listDispenseHistories: (params = {}) => dispatch(listDispenseHistories(params)),
    listMinifiedCustomers: (params = {}) => dispatch(listMinifiedCustomers(params)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(CustomerDispenseHistory);

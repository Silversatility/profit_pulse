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
  Text,
  Button,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import { listCustomerRevenues } from '../../redux/actions';
import KarisSnackbar from '../../components/KarisSnackbar';
import Colors from '../../constants/Colors';
import { currencyFormatter } from '../../helpers';
import Styles from '../../constants/Styles';
import AdminHeader from '../../components/admin/AdminHeader';
import DateButton from '../../components/DateButton';
import Table from '../../components/Table';


class CustomerRevenue extends Component {
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
      sdate: (this.props.customerRevenues.params.sdate
        ? new Date(new Date(this.props.customerRevenues.params.sdate).getTime() + timezoneOffset)
        : new Date(today.getFullYear(), today.getMonth(), 1)
      ),
      edate: (this.props.customerRevenues.params.edate
        ? new Date(new Date(this.props.customerRevenues.params.edate).getTime() + timezoneOffset)
        : today
      ),
      tableConfig: {
        headers: [
          {
            key: 'business_name',
            display: 'Practice Name',
            flex: 1,
            sortable: true,
          },
          {
            key: 'net_profit',
            display: 'Profit',
            flex: 1,
            sortable: true,
            formatter: currencyFormatter,
          },
        ],
      },
    };
  }

  _dismissSnackbar = () => {
    this.setState({ snackbar: { message: null, visible: false } });
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
        ...this.props.customerRevenues.params,
        sdate: state.sdate.toISOString().split('T')[0],
        edate: state.edate.toISOString().split('T')[0],
        [state.datePicker.saveTo]: date.toISOString().split('T')[0],
      };
      this.props.listCustomerRevenues(params);
      return {
        [state.datePicker.saveTo]: date,
        datePicker: { visible: false, value: null, saveTo: null },
      };
    });
  }

  _initialize = async () => {
    const params = {
      sdate: this.state.sdate.toISOString().split('T')[0],
      edate: this.state.edate.toISOString().split('T')[0],
      ordering: '-net_profit',

    };
    this.props.listCustomerRevenues(params);
  }

  async componentDidMount() {
    if (this.props.customerRevenues.results.length === 0) {
      await this._initialize();
    }
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
      <AdminHeader navigation={this.props.navigation} headerTitle='Customer Revenue' previousScreen='CustomerRevenue' />
        <ScrollView alwaysBounceVertical={true} contentContainerStyle={[Styles.scrollableContainer, Styles.content]}>
          {
            this.props.customerRevenues.loading &&
              <View style={Styles.loadingOverlay}>
                <ActivityIndicator animating={true} size='large' color={Colors.tint}/>
              </View>
          }
          <View style={localStyles.dateButtonRow}>
            <DateButton
              onPress={this._showStartDatePicker}
              value={this.state.sdate}
            />
          <View style={{ width: 10 }} />
            <DateButton
              onPress={this._showEndDatePicker}
              value={this.state.edate}
            />
          </View>
          <View style={{ height: 25 }} />
          <Table
            payload={this.props.customerRevenues}
            headers={this.state.tableConfig.headers}
            api={this.props.listCustomerRevenues}
            footerCells={
              [
                <Text style={localStyles.footerCellsText} key={1}>TOTAL</Text>,
                <Text style={localStyles.footerCellsText} key={2}>{currencyFormatter(this.props.customerRevenues.totalNetProfit || 0)}</Text>
              ]
            }
          />
        </ScrollView>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  dateButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerCellsText: {
    color: Colors.text,
    fontSize: 11,
    fontFamily: 'Roboto',
    margin: 10,
    fontWeight: 'bold',
  },
});

const mapStateToProps = (state) => (
  {
    customerRevenues: state.customerRevenues,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    listCustomerRevenues: (params = {}) => dispatch(listCustomerRevenues(params)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(CustomerRevenue);

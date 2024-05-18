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

import { listKarisRevenues } from '../../redux/actions';
import KarisSnackbar from '../../components/KarisSnackbar';
import Colors from '../../constants/Colors';
import { currencyFormatter } from '../../helpers';
import Styles from '../../constants/Styles';
import AdminHeader from '../../components/admin/AdminHeader';
import DateButton from '../../components/DateButton';
import Table from '../../components/Table';


class KarisRevenue extends Component {
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
      sdate: (this.props.karisRevenues.params.sdate
        ? new Date(new Date(this.props.karisRevenues.params.sdate).getTime() + timezoneOffset)
        : new Date(today.getFullYear(), today.getMonth(), 1)
      ),
      edate: (this.props.karisRevenues.params.edate
        ? new Date(new Date(this.props.karisRevenues.params.edate).getTime() + timezoneOffset)
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
            key: 'total_revenue',
            display: 'Total Revenue',
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
        ...this.props.karisRevenues.params,
        sdate: state.sdate.toISOString().split('T')[0],
        edate: state.edate.toISOString().split('T')[0],
        [state.datePicker.saveTo]: date.toISOString().split('T')[0],
      };
      this.props.listKarisRevenues(params);
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
      ordering: '-total_revenue',
    };
    this.props.listKarisRevenues(params);
  }

  async componentDidMount() {
    if (this.props.karisRevenues.results.length === 0) {
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
      <AdminHeader alwaysBounceVertical={true} navigation={this.props.navigation} headerTitle='Karis Revenue' previousScreen='KarisRevenue' />
        <ScrollView contentContainerStyle={[Styles.scrollableContainer, Styles.content]}>
          {
            this.props.karisRevenues.loading &&
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
            payload={this.props.karisRevenues}
            headers={this.state.tableConfig.headers}
            api={this.props.listKarisRevenues}
            footerCells={
              [
                <Text style={localStyles.footerCellsText} key={1}>TOTAL</Text>,
                <Text style={localStyles.footerCellsText} key={2}>{currencyFormatter(this.props.karisRevenues.totalTotalRevenue || 0)}</Text>
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
    karisRevenues: state.karisRevenues,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    listKarisRevenues: (params = {}) => dispatch(listKarisRevenues(params)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(KarisRevenue);

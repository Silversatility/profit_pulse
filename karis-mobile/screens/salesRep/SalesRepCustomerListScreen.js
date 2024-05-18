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
  Searchbar,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import { listCustomers } from '../../redux/actions';
import KarisSnackbar from '../../components/KarisSnackbar';
import Colors from '../../constants/Colors';
import { currencyFormatter } from '../../helpers';
import Styles from '../../constants/Styles';
import AdminHeader from '../../components/admin/AdminHeader';
import DateButton from '../../components/DateButton';
import Table from '../../components/Table';


class CustomerList extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;
    this.state = {
      snackbar: {
        visible: false,
        message: null,
      },
      text__contains: '',
      tableConfig: {
        headers: [
          {
            key: 'business_name',
            display: 'Practice Name',
            flex: 1,
            sortable: true,
          },
          {
            key: 'clinic_type',
            display: 'Clinic Type',
            flex: 1,
            sortable: true,
          },
          {
            key: 'enrollment_date',
            display: 'Enrollment Date',
            flex: 1,
            sortable: true,
            formatter: (data) => data ? data : "None",
          },
          {
            key: 'active',
            display: 'Active',
            flex: .5,
            sortable: false,
            formatter: (data) => data ? "Yes" : "No",
          },
        ],
      },
    };
  }

  _handleSearch = () => {
    const params = {
      ...this.props.customers.params,
      text__contains: this.state.text__contains,
      page: 1,
    };
    this.props.listCustomers(params);
  }

  _handleSearchChangeText = (text__contains) => {
    this.setState({ text__contains });
    const params = {
      ...this.props.customers.params,
      text__contains,
      page: 1,
    };
    this.props.listCustomers(params);
  }

  _dismissSnackbar = () => {
    this.setState({ snackbar: { message: null, visible: false } });
  }

  _initialize = async () => {
    this.props.listCustomers();
  }

  async componentDidMount() {
    if (this.props.customers.results.length === 0) {
      await this._initialize();
    }
  }

  render() {
    return(
      <View style={Styles.container}>
        <KarisSnackbar
          message={this.state.snackbar.message}
          visible={this.state.snackbar.visible}
          onDismiss={this._dismissSnackbar}
        />
      <AdminHeader navigation={this.props.navigation} headerTitle='Customer List' previousScreen='CustomerList' />
        <ScrollView alwaysBounceVertical={true} contentContainerStyle={[Styles.scrollableContainer, Styles.content]}>
          {
            this.props.customers.loading &&
              <View style={Styles.loadingOverlay}>
                <ActivityIndicator animating={true} size='large' color={Colors.tint}/>
              </View>
          }
          <Searchbar
            value={this.state.text__contains}
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
          <View style={{ height: 25 }} />
          <Table
            payload={this.props.customers}
            headers={this.state.tableConfig.headers}
            api={this.props.listCustomers}
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
    customers: state.customers,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    listCustomers: (params = {}) => dispatch(listCustomers(params)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(CustomerList);

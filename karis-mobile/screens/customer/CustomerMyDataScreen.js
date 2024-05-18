import React, { Component } from 'react';
import { Linking } from 'expo';
import { connect } from 'react-redux';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  ActivityIndicator,
} from 'react-native-paper';

import { listMyProducts } from '../../redux/actions';
import KarisSnackbar from '../../components/KarisSnackbar';
import Colors from '../../constants/Colors';
import Styles from '../../constants/Styles';
import CustomerHeader from '../../components/customer/CustomerHeader';
import DateFilter from '../../components/DateFilter';
import Table from '../../components/Table';

class CustomerMyDataScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      snackbar: {
        visible: false,
        message: null,
      },
      filterDialog: {
        visible: false,
        _filter: null,
        filter: 'year_to_date',
        filterDisplay: 'Year to Date',
      },
      tableConfig: {
        headers: [
          {
            key: 'ndc',
            display: 'NDC',
            flex: 1,
            sortable: true,
            onPress: this._goToDailyMed,
            style: Styles.ndc,
          },
          {
            key: 'title',
            display: 'Drug Name',
            flex: 1,
            sortable: true,
          },
          {
            key: 'rank',
            display: 'Rank',
            flex: .5,
            sortable: true,
          },
          {
            key: 'average_margin',
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
    this.props.listMyProducts({ customer: this.props.me.user.id });
  }

  _goToDailyMed = (item) => {
    Linking.openURL(`https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${item.ndc}`);
  }

  async componentDidMount() {
    if (this.props.myProducts.results.length === 0) {
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
        <CustomerHeader navigation={this.props.navigation} headerTitle='My Data' previousScreen='CustomerMyData' />
        <ScrollView alwaysBounceVertical={false} contentContainerStyle={[Styles.scrollableContainer, Styles.content]}>
          {
            this.props.myProducts.loading &&
              <View style={Styles.loadingOverlay}>
                <ActivityIndicator animating={true} size='large' color={Colors.tint}/>
              </View>
          }
          <DateFilter
            verbose={true}
            onChange={(duration) => this.props.listMyProducts({ ...this.props.myProducts.params, duration, page: 1 })}
            containerStyle={localStyles.dateFilterContainerStyle}
          />
          <View style={{ height: 25 }} />
          <Table
            payload={this.props.myProducts}
            headers={this.state.tableConfig.headers}
            api={this.props.listMyProducts}
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
});

const mapStateToProps = (state) => (
  {
    myProducts: state.myProducts,
    me: state.me,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    listMyProducts: (params = {}) => dispatch(listMyProducts(params)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(CustomerMyDataScreen);

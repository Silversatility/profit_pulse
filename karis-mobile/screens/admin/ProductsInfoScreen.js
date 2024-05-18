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

import { listProducts } from '../../redux/actions';
import KarisSnackbar from '../../components/KarisSnackbar';
import Colors from '../../constants/Colors';
import Styles from '../../constants/Styles';
import AdminHeader from '../../components/admin/AdminHeader';
import DateFilter from '../../components/DateFilter';
import Table from '../../components/Table';


class ProductsInfo extends Component {
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
    this.props.listProducts();
  }

  _goToDailyMed = (item) => {
    Linking.openURL(`https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${item.ndc}`);
  }

  async componentDidMount() {
    if (this.props.products.results.length === 0) {
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
        <AdminHeader navigation={this.props.navigation} headerTitle='Products Info' previousScreen='Products' />
        <ScrollView alwaysBounceVertical={false} contentContainerStyle={[Styles.scrollableContainer, Styles.content]}>
          {
            this.props.products.loading &&
              <View style={Styles.loadingOverlay}>
                <ActivityIndicator animating={true} size='large' color={Colors.tint}/>
              </View>
          }
          <DateFilter
            verbose={true}
            onChange={(duration) => this.props.listProducts({ ...this.props.products.params, duration, page: 1 })}
            containerStyle={localStyles.dateFilterContainerStyle}
          />
          <View style={{ height: 25 }} />
          <Table
            payload={this.props.products}
            headers={this.state.tableConfig.headers}
            api={this.props.listProducts}
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
    products: state.products,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    listProducts: (params = {}) => dispatch(listProducts(params)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(ProductsInfo);

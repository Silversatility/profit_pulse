import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  ProgressBar,
} from 'react-native-paper';

import { listCustomerProfitabilities } from '../../redux/actions';

import KarisSnackbar from '../../components/KarisSnackbar';
import Colors from '../../constants/Colors';
import Styles from '../../constants/Styles';
import CustomerHeader from '../../components/customer/CustomerHeader';


class Profitability extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateFilter: 'profit_year_to_date',
      snackbar: {
        visible: false,
        message: null,
      },
    };
  }

  _dismissSnackbar = () => {
    this.setState({ snackbar: { message: null, visible: false } });
  }

  _initialize = async () => {
    await this.props.listCustomerProfitabilities();
  }

  _setActiveFilter = (value) => {
    this.setState({ dateFilter: value });
  }

  _getPercentage(value){
    var profitAmount = [];
    this.props.customerProfitabilities.results.map((item, index) => {
      profitAmount.push(Number(item[this.state.dateFilter].replace(/[^0-9.-]+/g,"")));
    });
    var amount = Number(value.replace(/[^0-9.-]+/g,""));
    var highestValue = Math.max(...profitAmount);
    var zeroAmount = Math.round(highestValue).toString().length - 1;
    if (zeroAmount == 0) {
      zeroAmount = 1;
    }
    var basePlacement = "1" + [...Array(Number(zeroAmount)).keys()].reduce((accumulator, current) => '0' + accumulator, '');
    var minimumPlacement = highestValue.toString().charAt(0) + [...Array(Number(zeroAmount)).keys()].reduce((accumulator, current) => '0' + accumulator, '');

    return(amount / (Math.round(minimumPlacement) + Number(basePlacement)));
  }

  async componentDidMount() {
    this._initialize();
  }

  render() {
    return(
      <View style={Styles.container}>
        <KarisSnackbar
          message={this.state.snackbar.message}
          visible={this.state.snackbar.visible}
          onDismiss={this._dismissSnackbar}
        />
        <CustomerHeader navigation={this.props.navigation} headerTitle='Profitability' previousScreen='ProfitabilityScreen' />
        <ScrollView alwaysBounceVertical={false} contentContainerStyle={[Styles.scrollableContainer, Styles.content]}>
          {
            this.props.customerProfitabilities.loading &&
              <View style={Styles.loadingOverlay}>
                <ActivityIndicator animating={true} size='large' color={Colors.tint}/>
              </View>
          }
          <View style={localStyles.filterButtonContainer} >
            <Button
              color={Colors.opaqueTint}
              labelStyle={{ ...(this.state.dateFilter == 'profit_year_to_date') ? { ...localStyles.filterButtonActiveLabel } : { ...localStyles.filterButtonLabel } }}
              style={{ ...(this.state.dateFilter == 'profit_year_to_date') ? { ...localStyles.buttonActive } : { ...localStyles.filterButton } }}
              uppercase={false}
              mode="outlined"
              onPress={() => this._setActiveFilter('profit_year_to_date')}
            >
              YTD
            </Button>
            <View style={{ width: 5 }}/>
            <Button
              color={Colors.opaqueTint}
              labelStyle={{ ...(this.state.dateFilter == 'profit_today') ? { ...localStyles.filterButtonActiveLabel } : { ...localStyles.filterButtonLabel } }}
              style={{ ...(this.state.dateFilter == 'profit_today') ? { ...localStyles.buttonActive } : { ...localStyles.filterButton } }}
              uppercase={false}
              mode="outlined"
              onPress={() => this._setActiveFilter('profit_today')}
            >
              today
            </Button>
            <View style={{ width: 5 }}/>
            <Button
              color={Colors.opaqueTint}
              labelStyle={{ ...(this.state.dateFilter == 'profit_this_week') ? { ...localStyles.filterButtonActiveLabel } : { ...localStyles.filterButtonLabel } }}
              style={{ ...(this.state.dateFilter == 'profit_this_week') ? { ...localStyles.buttonActive } : { ...localStyles.filterButton } }}
              uppercase={false}
              mode="outlined"
              onPress={() => this._setActiveFilter('profit_this_week')}
            >
              week
            </Button>
            <View style={{ width: 5 }}/>
            <Button
              color={Colors.opaqueTint}
              labelStyle={{ ...(this.state.dateFilter == 'profit_this_month') ? { ...localStyles.filterButtonActiveLabel } : { ...localStyles.filterButtonLabel } }}
              style={{ ...(this.state.dateFilter == 'profit_this_month') ? { ...localStyles.buttonActive } : { ...localStyles.filterButton } }}
              uppercase={false}
              mode="outlined"
              onPress={() => this._setActiveFilter('profit_this_month')}
            >
              month
            </Button>
            <View style={{ width: 5 }}/>
            <Button
              color={Colors.opaqueTint}
              labelStyle={{ ...(this.state.dateFilter == 'profit_last_year_to_date') ? { ...localStyles.filterButtonActiveLabel } : { ...localStyles.filterButtonLabel } }}
              style={{ ...(this.state.dateFilter == 'profit_last_year_to_date') ? { ...localStyles.buttonActive } : { ...localStyles.filterButton } }}
              uppercase={false}
              mode="outlined"
              onPress={() => this._setActiveFilter('profit_last_year_to_date')}
            >
              LYTD
            </Button>
          </View>
          <View style={{ height: 25 }}/>
          {
            this.props.customerProfitabilities.results.map((item, index) => {
               return (
                 <View style={localStyles.progressBarContainer} key={index}>
                   <Text style={localStyles.progressBarName} >{item.name}</Text>
                   <ProgressBar progress={this._getPercentage(item[this.state.dateFilter])} color={Colors.green} style={localStyles.progressBar} />
                   <Text style={localStyles.progressAmount} >${item[this.state.dateFilter]}</Text>
                 </View>
               );
             })
          }
        </ScrollView>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  progressBarContainer: {
    paddingVertical: 5,
  },
  progressBarName: {
    fontSize: 18,
    fontFamily: 'RobotoMedium',
    color: Colors.text,
    paddingBottom: 5,
  },
  progressAmount: {
    fontSize: 12,
    fontFamily: 'Roboto',
    color: Colors.text,
    alignSelf: 'flex-end',
    paddingTop: 5,
  },
  progressBar: {
    height: 10,
    borderRadius: 100,
    backgroundColor: Colors.lightgray,
  },
  filterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  filterButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.lightButtonUnderlay,
    borderRadius: 2.5,
    alignSelf: 'flex-start',
    color: Colors.tint,
    minWidth: 0,
  },
  filterButtonLabel: {
    color: Colors.text,
    marginHorizontal: 0,
  },
  buttonActive: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.lightButtonUnderlay,
    borderRadius: 2.5,
    alignSelf: 'flex-start',
    backgroundColor: Colors.tint,
    minWidth: 0,
  },
  filterButtonActiveLabel: {
    color: Colors.white,
    marginHorizontal: 0,
  }
});

const mapStateToProps = (state) => (
  {
    customerProfitabilities: state.customerProfitabilities,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    listCustomerProfitabilities: (params = {}) => dispatch(listCustomerProfitabilities(params)),
  };
};



export default connect(mapStateToProps, mapDispatchToProps)(Profitability);

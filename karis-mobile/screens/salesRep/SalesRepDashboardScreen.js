import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

import { listAdminReports, listAdminTotalProfits } from '../../redux/actions';
import KarisSnackbar from '../../components/KarisSnackbar';
import DateFilter from '../../components/DateFilter';
import Colors from '../../constants/Colors';
import Styles from '../../constants/Styles';
import AdminHeader from '../../components/admin/AdminHeader';


class AdminReports extends Component {
  render() {
    return (
      <View style={Styles.container}>
        <View style={localStyles.adminReportRow}>
          <View style={localStyles.adminReportItem}>
            <Text style={localStyles.adminReportItemLabel}>Total Paid</Text>
            <Text style={localStyles.adminReportItemPrice}>${this.props.data.total_paid}</Text>
          </View>
          <View style={localStyles.adminReportItem}>
            <Text style={localStyles.adminReportItemLabel}>Insurance Paid</Text>
            <Text style={localStyles.adminReportItemPrice}>${this.props.data.insurance_paid}</Text>
          </View>
        </View>
        <View style={localStyles.divider} />
        <View style={localStyles.adminReportRow}>
          <View style={localStyles.adminReportItem}>
            <Text style={localStyles.adminReportItemLabel}>Percentage Fees</Text>
            <Text style={localStyles.adminReportItemPrice}>${this.props.data.percentage_fees}</Text>
          </View>
          <View style={localStyles.adminReportItem}>
            <Text style={localStyles.adminReportItemLabel}>Software Paid</Text>
            <Text style={localStyles.adminReportItemPrice}>${this.props.data.monthly_maintenance_revenue}</Text>
          </View>
        </View>
        <View style={localStyles.divider} />
        <View style={localStyles.adminReportRow}>
          <View style={localStyles.adminReportItem}>
            <Text style={localStyles.adminReportItemLabel}>Enrollment Fees</Text>
            <Text style={localStyles.adminReportItemPrice}>${this.props.data.enrollment_profit}</Text>
          </View>
          <View style={localStyles.adminReportItem}>
            <Text style={localStyles.adminReportItemLabel}>Revenue</Text>
            <Text style={localStyles.adminReportItemPrice}>${this.props.data.total_profit}</Text>
          </View>
        </View>
      </View>
    );
  }
}


class AdminTotalProfitsChart extends React.Component {
  render() {
    return(
      <View style={localStyles.chartContainer}>
        <View style={localStyles.chartHeader}>
          <Text style={localStyles.chartHeaderLabel}>Net Profit</Text>
          <DateFilter
            filter={this.props.durationFilter}
            onChange={(duration) => this.props.reFetch({ duration })}
            containerStyle={localStyles.chartHeaderFilterContainer}
          />
        </View>
        {
          this.props.data.labels.length == 0
            ? (
                <View style={localStyles.noDataContainer}>
                  <Text style={localStyles.noDataText}>No Data</Text>
                </View>
              )
            : (
                <LineChart
                  data={this.props.data}
                  width={Dimensions.get('window').width * .9}
                  height={Dimensions.get('window').height / 3}
                  verticalLabelRotation={45}
                  chartConfig={{
                    backgroundColor: Colors.white,
                    backgroundGradientFrom: Colors.white,
                    backgroundGradientTo: Colors.white,
                    fillShadowGradientOpacity: .125,
                    propsForLabels: { fill: Colors.text, fontSize: 11 },
                    color: (opacity = 1) => `rgba(6, 237, 254, ${opacity})`,
                  }}
                  xLabelsOffset={-10}
                  formatYLabel={
                    (label) => {
                      const profit = Math.round(parseFloat(label)/1000);
                      return `$${profit}${(profit) ? 'k' : ''}`;
                    }
                  }
                  bezier
                  style={{
                    marginTop: 10,
                  }}
                />
              )
        }
      </View>
    );
  }
}


class DashboardScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      snackbar: {
        visible: false,
        message: null,
      },
      chartData: {
        labels: [],
        datasets: [{ data: [] }],
      }
    };
  }

  _dismissSnackbar = () => {
    this.setState({ snackbar: { message: null, visible: false } });
  }

  _initialize = async (params = { duration: 'year_to_date' }) => {
    // Put all data fetching here
    this.setState({ loading: true });

    await this._fetchAdminReports(params);
    await this._fetchAdminTotalProfits(params);

    this.setState({ loading: false });
    // this.setState({ snackbar: { visible: true, message: 'Failed to fetch admin reports' } });
  }

  _fetchAdminReports = async (params) => {
    await this.props.listAdminReports(params);
  }

  _fetchAdminTotalProfits = async (params) => {
    await this.props.listAdminTotalProfits(params);
    const chartData = {
      labels: [],
      datasets: [ { data: [] }],
    };
    for (const item of this.props.totalProfits.results) {
      for (let [label, profit] of Object.entries(item)) {
        label = this._getChartLabel(label);
        chartData.labels.push(label);
        chartData.datasets[0].data.push(profit);
      }
    }
    if (params.duration == 'year_to_date') {
      const currentYear = new Date().getFullYear() % 100;
      const months = [
        `1.${currentYear}`,
        `2.${currentYear}`,
        `3.${currentYear}`,
        `4.${currentYear}`,
        `5.${currentYear}`,
        `6.${currentYear}`,
        `7.${currentYear}`,
        `8.${currentYear}`,
        `9.${currentYear}`,
        `10.${currentYear}`,
        `11.${currentYear}`,
        `12.${currentYear}`
      ];
      months.map((month) => {
        if (chartData.labels.indexOf(month) < 0) {
          chartData.labels.push(month);
          chartData.datasets[0].data.push(0);
        }
      });
    }
    this.setState({ chartData });
  }

  _getChartLabel = (label) => {
    const durationFilter = this.props.totalProfits.params.duration;
    if (durationFilter == 'this_month' || durationFilter == 'last_month') {
      const firstDay = new Date(label.split('-')[0]);
      const secondDay = new Date(label.split('-')[1]);
      return `${firstDay.getDate()}-${secondDay.getDate()}`;
    } else if (durationFilter == 'year_to_date') {
      const currentYear = new Date().getFullYear();
      const months = [
        `January ${currentYear}`,
        `February ${currentYear}`,
        `March ${currentYear}`,
        `April ${currentYear}`,
        `May ${currentYear}`,
        `June ${currentYear}`,
        `July ${currentYear}`,
        `August ${currentYear}`,
        `September ${currentYear}`,
        `October ${currentYear}`,
        `November ${currentYear}`,
        `December ${currentYear}`
      ];
      return `${months.indexOf(label) + 1}.${currentYear % 100}`;
    } else if (durationFilter == 'last_year_to_date') {
      const lastYear = new Date().getFullYear() - 1;
      const months = [
        `January ${lastYear}`,
        `February ${lastYear}`,
        `March ${lastYear}`,
        `April ${lastYear}`,
        `May ${lastYear}`,
        `June ${lastYear}`,
        `July ${lastYear}`,
        `August ${lastYear}`,
        `September ${lastYear}`,
        `October ${lastYear}`,
        `November ${lastYear}`,
        `December ${lastYear}`
      ];
      return `${months.indexOf(label) + 1}.${(lastYear % 100)}`;
    }
    return label;
  }

  async componentDidMount() {
    await this._initialize();
  }

  render() {
    return (
      <View style={Styles.container}>
        <KarisSnackbar
          message={this.state.snackbar.message}
          visible={this.state.snackbar.visible}
          onDismiss={this._dismissSnackbar}
        />
        <AdminHeader navigation={this.props.navigation} headerTitle='Dashboard' previousScreen='AdminDashboard' />
        <ScrollView alwaysBounceVertical={false} contentContainerStyle={[Styles.scrollableContainer, Styles.content]}>
          {
            this.state.loading
              ? (
                  <View style={[Styles.container, Styles.middleCenter]}>
                    <ActivityIndicator animating={true} size='large' color={Colors.tint}/>
                  </View>
                )
              : (
                  <View>
                    <AdminReports data={this.props.reports.results} />
                    <View style={localStyles.divider} />
                    <AdminTotalProfitsChart durationFilter={this.props.reports.params.duration} reFetch={this._initialize} data={this.state.chartData}/>
                  </View>
                )
          }
        </ScrollView>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  noDataContainer: {
    flex: 1,
    marginTop: 25,
  },
  noDataText: {
    fontFamily: 'Roboto',
    color: Colors.text,
  },
  chartHeaderLabel: {
    flex: 1,
    fontFamily: 'Roboto',
    color: Colors.text,
    fontSize: 16,
  },
  chartHeaderFilterContainer: {
    flex: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    height: 20,
    width: 125,
    borderWidth: 1.5,
    borderColor: Colors.lightButtonUnderlay,
    borderRadius: 2.5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 0,
  },
  chartContainer: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    marginVertical: 12,
    height: .5,
    backgroundColor: Colors.underline,
  },
  adminReportItemLabel: {
    fontFamily: 'Roboto',
    color: Colors.text,
    fontSize: 12,
  },
  adminReportItemPrice: {
    fontFamily: 'RobotoMedium',
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 20,
  },
  adminReportRow: {
    flex: 1,
    flexDirection: 'row',
  },
  adminReportItem: {
    flex: 1,
  },
});


const mapStateToProps = (state) => (
  {
    reports: state.reports,
    totalProfits: state.totalProfits,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    listAdminReports: (params) => dispatch(listAdminReports(params)),
    listAdminTotalProfits: (params) => dispatch(listAdminTotalProfits(params)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(DashboardScreen);

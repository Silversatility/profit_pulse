import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { Agenda } from 'react-native-calendars';

import { listCalendarEvents } from '../../redux/actions';
import KarisSnackbar from '../../components/KarisSnackbar';
import Colors from '../../constants/Colors';
import Styles from '../../constants/Styles';
import AdminHeader from '../../components/admin/AdminHeader';


function NoAgenda () {
  const styles = {
    container: {
      flex: 1,
      paddingTop: 50,
      alignContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      height: 50,
    },
    text: {
      fontFamily: 'Roboto',
      fontSize: 25,
      color: Colors.text,
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>No Schedule for This Day</Text>
      </View>
    </View>
  );
}

class AgendaItem extends Component {
  styles = {
    container: {
      flex: 1,
      backgroundColor: Colors.white,
      marginRight: 20,
      marginTop: 15,
      padding: 15,
      borderRadius: 5,
    },
    text: {
      color: Colors.text,
      fontFamily: 'Roboto',
    }
  }

  render() {
    const styles = this.styles;
    const data = this.props.data;
    return(
      <View style={styles.container}>
        <Text style={styles.text}>{data.text}</Text>
      </View>
    );
  }
}

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      snackbar: {
        visible: false,
        message: null,
      },
    };
  }

  componentDidMount() {
    this.props.listCalendarEvents();
  }

  render() {
    return(
      <View style={Styles.container}>
        <KarisSnackbar
          message={this.state.snackbar.message}
          visible={this.state.snackbar.visible}
          onDismiss={this._dismissSnackbar}
        />
        <AdminHeader navigation={this.props.navigation} headerTitle='Calendar' />
        <View style={{ flex: 1 }}>
          {
            this.props.calendarEvents.loading &&
              <View style={Styles.loadingOverlay}>
                <ActivityIndicator animating={true} size='large' color={Colors.tint}/>
              </View>
          }
          <Agenda
            items={this.props.calendarEvents.results}
            renderItem={(data, isFirst) => <AgendaItem data={data} />}
            renderEmptyData={() => <NoAgenda />}
            rowHasChanged={(r1, r2) => r1.text !== r2.text}
            theme={{
              agendaTodayNumColor: Colors.opaqueTint,
              agendaTodayColor: Colors.opaqueTint,
              selectedDayBackgroundColor: Colors.tint,
              agendaKnobColor: Colors.tint,
              dotColor: Colors.tint,
              todayTextColor: Colors.opaqueTint,
            }}
          />
        </View>
      </View>
    );
  }
}


const mapStateToProps = (state) => (
  {
    calendarEvents: state.calendarEvents,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    listCalendarEvents: () => dispatch(listCalendarEvents()),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(Calendar);

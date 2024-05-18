import * as Sentry from 'sentry-expo';
import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { retrieveMe } from '../redux/actions';
import { Storage } from '../api';
import Colors from '../constants/Colors';
import Styles from '../constants/Styles';


class InitialLoadingScreen extends React.Component {
  componentDidMount() {
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const oAuth2Data = await Storage.getItem(Storage.Keys.OAUTH2_DATA);
    try {
      if (oAuth2Data) {
        try {
          await this.props.retrieveMe();
        } catch (error) {
          Sentry.captureException(error);
          this.props.navigation.navigate('Auth');
          return;
        }
        const { me } = this.props;
        const isAdmin = me.user.is_admin;
        const isCustomer = me.user.is_customer;
        const isSalesRepresentative = me.user.is_sales_representative;
        if (isAdmin) {
          this.props.navigation.navigate('AdminApp');
        } else if (isCustomer) {
          this.props.navigation.navigate('CustomerApp');
        } else if (isSalesRepresentative) {
          this.props.navigation.navigate('SalesRepApp');
        }
      } else {
        Sentry.captureMessage('NO OAUTH2 DATA IN LOCALSTORAGE', 'error');
        this.props.navigation.navigate('Auth');
      }
    } catch (error) {
      Sentry.captureException(error);
      this.props.navigation.navigate('Auth');
    }

  }

  render() {
    return (
      <View style={[Styles.container, Styles.middleCenter]}>
        <ActivityIndicator animating={true} size='large' color={Colors.tint}/>
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    retrieveMe: () => dispatch(retrieveMe()),
  };
};

const mapStateToProps = (state) => (
  {
    me: state.me,
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(InitialLoadingScreen);

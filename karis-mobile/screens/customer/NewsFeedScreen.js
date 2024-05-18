import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Linking,
} from 'react-native';
import {
  Text,
} from 'react-native-paper';

import { listNewsFeeds } from '../../redux/actions';

import KarisSnackbar from '../../components/KarisSnackbar';
import Colors from '../../constants/Colors';
import Styles from '../../constants/Styles';
import CustomerHeader from '../../components/customer/CustomerHeader';


function Feed({ item, index }) {
  return (
    <View style={[localStyles.feedContainer, { paddingTop: (index == 0) ? 0 : 15 }]}>
      <View style={localStyles.feedHeaderRow}>
        <Image
          style={localStyles.feedThumbnail}
          source={{ uri: item.thumbnail }}
        />
        <View style={localStyles.feedHeaderText}>
          <Text
            style={{ color: Colors.text, fontWeight: 'bold' }}
            onPress={() => (
              item.link
                ? Linking.canOpenURL(item.link)
                    .then((supported) => {
                      if (supported) {
                        return Linking.openURL(item.link);
                      }
                    })
                    .catch()
                : null
            )}
          >
            {item.subject}
          </Text>
          <Text style={{ color: Colors.text }}>
            {item.date_published && new Date(item.date_published).toDateString()}
          </Text>
        </View>
      </View>
      <Text style={{ color: Colors.text }}>
        {item.body}
      </Text>
    </View>
  );
}

class NewsFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      snackbar: {
        message: null,
        visible: null,
      }
    };
  }

  _dismissSnackbar = () => {
    this.setState({ snackbar: { message: null, visible: false } });
  }

  _initialize = async () => {
    this.props.listNewsFeeds();
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
        <CustomerHeader navigation={this.props.navigation} headerTitle='News Feed' previousScreen='ProfitabilityScreen' />
        <View style={[Styles.container, Styles.content]}>
          <FlatList
            data={this.props.newsFeeds.results}
            renderItem={({ item, index }) => <Feed item={item} index={index}/>}
            keyExtractor={(item, index) => String(item.id)}
            onRefresh={() => this._initialize()}
            refreshing={this.props.newsFeeds.loading}
          />
        </View>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  feedContainer: {
    borderBottomColor: Colors.underline,
    borderBottomWidth: .75,
    paddingBottom: 15,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  feedThumbnail: {
    width: 55,
    height: 55,
    marginRight: 15,
  },
  feedHeaderText: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

const mapStateToProps = (state) => (
  {
    newsFeeds: state.newsFeeds,
  }
);

const mapDispatchToProps = (dispatch) => {
  return {
    listNewsFeeds: () => dispatch(listNewsFeeds()),
  };
};



export default connect(mapStateToProps, mapDispatchToProps)(NewsFeed);

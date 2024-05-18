import * as Sentry from 'sentry-expo';
import React from 'react';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';

import AppContainer from './navigation/Navigator';
import NavigationService from './navigation/NavigationService';
import store from './redux/store';

Sentry.init({
  dsn: 'https://52ca853f3e7c47998eccd3986c5af7e9@sentry.io/4375655',
  enableInExpoDevelopment: true,
  debug: true
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
    };
  }

  _enableNetworkDebug() {
    global.XMLHttpRequest = global.originalXMLHttpRequest
      ? global.originalXMLHttpRequest
      : global.XMLHttpRequest;
    global.FormData = global.originalFormData
      ? global.originalFormData
      : global.FormData;

    fetch; // Ensure to get the lazy property

    if (window.__FETCH_SUPPORT__) {
      // it's RNDebugger only to have
      window.__FETCH_SUPPORT__.blob = false;
    } else {
      /*
       * Set __FETCH_SUPPORT__ to false is just work for `fetch`.
       * If you're using another way you can just use the native Blob and remove the `else` statement
       */
      global.Blob = global.originalBlob ? global.originalBlob : global.Blob;
      global.FileReader = global.originalFileReader
        ? global.originalFileReader
        : global.FileReader;
    }
  }

  async componentDidMount() {
    if (__DEV__) {
      this._enableNetworkDebug();
    }
  }

  async _cacheResourcesAsync() {
    await Promise.all([
      Font.loadAsync({
        Roboto: require('./assets/fonts/Roboto-Regular.ttf'),
        RobotoMedium: require('./assets/fonts/Roboto-Medium.ttf'),
        ...Ionicons.font,
      }),
      Asset.loadAsync([
        require('./assets/karis-logo.png'),
        require('./assets/idispense.png'),
      ]),
    ]);
  }

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._cacheResourcesAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      );
    }

    return (
      <ReduxProvider store={store}>
        <PaperProvider>
          <AppContainer
            ref={(navigatorRef) => {
              NavigationService.setTopLevelNavigator(navigatorRef);
            }}
            />
        </PaperProvider>
      </ReduxProvider>
    );
  }
}

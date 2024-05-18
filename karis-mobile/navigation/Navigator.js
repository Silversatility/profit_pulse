import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import InitialLoadingScreen from '../screens/InitialLoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ConfirmPasswordScreen from '../screens/ConfirmPasswordScreen';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import CustomerSettingsScreen from '../screens/customer/CustomerSettingsScreen';
import ProductsInfoScreen from '../screens/admin/ProductsInfoScreen';
import DispenseHistoryScreen from '../screens/admin/DispenseHistoryScreen';
import KarisRevenueScreen from '../screens/admin/KarisRevenueScreen';
import CustomerRevenueScreen from '../screens/admin/CustomerRevenueScreen';
import CalendarScreen from '../screens/admin/CalendarScreen';

import CustomerDashboardScreen from '../screens/customer/CustomerDashboardScreen';
import CustomerNationalScreen from '../screens/customer/CustomerNationalScreen';
import CustomerMyDataScreen from '../screens/customer/CustomerMyDataScreen';
import CustomerDispenseHistoryScreen from '../screens/customer/CustomerDispenseHistoryScreen';
import ProfitabilityScreen from '../screens/customer/ProfitabilityScreen';
import NewsFeedScreen from '../screens/customer/NewsFeedScreen';

import SalesRepDashboardScreen from '../screens/salesRep/SalesRepDashboardScreen';
import SalesRepCustomerRevenueScreen from '../screens/salesRep/SalesRepCustomerRevenueScreen';
import SalesRepCustomerListScreen from '../screens/salesRep/SalesRepCustomerListScreen';

import Colors from '../constants/Colors';
import Icon from '../components/Icon';


const AuthStack = createStackNavigator(
  {
    Login: {
      screen: LoginScreen,
    },
    ForgotPassword: {
      screen: ForgotPasswordScreen,
    },
    ConfirmPassword: {
      screen: ConfirmPasswordScreen,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'Login',
  },
);

const AdminDashboardStack = createStackNavigator(
  {
    AdminDashboard: {
      screen: AdminDashboardScreen,
    },
    AdminSettings: {
      screen: AdminSettingsScreen,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'AdminDashboard',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const ProductsInfoStack = createStackNavigator(
  {
    ProductsInfo: {
      screen: ProductsInfoScreen,
    },
    AdminSettings: {
      screen: AdminSettingsScreen,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'ProductsInfo',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const DispenseHistoryStack = createStackNavigator(
  {
    DispenseHistory: {
      screen: DispenseHistoryScreen,
    },
    AdminSettings: {
      screen: AdminSettingsScreen,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'DispenseHistory',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const KarisRevenueStack = createStackNavigator(
  {
    KarisRevenue: {
      screen: KarisRevenueScreen,
    },
    AdminSettings: {
      screen: AdminSettingsScreen,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'KarisRevenue',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const CustomerRevenueStack = createStackNavigator(
  {
    CustomerRevenue: {
      screen: CustomerRevenueScreen,
    },
    AdminSettings: {
      screen: AdminSettingsScreen,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'CustomerRevenue',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const CalendarStack = createStackNavigator(
  {
    Calendar: {
      screen: CalendarScreen,
    },
    AdminSettings: {
      screen: AdminSettingsScreen,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'Calendar',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const AdminAppNavigator = createBottomTabNavigator(
  {
    Dashboard: {
      screen: AdminDashboardStack,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='home' size={20} color={tintColor} />
        ),
      },
    },
    Products: {
      screen: ProductsInfoStack,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='cube' size={20} color={tintColor} />
        ),
      },
    },
    DispenseHistory: {
      screen: DispenseHistoryStack,
      navigationOptions: {
        tabBarLabel: 'History',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='timer' size={20} color={tintColor} />
        ),
      },
    },
    KarisRevenue: {
      screen: KarisRevenueStack,
      navigationOptions: {
        tabBarLabel: 'Revenue',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='cash' size={20} color={tintColor} />
        ),
      },
    },
    CustomerRevenue: {
      screen: CustomerRevenueStack,
      navigationOptions: {
        tabBarLabel: 'Customers',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='people' size={20} color={tintColor} />
        ),
      },
    },
    Calendar: {
      screen: CalendarStack,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='calendar' size={20} color={tintColor} />
        ),
      },
    },
  },
  {
    initialRouteName: 'Dashboard',
    tabBarOptions: {
      activeTintColor: Colors.navigatorActive,
      inactiveTintColor: Colors.navigatorInactive,
      style: {
        backgroundColor: Colors.tint,
        height: 75,
        padding: 15,
      },
    },
  }
);

const CustomerDashboardStack = createStackNavigator(
  {
    CustomerDashboard: {
      screen: CustomerDashboardScreen,
    },
    CustomerSettings: {
      screen: CustomerSettingsScreen,
    }
  },
  {
    headerMode: 'none',
    initialRouteName: 'CustomerDashboard',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const CustomerNationalDataStack = createStackNavigator(
  {
    CustomerNationalData: {
      screen: CustomerNationalScreen,
    },
    CustomerSettings: {
      screen: CustomerSettingsScreen,
    }
  },
  {
    headerMode: 'none',
    initialRouteName: 'CustomerNationalData',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const CustomerMyDataStack = createStackNavigator(
  {
    CustomerMyData: {
      screen: CustomerMyDataScreen,
    },
    CustomerSettings: {
      screen: CustomerSettingsScreen,
    }
  },
  {
    headerMode: 'none',
    initialRouteName: 'CustomerMyData',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const CustomerDispenseHistoryStack = createStackNavigator(
  {
    CustomerDispenseHistory: {
      screen: CustomerDispenseHistoryScreen,
    },
    CustomerSettings: {
      screen: CustomerSettingsScreen,
    }
  },
  {
    headerMode: 'none',
    initialRouteName: 'CustomerDispenseHistory',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const ProfitabilityStack = createStackNavigator(
  {
    Profitability: {
      screen: ProfitabilityScreen,
    },
    CustomerSettings: {
      screen: CustomerSettingsScreen,
    }
  },
  {
    headerMode: 'none',
    initialRouteName: 'Profitability',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const NewsFeedStack = createStackNavigator(
  {
    NewsFeed: {
      screen: NewsFeedScreen,
    },
    CustomerSettings: {
      screen: CustomerSettingsScreen,
    }
  },
  {
    headerMode: 'none',
    initialRouteName: 'NewsFeed',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const CustomerAppNavigator = createBottomTabNavigator(
  {
    Dashboard: {
      screen: CustomerDashboardStack,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='home' size={20} color={tintColor} />
        ),
      },
    },
    CustomerNationalData: {
      screen: CustomerNationalDataStack,
      navigationOptions: {
        tabBarLabel: 'National',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='star' size={20} color={tintColor} />
        ),
      },
    },
    CustomerMyData: {
      screen: CustomerMyDataStack,
      navigationOptions: {
        tabBarLabel: 'My Data',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='person' size={20} color={tintColor} />
        ),
      },
    },
    CustomerDispenseHistory: {
      screen: CustomerDispenseHistoryStack,
      navigationOptions: {
        tabBarLabel: 'History',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='timer' size={20} color={tintColor} />
        ),
      },
    },
    Profitability: {
      screen: ProfitabilityStack,
      navigationOptions: {
        tabBarLabel: 'Profit',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='trending-up' size={20} color={tintColor} />
        ),
      },
    },
    NewsFeed: {
      screen: NewsFeedStack,
      navigationOptions: {
        tabBarLabel: 'News Feed',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='paper' size={20} color={tintColor} />
        ),
      },
    },
  },
  {
    initialRouteName: 'Dashboard',
    tabBarOptions: {
      activeTintColor: Colors.navigatorActive,
      inactiveTintColor: Colors.navigatorInactive,
      style: {
        backgroundColor: Colors.tint,
        height: 75,
        padding: 15,
      },
    },
  }
);


const SalesRepCustomerRevenueStack = createStackNavigator(
  {
    SalesRepCustomerRevenue: {
      screen: SalesRepCustomerRevenueScreen,
    },
    AdminSettings: {
      screen: AdminSettingsScreen,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'SalesRepCustomerRevenue',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);

const SalesRepCustomerListStack = createStackNavigator(
  {
    SalesRepCustomerList: {
      screen: SalesRepCustomerListScreen,
    },
    AdminSettings: {
      screen: AdminSettingsScreen,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'SalesRepCustomerList',
    navigationOptions: ({ navigation }) => {
      if (navigation.state.index > 0) {
        return { tabBarVisible: false };
      }
    },
  },
);


const SalesRepAppNavigator = createBottomTabNavigator(
  {
    Dashboard: {
      screen: SalesRepDashboardScreen,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='home' size={20} color={tintColor} />
        ),
      },
    },
    SalesRepCustomerRevenue: {
      screen: SalesRepCustomerRevenueStack,
      navigationOptions: {
        tabBarLabel: 'Customer Revenue',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='speedometer' size={20} color={tintColor} />
        ),
      },
    },
    SalesRepCustomerList: {
      screen: SalesRepCustomerListStack,
      navigationOptions: {
        tabBarLabel: 'Customers',
        tabBarIcon: ({ focused, tintColor }) => (
          <Icon name='people' size={20} color={tintColor} />
        ),
      },
    },
  },
  {
    initialRouteName: 'Dashboard',
    tabBarOptions: {
      activeTintColor: Colors.navigatorActive,
      inactiveTintColor: Colors.navigatorInactive,
      style: {
        backgroundColor: Colors.tint,
        height: 75,
        padding: 15,
      },
    },
  }
);

export default createAppContainer(
  createSwitchNavigator(
    {
      InitialLoading: InitialLoadingScreen,
      Auth: AuthStack,
      AdminApp: AdminAppNavigator,
      CustomerApp: CustomerAppNavigator,
      SalesRepApp: SalesRepAppNavigator,
    },
    {
      initialRouteName: 'InitialLoading',
    },
  )
);

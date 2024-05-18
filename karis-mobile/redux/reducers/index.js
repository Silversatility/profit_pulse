import { combineReducers } from 'redux';
import products from './products';
import reports from './reports';
import totalProfits from './totalProfits';
import dispenseHistories from './dispenseHistories';
import minifiedCustomers from './minifiedCustomers';
import karisRevenues from './karisRevenues';
import customerRevenues from './customerRevenues';
import customers from './customers';
import me from './me';
import calendarEvents from './calendarEvents';
import nationalProducts from './nationalProducts';
import myProducts from './myProducts';
import customerProfitabilities from './customerProfitabilities';
import newsFeeds from './newsFeeds';
import { LOGOUT_ME } from '../actions';


const appReducer = combineReducers({
  products,
  reports,
  totalProfits,
  dispenseHistories,
  minifiedCustomers,
  karisRevenues,
  customerRevenues,
  customers,
  me,
  calendarEvents,
  nationalProducts,
  myProducts,
  customerProfitabilities,
  newsFeeds,
});

export default (state, action) => {
  if (action.type === LOGOUT_ME) {
    state = undefined;
  }
  return appReducer(state, action);
};

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import {
  TouchableRipple,
  Text,
  IconButton,
} from 'react-native-paper';
import {
  Table,
  Cell,
  TableWrapper,
} from 'react-native-table-component';

import Icon from '../components/Icon';
import Colors from '../constants/Colors';


export default class KarisTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: this.props.headers,
      spinAnimation: new Animated.Value(0),
    };
  }

  static defaultProps = {
    headers: [],
    payload: {
      count: 0,
      current_page: 1,
      next: null,
      previous: null,
      results: [],
      loading: false,
    },
    api: () => {},
    footerCells: [],
  }

  _resolveProperty = (obj, keyString) => {
    return keyString.split('.')
      .reduce(
        (accumulator, current) => accumulator ? accumulator[current] : null,
        (obj),
      );
  }

  _getPaginationLabel = () => {
    const payload = this.props.payload;
    const PAGE_SIZE = 10;
    let firstItemIndex;
    let lastItemIndex;
    firstItemIndex = (PAGE_SIZE * payload.current_page) - (PAGE_SIZE - 1);
    if (payload.results.length == PAGE_SIZE) {
      lastItemIndex = (PAGE_SIZE * payload.current_page);
    } else {
      lastItemIndex = (PAGE_SIZE * payload.current_page) - (PAGE_SIZE - payload.results.length);
    }
    return `${firstItemIndex} to ${lastItemIndex} of ${payload.count} entries`;
  }

  _resolveSortingKey = (key) => key.replace('.', '__')

  _revertSortingKey = (key) => key.replace('__', '.')

  _toggleSortDirection = (header) => {
    this.setState((state, props) => {
      const headers = this.state.headers.map((stateHeader) => {
        if (stateHeader.key == header.key && stateHeader.sortable) {
          let params = { ...props.payload.params, ordering: null };
          if (! stateHeader.sortDirection || stateHeader.sortDirection == 'ascending') {
            stateHeader.sortDirection = 'descending';
            params.ordering = `-${this._resolveSortingKey(stateHeader.key)}`;
          } else {
            stateHeader.sortDirection = 'ascending';
            params.ordering = `${this._resolveSortingKey(stateHeader.key)}`;
          }
          Animated.timing(state.spinAnimation, {
            toValue: stateHeader.sortDirection === 'ascending' ? 0 : 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
          this.props.api(params);
        } else {
          stateHeader.sortDirection = null;
        }
        return stateHeader;
      });

      return { headers };
    });
  }

  _goToPrevious = () => {
    const params = this.props.payload.params;
    if (parseInt(params.page) > 1) {
      params.page = parseInt(params.page - 1);
    }
    this.props.api(params);
  }

  _goToNext = () => {
    const params = this.props.payload.params;
    params.page = parseInt(params.page) + 1;
    this.props.api(params);
  }

  _initialize = () => {
    const { ordering } = this.props.payload.params;
      if (ordering) {
        let sortingKey = ordering.replace('-', '');
        const direction = (ordering == sortingKey) ? 'ascending' : 'descending';
        const headers = this.props.headers.map((header) => {
          if (header.key == this._revertSortingKey(sortingKey)) {
            header.sortDirection = direction;
            Animated.timing(this.state.spinAnimation, {
              toValue: (
                direction == 'ascending'
                  ? 0
                  : 1
              ),
              duration: 0,
              useNativeDriver: true,
            }).start();
          }
          return header;
        });
        this.setState({ headers });
      }
    }

  componentDidMount() {
    this._initialize();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.headers !== this.props.headers ||
      prevProps.payload.params !== this.props.payload.params
    ) {
      this.setState({ headers: this.props.headers });
      this._initialize();
    }
  }

  render() {
    const spin = this.state.spinAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    return(
      <View>
        <Table borderStyle={{ borderWidth: 1, borderColor: Colors.lightButtonUnderlay }}>
          <TableWrapper style={localStyles.headerRowContainer}>
            {
              this.state.headers.map((header) => (
                <Cell
                  key={header.key}
                  style={{ flex: header.flex || 1 }}
                  data={
                    <TouchableRipple
                      style={localStyles.headerCellContainerContainer}
                      onPress={this._toggleSortDirection.bind(this, header)}
                      rippleColor={Colors.lightButtonUnderlay}
                    >
                      <View style={localStyles.headerCellContainer}>
                        {
                          header.sortable && header.sortDirection &&
                          <Animated.View style={{ justifyContent: 'center', transform: [{ rotate: spin }] }}>
                            <Icon
                              name='arrow-dropdown'
                              color={Colors.tint}
                              size={15}
                              />
                          </Animated.View>
                        }
                        <Text style={localStyles.headerText}>{header.display}</Text>
                      </View>
                    </TouchableRipple>
                  }
                />
              ))
            }
          </TableWrapper>
          {
            this.props.payload.results.length == 0
              ? (
                  <TableWrapper style={{ flexDirection: 'row' }}>
                      <Cell
                        data={
                          <Text style={[localStyles.dataText, { textAlign: 'center' }]}>No Items</Text>
                        }
                      />
                  </TableWrapper>
                )
              : (
                  this.props.payload.results.map((item, index) => (
                    <TableWrapper
                      key={item.id || `cell-item-${index}`}
                      style={{ flexDirection: 'row' }}
                    >
                      {
                        this.state.headers.map((header) => (
                          <Cell
                            key={`${header.key}-${item.id}`}
                            style={{ flex: header.flex || 1 }}
                            data={
                              <Text
                                style={[localStyles.dataText, header.style]}
                                onPress={
                                  header.onPress
                                    ? () => header.onPress(item)
                                    : () => null
                                }
                              >
                                {
                                  header.formatter
                                    ? header.formatter(item[header.key])
                                    : this._resolveProperty(item, header.key)
                                }
                              </Text>
                            }
                          />
                        ))
                      }
                    </TableWrapper>
                  ))
                )
          }
          <TableWrapper style={{ flexDirection: 'row' }}>
            {
              this.props.footerCells.map((element, index) => (
                <Cell key={index} data={element} />
              ))
            }
          </TableWrapper>
        </Table>
        {
          (
            this.props.payload.results.length > 0 &&
            this.props.payload.params.limit !== 0
          ) &&
          <View style={localStyles.paginationContainer}>
            <Text style={localStyles.paginationText}>
              {this._getPaginationLabel()}
            </Text>
            <IconButton
              style={{ margin: 0 }}
              icon={({ size, color }) => (
                <Icon
                  name='arrow-dropleft-circle'
                  color={color}
                  size={size}
                />
              )}
              color={Colors.tint}
              disabled={! this.props.payload.previous}
              onPress={this._goToPrevious}
            />
            <IconButton
              style={{ margin: 0 }}
              icon={({ size, color }) => (
                <Icon
                  name='arrow-dropright-circle'
                  color={color}
                  size={size}
                />
              )}
              color={Colors.tint}
              disabled={! this.props.payload.next}
              onPress={this._goToNext}
            />
          </View>
        }
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  paginationContainer: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerCellContainerContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  headerCellContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  headerRowContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#ffffff',
  },
  paginationText: {
    color: Colors.text,
    fontFamily: 'RobotoMedium',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  headerText: {
    color: Colors.text,
    fontFamily: 'RobotoMedium',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dataText: {
    color: Colors.text,
    fontSize: 11,
    fontFamily: 'Roboto',
    margin: 10,
  },
});

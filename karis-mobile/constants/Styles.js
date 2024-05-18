import { StyleSheet } from 'react-native';

import Colors from './Colors';

const Styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  container: {
    flex: 1,
  },
  scrollableContainer: {
    flexGrow: 1,
  },
  middleCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Snackbar styles
  snackbar: {
    backgroundColor: Colors.tint,
    zIndex: 2,
  },

  // Header styles
  headerContainer: {
    marginTop: 15,
  },
  header: {
    // height: 50,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: Colors.headerTitle,
    fontSize: 25,
    fontFamily: 'RobotoMedium',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerSetting: {
    height: 30,
    width: 30,
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 25,
    backgroundColor: Colors.white,
  },

  // DataTable styles
  dataTableHeaderTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'pink',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  dataTableHeaderTitleText: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  ndc: {
    backgroundColor: '#06edfe',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 2,
    color: Colors.text,
    borderWidth: 2,
    borderColor: '#06edfe',
  },
});

export default Styles;

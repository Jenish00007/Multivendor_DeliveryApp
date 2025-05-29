import { StyleSheet } from 'react-native'
import { scale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    screenBackground: {
      backgroundColor: props !== null ? props.themeBackground : '#FFF'
    },
    mainContentContainer: {
      flex: 1,
      backgroundColor: props !== null ? props.themeBackground : '#FFF'
    },
    searchbar: {
      ...alignment.PBmedium,
      backgroundColor: props != null ? props.main : '#FFF'
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchButton: {
      padding: 8,
      marginRight: 8,
    },
    cartButton: {
      padding: 8,
    },
    divider: {
      height: 1,
      backgroundColor: '#E0E0E0',
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginTop: 12,
      marginBottom: 8,
    },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 8,
      borderRadius: 20,
    },
    activeTab: {
      backgroundColor: '#E8F5E9',
    },
    tabText: {
      color: '#757575',
      fontSize: 14,
    },
    activeTabText: {
      color: '#000',
      fontWeight: '500',
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
    },
    itemHeaderText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#008800',
    },
    storesHeaderText: {
      fontSize: 16,
      color: '#BDBDBD',
    },
    indicator: {
      width: 40,
      height: 3,
      backgroundColor: '#008800',
      marginLeft: 16,
    },
    bottomIndicator: {
      width: 100,
      height: 5,
      backgroundColor: '#E0E0E0',
      borderRadius: 2.5,
      alignSelf: 'center',
      marginBottom: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: 'red',
      fontSize: 16,
    },
    storesList: {
      marginTop: 16,
    }
  })
export default styles

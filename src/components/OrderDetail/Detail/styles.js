import { StyleSheet, Dimensions } from 'react-native'
import { fontStyles } from '../../../utils/fontStyles'
import { scale, verticalScale } from '../../../utils/scaling'
const { width: WIDTH } = Dimensions.get('window')
export default StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    backgroundColor: theme.themeBackground,
  }),
  section: {
    padding: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  itemsContainer: {
    marginTop: scale(10),
  },
  itemRow: (theme) => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: scale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  }),
  itemImageContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(8),
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    marginLeft: scale(15),
    marginRight: scale(10),
  },
  itemPrice: {
    width: scale(80),
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(5),
  },
  totalRow: {
    marginTop: scale(10),
    paddingTop: scale(10),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  line: theme => ({
    height: 1,
    width: '90%',
    backgroundColor: theme.secondaryText
  }),
  chatButton: theme => ({
    paddingVertical: scale(25),
    // paddingHorizontal: scale(100),
    backgroundColor: theme.themeBackground,
    borderRadius: scale(20),
    flexDirection: 'row'
  }),

  orderDetailsContainer: theme => ({
    backgroundColor: theme.themeBackground
  }),
  addressContainer: {
    width: WIDTH - 20
  },
  row: {
    paddingTop: scale(25),
    flexDirection: 'row'
  },
  addressText: { width: '50%', textAlign: 'left' },
  line2: theme => ({
    marginVertical: scale(10),
    backgroundColor: theme.secondaryText,
    height: scale(1),
    width: '100%'
  }),
  chatIcon: theme => ({
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  })
})

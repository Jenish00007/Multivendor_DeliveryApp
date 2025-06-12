import React, { useCallback, useContext, useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import navigationService from './navigationService'
import * as Notifications from 'expo-notifications'
import OrderRequestScreen from '../screens/Delivery_Man/Order'
import OrderDetailsScreen from '../screens/Delivery_Man/OrderDetailsScreen'
import DeliveryTrackingScreen from '../screens/Delivery_Man/DeliveryTrackingScreen'
import Login from '../screens/Login/Login'
import Register from '../screens/Register/Register'
import ForgotPassword from '../screens/ForgotPassword/ForgotPassword'
import SetYourPassword from '../screens/ForgotPassword/SetYourPassword'
import CreateAccount from '../screens/CreateAccount/CreateAccount'
import SideBar from '../components/Sidebar/Sidebar'
import ItemDetail from '../screens/ItemDetail/ItemDetail'
import SaveAddress from '../screens/SaveAddress/SaveAddress'
import RateAndReview from '../screens/RateAndReview/RateAndReview'
import Help from '../screens/Help/Help'
import Profile from '../screens/Profile/Profile'
import Addresses from '../screens/Addresses/Addresses'
import NewAddress from '../screens/NewAddress/NewAddress'
import EditAddress from '../screens/EditAddress/EditAddress'
import FullMap from '../screens/FullMap/FullMap'
import Settings from '../screens/Settings/Settings'
import HelpBrowser from '../screens/HelpBrowser/HelpBrowser'
import About from '../screens/About/About'
import SelectLocation from '../screens/SelectLocation'
import AddNewAddress from '../screens/SelectLocation/AddNewAddress'
import CurrentLocation from '../screens/CurrentLocation'
import MapScreen from '../screens/MapScreen'
import ThemeContext from '../ui/ThemeContext/ThemeContext'
import { theme } from '../utils/themeColors'
import screenOptions from './screenOptions'
import { LocationContext } from '../context/Location'
import EmailOtp from '../screens/Otp/Email/EmailOtp'
import PhoneOtp from '../screens/Otp/Phone/PhoneOtp'
import ForgotPasswordOtp from '../screens/Otp/ForgotPassword/ForgetPasswordOtp'
import PhoneNumber from '../screens/PhoneNumber/PhoneNumber'
import { useApolloClient, gql } from '@apollo/client'
import { myOrders } from '../apollo/queries'
import Menu from '../screens/Menu/Menu'
import useEnvVars from '../../environment'
import * as Sentry from '@sentry/react-native'
import Notification from '../screens/Notification/Notification'
import Options from '../screens/Options/Options'
import TermsAndConditions from '../screens/Policies/TermsAndConditions'
import PrivacyPolicy from '../screens/Policies/PrivacyPolicy'
import RefundPolicy from '../screens/Policies/RefundPolicy'
import CancellationPolicy from '../screens/Policies/CancellationPolicy'
import ShippingPolicy from '../screens/Policies/ShippingPolicy'
import Home from '../screens/Delivery_Man/Home'
import OrderHistoryScreen from '../screens/Delivery_Man/Order_history'
import DeliveryHome from '../screens/Delivery_Man/Home'


const NavigationStack = createStackNavigator()
const MainStack = createStackNavigator()
const SideDrawer = createDrawerNavigator()
const Location = createStackNavigator()

function Drawer() {

 
  return (
    <SideDrawer.Navigator drawerContent={(props) => <SideBar {...props} />}>
      <SideDrawer.Screen
        options={{ headerShown: false }}
        name='NoDrawer'
        component={NoDrawer}
      />
    </SideDrawer.Navigator>
  )
}
function NoDrawer() {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  return (
    <NavigationStack.Navigator
      screenOptions={screenOptions({
        theme: themeContext.ThemeValue,
        headerMenuBackground: currentTheme.headerMenuBackground,
        backColor: currentTheme.headerBackground,
        lineColor: currentTheme.horizontalLine,
        textColor: currentTheme.headerText,
        iconColor: currentTheme.iconColorPink
      })}
    >
   
      <NavigationStack.Screen    options={{ header: () => null }} name='Menu' component={Home} />
      {<NavigationStack.Screen name='ItemDetail' component={ItemDetail} />}
      <NavigationStack.Screen name='Options' component={Profile} />
      <NavigationStack.Screen name='Addresses' component={Addresses} />
      <NavigationStack.Screen name='NewAddress' component={NewAddress} />
      <NavigationStack.Screen name='EditAddress' component={EditAddress} />
      <NavigationStack.Screen name='FullMap' component={FullMap} />
      <NavigationStack.Screen name='Settings' component={Settings} />
      <NavigationStack.Screen options={{ headerShown: false }} name='MyOrders' component={OrderRequestScreen} />
   
      <NavigationStack.Screen name='Help' component={Help} />
      <NavigationStack.Screen name='HelpBrowser' component={HelpBrowser} />
      <NavigationStack.Screen name='MapScreen' component={MapScreen} />
      <NavigationStack.Screen
        name='About'
        component={About}
        options={{ header: () => null }}
      />
      <NavigationStack.Screen name='RateAndReview' component={RateAndReview} />
      {/* Authentication Login */}
      <NavigationStack.Screen name='CreateAccount' component={CreateAccount} />
      <NavigationStack.Screen name='Login' component={Login} />
      <NavigationStack.Screen name='Register' component={Register} />
      <NavigationStack.Screen name='PhoneNumber' component={PhoneNumber} />
      <NavigationStack.Screen
        name='ForgotPassword'
        component={ForgotPassword}
      />
      <NavigationStack.Screen
        name='SetYourPassword'
        component={SetYourPassword}
      />
      <NavigationStack.Screen name='EmailOtp' component={EmailOtp} />
      <NavigationStack.Screen name='PhoneOtp' component={PhoneOtp} />
      <NavigationStack.Screen
        name='ForgotPasswordOtp'
        component={ForgotPasswordOtp}
      />
      <NavigationStack.Screen
        name='SelectLocation'
        component={SelectLocation}
      />
      <NavigationStack.Screen name='AddNewAddress' component={AddNewAddress} />
      <NavigationStack.Screen name='SaveAddress' component={SaveAddress} />
      <NavigationStack.Screen options={{ headerShown: false }} name='OrderHistoryScreen' component={OrderHistoryScreen}/>
      
      <NavigationStack.Screen name='DeliveryTrackingScreen' component={DeliveryTrackingScreen}/>
      <NavigationStack.Screen name='DeliveryHome' component={DeliveryHome}/>
    
      <NavigationStack.Screen name='Notification' component={Notification}/>
      <NavigationStack.Screen name='Profile' component={Options}/>
      <NavigationStack.Screen options={{ headerShown: false }} name='OrderDetailsScreen' component={OrderDetailsScreen}/>
      {/* Policy Screens */}
      <NavigationStack.Screen name='TermsAndConditions' component={TermsAndConditions} />
      <NavigationStack.Screen name='PrivacyPolicy' component={PrivacyPolicy} />
      <NavigationStack.Screen name='RefundPolicy' component={RefundPolicy} />
      <NavigationStack.Screen name='CancellationPolicy' component={CancellationPolicy} />
      <NavigationStack.Screen name='ShippingPolicy' component={ShippingPolicy} />

    </NavigationStack.Navigator>
  )
}

function LocationStack() {
  return (
    <Location.Navigator>
      <Location.Screen
        name='CurrentLocation'
        component={CurrentLocation}
        options={{ header: () => null }}
      />
      <Location.Screen name='SelectLocation' component={SelectLocation} />
      <Location.Screen name='AddNewAddress' component={AddNewAddress} />
      <Location.Screen name='Menu'  options={{ header: () => null }} component={Menu} />
    </Location.Navigator>
  )
}

function AppContainer() {
  const client = useApolloClient()
  const { location } = useContext(LocationContext)
  const { SENTRY_DSN } = useEnvVars()
  const lastNotificationResponse = Notifications.useLastNotificationResponse()
  const handleNotification = useCallback(
    async (response) => {
      const { _id } = response.notification.request.content.data
      const lastNotificationHandledId = await AsyncStorage.getItem(
        '@lastNotificationHandledId'
      )
      await client.query({
        query: gql`
          ${myOrders}
        `,
        fetchPolicy: 'network-only'
      })
      const identifier = response.notification.request.identifier
      if (lastNotificationHandledId === identifier) return
      await AsyncStorage.setItem('@lastNotificationHandledId', identifier)
      navigationService.navigate('OrderDetail', {
        _id
      })
    },
    [lastNotificationResponse]
  )
  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data?.type ===
        'order' &&
      lastNotificationResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      handleNotification(lastNotificationResponse)
    }
  }, [lastNotificationResponse])

  useEffect(() => {
    if (SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
        environment:"development",
        enableInExpoDevelopment: true,
        debug:  true,
        tracesSampleRate: 1.0 // to be changed to 0.2 in production
      })
    }
  }, [SENTRY_DSN])

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={(ref) => {
          navigationService.setGlobalRef(ref)
        }}
      >
        <MainStack.Navigator initialRouteName='Drawer'>
          <MainStack.Screen
            options={{ headerShown: false }}
            name='Drawer'
            component={Drawer}
          />
        </MainStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default Sentry.withProfiler(AppContainer)

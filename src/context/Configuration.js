import React, { useEffect, useState, useContext } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { getConfiguration } from '../apollo/queries'
import { 
  fetchAppConfig, 
  getAllAppConfig,
  getAppColors,
  getAppLogo,
  getAppName,
  getHomepageContent,
  getSocialMediaLinks,
  getContactInfo,
  getBanner,
  getAppIcon,
  getAppNameLowerLetter,
  getAppPackageId,
  getSlug,
  getOwner,
  getVersionCode,
  getProjectId,
  getIsActive,
  getCreatedAt,
  getUpdatedAt,
  getAppId
} from '../services/configService'

const GETCONFIGURATION = gql`
  ${getConfiguration}
`

const ConfigurationContext = React.createContext({})

// Custom hook to use configuration
export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (context === undefined) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

export const ConfigurationProvider = (props) => {
  const [appConfig, setAppConfig] = useState(null);
  const { loading, data, error } = useQuery(GETCONFIGURATION)

  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const config = await fetchAppConfig();
        setAppConfig(config);
      } catch (error) {
        console.error('Error loading app configuration:', error);
      }
    };
    loadAppConfig();
  }, []);

  // Create comprehensive configuration object
  const configuration = {
    // GraphQL configuration data
    ...(loading || error || !data.configuration
      ? {
          currency: 'INR',
          currencySymbol: '₹',
          deliveryRate: 0,
          expoClientID:
            '967541328677-d46sl62t52g5r3o5m0mnl2hpptr242nl.apps.googleusercontent.com',
          androidClientID:
            '967541328677-7264tf7tkdtoufk844rck9mimrve135c.apps.googleusercontent.com',
          iOSClientID:
            '967541328677-nf8h4ou7rhmq9fahs87p057rggo95eah.apps.googleusercontent.com'
        }
      : data.configuration),
    
    // App configuration from API - spread all properties directly
    ...(appConfig ? getAllAppConfig(appConfig) : {}),
    
    // Raw app config for service functions
    config: appConfig,
    
    // Loading state
    loading: loading || !appConfig,
  }

  return (
    <ConfigurationContext.Provider value={configuration}>
      {props.children}
    </ConfigurationContext.Provider>
  )
}

export const ConfigurationConsumer = ConfigurationContext.Consumer
export default ConfigurationContext

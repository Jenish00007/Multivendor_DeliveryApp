import axios from 'axios';
import { API_URL } from '../config/api';


export const fetchAppConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings/config`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch app configuration');
  } catch (error) {
    console.error('Error fetching app configuration:', error);
    throw error;
  }
};

export const getAppColors = (config) => {
  return config?.appColors ;
};

export const getAppLogo = (config) => {
  return config?.logo || '';
};

export const getAppName = (config) => {
  return config?.appName ;
};

export const getAppNameLowerLetter = (config) => {
  return config?.appNameLowerLetter ;
};

export const getAppPackageId = (config) => {
  return config?.appPackageId || 'com.figgo.partner';
};

export const getSlug = (config) => {
  return config?.slug ;
};

export const getOwner = (config) => {
  return config?.owner;
};

export const getVersionCode = (config) => {
  return config?.versionCode;
};

export const getProjectId = (config) => {
  return config?.projectId;
};

export const getIsActive = (config) => {
  return config?.isActive || false;
};

export const getCreatedAt = (config) => {
  return config?.createdAt || '';
};

export const getUpdatedAt = (config) => {
  return config?.updatedAt || '';
};

export const getAppId = (config) => {
  return config?._id || '';
};

export const getHomepageContent = (config) => {
  return config?.homepageContent 
};

export const getSocialMediaLinks = (config) => {
  return config?.socialMediaLinks || {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  };
};

export const getContactInfo = (config) => {
  return config?.contactInfo 
};

export const getContactEmail = (config) => {
  return config?.contactInfo?.email || config?.contactEmail ;
};

export const getContactPhone = (config) => {
  return config?.contactInfo?.phone || config?.contactPhone ;
};

export const getContactAddress = (config) => {
  return config?.contactInfo?.address || config?.contactAddress ;
};

export const getWebsiteUrl = (config) => {
  return config?.websiteUrl ;
};

export const getSupportHours = (config) => {
  return config?.supportHours || '24/7';
};

export const getBanner = (config) => {
  return config?.banner || '';
};

export const getAppIcon = (config) => {
  return config?.appIcon || '';
};

export const getAllAppConfig = (config) => {
  return {
    appName: getAppName(config),
    appNameLowerLetter: getAppNameLowerLetter(config),
    appPackageId: getAppPackageId(config),
    slug: getSlug(config),
    owner: getOwner(config),
    versionCode: getVersionCode(config),
    projectId: getProjectId(config),
    appId: getAppId(config),
    isActive: getIsActive(config),
    
    logo: getAppLogo(config),
    appIcon: getAppIcon(config),
    banner: getBanner(config),
    
    appColors: getAppColors(config),
    
    homepageContent: getHomepageContent(config),
    
    socialMediaLinks: getSocialMediaLinks(config),
    contactInfo: getContactInfo(config),
    
    createdAt: getCreatedAt(config),
    updatedAt: getUpdatedAt(config)
  };
}; 
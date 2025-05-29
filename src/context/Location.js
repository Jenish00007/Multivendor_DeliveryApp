import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { getCurrentLocation } from '../ui/hooks/useLocation'

export const LocationContext = createContext()

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null)
  const [country, setCountry] = useState('IN')
  const [cities, setCities] = useState([])
  const [loadingCountry, setLoadingCountry] = useState(true)
  const [errorCountry, setErrorCountry] = useState('')
  const [zoneId, setZoneId] = useState('[1]')
  const [zoneData, setZoneData] = useState(null)

 


  useEffect(() => {
    const getActiveLocation = async () => {
      try {
        const locationStr = await AsyncStorage.getItem('location')
        if (locationStr) {
          setLocation(JSON.parse(locationStr))
        } else {
          // Try to get current location
          const { coords, error } = await getCurrentLocation()
          if (!error && coords) {
            const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
            const response = await fetch(apiUrl)
            const data = await response.json()
            
            if (!data.error) {
              let address = data.display_name
              if (address.length > 21) {
                address = address.substring(0, 21) + '...'
              }
              
              const newLocation = {
                label: 'currentLocation',
                latitude: coords.latitude,
                longitude: coords.longitude,
                deliveryAddress: address
              }
              setLocation(newLocation)
              await AsyncStorage.setItem('location', JSON.stringify(newLocation))
            }
          } else {
            // Set default location if we can't get current location
            const defaultLocation = {
              label: 'defaultLocation',
              latitude: 28.6139,
              longitude: 77.2090,
              deliveryAddress: 'Delhi, India'
            }
            setLocation(defaultLocation)
            await AsyncStorage.setItem('location', JSON.stringify(defaultLocation))
          }
        }
      } catch (err) {
        console.log(err)
        // Set default location if there's an error
        const defaultLocation = {
          label: 'defaultLocation',
          latitude: 28.6139,
          longitude: 77.2090,
          deliveryAddress: 'Delhi, India'
        }
        setLocation(defaultLocation)
        await AsyncStorage.setItem('location', JSON.stringify(defaultLocation))
      }
    }

    getActiveLocation()
  }, [])

  useEffect(() => {
    if (location) {
      const saveLocation = async () => {
        await AsyncStorage.setItem('location', JSON.stringify(location))
      }

      saveLocation()
    }
  }, [location])

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get('https://api.ipify.org/?format=json')
        const data = response.data

        const ipResponse = await axios.get(`https://ipinfo.io/${data.ip}/json`)
        const countryName = ipResponse.data.country
        setCountry(countryName)
      } catch (error) {
        setErrorCountry(error.message)
        console.error('Error fetching user location:', error)
      } finally {
        setLoadingCountry(false)
      }
    }
    fetchCountry()
  }, [])

  useEffect(() => {
    const fetchCities = async () => {
      if (country) {
        try {
          const citiesResponse = await axios.get(`https://api.example.com/cities/${country}`)
          setCities(citiesResponse.data || [])
        } catch (error) {
          console.error('Error fetching cities:', error)
        }
      }
    }

    if (country && !loadingCountry) {
      fetchCities()
    }
  }, [country, loadingCountry])

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        cities,
        zoneId,
        zoneData
      }}>
      {children}
    </LocationContext.Provider>
  )
}

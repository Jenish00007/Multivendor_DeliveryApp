import React, { useState, useEffect, useContext } from 'react'
import { View, Modal, Pressable, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import TextDefault from '../Text/TextDefault/TextDefault'
import Button from '../Button/Button'
import styles from './styles'
import { alignment } from '../../utils/alignment'
import { ORDER_STATUS_ENUM } from '../../utils/enums'
import { useTranslation } from 'react-i18next'
import { RadioButton } from '../RadioButton/RadioButton'
import AuthContext from '../../context/Auth'

export const CancelModal = ({
  theme,
  modalVisible,
  setModalVisible,
  cancelOrder,
  loading,
  orderStatus,
  orderId
}) => {
  const { t } = useTranslation()
  const [reasons, setReasons] = useState([])
  const [selectedReason, setSelectedReason] = useState(null)
  const [loadingReasons, setLoadingReasons] = useState(false)
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (modalVisible) {
      fetchCancellationReasons()
    } else {
      // Reset state when modal closes
      setSelectedReason(null)
      setReasons([])
    }
  }, [modalVisible])

  const fetchCancellationReasons = async () => {
    try {
      setLoadingReasons(true)
      const headers = {
        'moduleId': '1',
        'zoneId': '[1]',
        'latitude': '23.79354466376145',
        'longitude': '90.41166342794895',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json'
      }

      const response = await fetch(
        'https://6ammart-admin.6amtech.com/api/v1/customer/order/cancellation-reasons?offset=1&limit=30&type=customer',
        {
          method: 'GET',
          headers: headers
        }
      )

      if (!response || !response.ok) {
        const errorData = await response?.json().catch(() => ({}))
        throw new Error(errorData?.message || 'Failed to fetch cancellation reasons')
      }

      const data = await response.json()
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format')
      }

      setReasons(data.data)
      
      if (data.data.length === 0) {
        throw new Error('No cancellation reasons available')
      }

    } catch (error) {
      console.error('Error fetching cancellation reasons:', error)
      Alert.alert(
        'Error',
        error.message || 'Failed to load cancellation reasons. Please try again.',
        [{ 
          text: 'OK',
          onPress: () => setModalVisible()
        }]
      )
    } finally {
      setLoadingReasons(false)
    }
  }

  const handleCancelOrder = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for cancellation')
      return
    }
    cancelOrder(selectedReason.reason)
  }

  const closeModal = () => {
    if (!loading && !loadingReasons) {
      setModalVisible()
    }
  }

  return (
    <Modal animationType="slide" visible={modalVisible} transparent={true}>
      <Pressable style={styles.container(theme)} onPress={closeModal}>
        <Pressable style={styles.modalContainer(theme)} onPress={e => e.stopPropagation()}>
          <View style={{ ...alignment.MBsmall }}>
            <TextDefault H4 bolder textColor={theme.gray900}>
              {t('selectCancellationReasons')}
            </TextDefault>
          </View>

          {loadingReasons ? (
            <View style={{ marginVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : reasons.length > 0 ? (
            <View style={{ marginVertical: 20 }}>
              {reasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 10,
                    paddingVertical: 5
                  }}
                  onPress={() => setSelectedReason(reason)}
                  disabled={loading}
                >
                  <RadioButton
                    selected={selectedReason?.id === reason.id}
                    onPress={() => setSelectedReason(reason)}
                    color={theme.primary}
                    disabled={loading}
                  />
                  <TextDefault
                    style={{ marginLeft: 10, flex: 1 }}
                    H5
                    textColor={loading ? theme.gray400 : theme.gray500}
                  >
                    {reason.reason}
                  </TextDefault>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ marginVertical: 20, alignItems: 'center' }}>
              <TextDefault H5 textColor={theme.gray500}>
                {t('noCancellationReasons')}
              </TextDefault>
            </View>
          )}

          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ ...alignment.MTlarge }}>
              <Button
                text={loading ? t('cancelling') : t('submit')}
                buttonProps={{
                  onPress: handleCancelOrder,
                  disabled: loading || !selectedReason
                }}
                buttonStyles={[
                  styles.cancelButtonContainer(theme),
                  {
                    backgroundColor: theme.red600,
                    opacity: loading || !selectedReason ? 0.7 : 1
                  }
                ]}
                textProps={{ textColor: theme.white }}
                textStyles={{ ...alignment.Pmedium }}
                loading={loading}
              />
            </View>
            <View style={{ ...alignment.MTsmall }}>
              <Button
                text={t('cancel')}
                buttonProps={{ 
                  onPress: closeModal,
                  disabled: loading 
                }}
                buttonStyles={[
                  styles.dismissButtonContainer(theme),
                  loading && { opacity: 0.7 }
                ]}
                textStyles={{
                  ...alignment.Pmedium,
                  color: theme.newIconColor
                }}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

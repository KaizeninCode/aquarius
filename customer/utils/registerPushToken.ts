import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { doc, updateDoc } from 'firebase/firestore'
import { firestore, auth } from '@/FirebaseConfig'

export async function registerPushToken(userId: string) {
    // push tokens only work on real devices, not emulators
    if (!Device.isDevice) {
        console.log('Push notifications require a real device.')
        return
    }

    // request permission
    const {status:existingStatus} = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
        const {status} = await Notifications.getPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== 'granted') {
        console.log('Notifications permissions denied.')
        return
    }

    // Android needs a notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default', importance: Notifications.AndroidImportance.MAX
        })
    }

    // get the token and save it the firestore
    const token = (await Notifications.getExpoPushTokenAsync()).data
    const uid = userId ?? auth().currentUser?.uid
    await firestore().collection('users').doc(uid).update({pushToken: token})
    console.log('Push token saved: ', token)
}
// ========== BUILD COMMAND IS FAILING AFTER REFACTORING FROM FIREBASE SDK TO RNF ==========
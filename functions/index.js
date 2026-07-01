// functions/index.js
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();


// send a push notification via Expo's push API
async function sendPushNotification({token, title, body, data = {}}) {
  if (!token || !token.startsWith('ExponentPushToken')) return

  try {
    await axios.post('https://exp.host/--/api/v2/push/send', {
      to: token,
      title,
      body, data,
      sound: 'default',
    })
  } catch (error) {
    console.error('Push send failed: ', error?.response?.data ?? error.message)
  }
} 


exports.onOrderStatusChange = onDocumentUpdated("orders/{orderId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  const orderId = event.params.orderId


  if (before.status === after.status) return; // no status change, nothing to do

  const prevStatus = before.status
  const newStatus = after.status

  // notify driver - new assignment
  if (prevStatus !== 'assigned' && newStatus === 'assigned' && after.driverId){
    const driverSnap = await db.doc(`users/${after.driverId}`).get()
    const driverToken = driverSnap.data()?.pushToken

    await sendPushNotification({
      token: driverToken,
      title: 'New Delivery Assigned!',
      body: `Deliver to ${after.deliveryAddress?.label} for ${after.customerName}`,
      data: {orderId}
    })

  }

  // notify customer - order confirmed
  if (prevStatus === 'placed' && newStatus === 'confirmed'){
    const customerSnap = await db.doc(`users/${after.customerId}`).get()
    const customerToken = customerSnap.data()?.pushToken

    await sendPushNotification({
      token: customerToken,
      title: 'Order Confirmed',
      body: 'The shop has confirmed your order. A driver will be assigned shortly.',
      data: {orderId}
    })

  }


  // notify customer - driver on the way
  if (prevStatus === 'assigned' && newStatus === 'out_for_delivery'){
    const customerSnap = await db.doc(`users/${after.customerId}`).get()
    const customerToken = customerSnap.data()?.pushToken

    await sendPushNotification({
      token: customerToken,
      title: 'Your water is on the way 🚚', // --> Will be changed to a more accomodating noun for multiple products
      body: `${after.driverName ?? 'Your driver'} is heading to you now.`,
      data: {orderId}
    })

  }


  // notify customer - delivered
  if (prevStatus === 'out_for_delivery' && newStatus === 'delivered'){
    const customerSnap = await db.doc(`users/${after.customerId}`).get()
    const customerToken = customerSnap.data()?.pushToken

    await sendPushNotification({
      token: customerToken,
      title: 'Order Delivered ✅', 
      body: 'Your water has been delivered. Please pick it up outside from the driver.', // --> more accomodative noun later
      data: {orderId}
    })

  }

  // notify driver - assignment cancelled
  if (prevStatus === 'assigned' && newStatus === 'cancelled' && after.driverId){
    const driverSnap = await db.doc(`users/${after.driverId}`).get()
    const driverToken = driverSnap.data()?.pushToken

    await sendPushNotification({
      token: driverToken,
      title: 'Delivery Cancelled ❌', 
      body: 'A delivery assigned to you has been cancelled by the shop.', 
      data: {orderId}
    })

  }


  if (after.status === "assigned" && after.driverId) {
    // TODO: send push notification to driver
  }

  if (after.status === "delivered") {
    // TODO: send push notification to customer
  }
});
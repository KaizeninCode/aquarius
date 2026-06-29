// functions/index.js
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

exports.onOrderStatusChange = onDocumentUpdated("orders/{orderId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (before.status === after.status) return; // no status change, nothing to do

  if (after.status === "assigned" && after.driverId) {
    // TODO: send push notification to driver
  }

  if (after.status === "delivered") {
    // TODO: send push notification to customer
  }
});
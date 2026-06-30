const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require('./serviceAccountKey.json')

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

const products = [
  { name: "1L Bottle", price: 20, unit: "bottle", isActive: true },
  { name: "5L Bottle", price: 50, unit: "bottle", isActive: true },
  { name: "10L Bottle", price: 100, unit: "bottle", isActive: true },
  { name: "20L Bottle", price: 200, unit: "bottle", isActive: true },
];

async function seed() {
  for (const product of products) {
    const ref = await db.collection("products").add(product);
    console.log(`Added ${product.name} with id ${ref.id}`);
  }
  console.log("Done seeding products.");
}

seed();

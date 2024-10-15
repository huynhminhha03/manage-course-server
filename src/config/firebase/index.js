const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Tải file JSON từ Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://manage-courses-18b6c-default-rtdb.firebaseio.com"
});

const db = admin.database();

module.exports = db;

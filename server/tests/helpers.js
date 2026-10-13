// 🧪 test helpers — in-memory MongoDB start/stop (CI lo MONGO_URI_TEST vadutam)
const mongoose = require('mongoose')

let memServer = null

async function startDB() {
  let uri = process.env.MONGO_URI_TEST
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server')
    memServer = await MongoMemoryServer.create()
    uri = memServer.getUri()
  }
  await mongoose.connect(uri, { dbName: `upi_test_${process.pid}` })
}

async function clearDB() {
  const cols = await mongoose.connection.db.collections()
  await Promise.all(cols.map(c => c.deleteMany({})))
}

async function stopDB() {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
  if (memServer) await memServer.stop()
}

module.exports = { startDB, clearDB, stopDB }

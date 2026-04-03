// Script to reset database collections (for testing purposes)
// Usage: node reset-db.js

const mongoose = require("mongoose");

const mongoURL = "mongodb://localhost:27017/NNPTUD-S4";

async function resetDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoURL);
    console.log("✓ Connected to MongoDB\n");

    console.log("📊 Collections before reset:");
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    collections.forEach((col) => console.log(`  - ${col.name}`));
    console.log();

    // Delete users collection
    console.log("🗑️  Deleting users collection...");
    await mongoose.connection.db.dropCollection("users").catch((err) => {
      if (err.code === 26) {
        console.log('⚠️  Collection "users" does not exist');
      } else {
        throw err;
      }
    });
    console.log("✓ Users collection deleted\n");

    console.log("📊 Collections after reset:");
    const collectionsAfter = await mongoose.connection.db
      .listCollections()
      .toArray();
    collectionsAfter.forEach((col) => console.log(`  - ${col.name}`));
    console.log();

    console.log("✅ Database reset complete!");
    console.log("💡 You can now run tests with fresh data\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetDatabase();

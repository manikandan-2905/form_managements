const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://mani:mani123@image-generator.x56ji.mongodb.net/?appName=Image-generator";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    
    // Define schema
    const formSchema = new mongoose.Schema({}, { strict: false, collection: 'form' });
    const Form = mongoose.model('Form', formSchema);
    
    // Test 1: Count documents in collection
    const count = await Form.countDocuments();
    console.log(`📊 Total documents in 'form' collection: ${count}`);
    
    // Test 2: Fetch all documents
    const allDocs = await Form.find().limit(10);
    console.log(`\n📋 Sample documents (first 10):`);
    allDocs.forEach((doc, idx) => {
      console.log(`  ${idx + 1}.`, doc);
    });
    
    // Test 3: Group by category
    if (allDocs.length > 0) {
      const grouped = { milk: [], egg: [], feed: [] };
      allDocs.forEach(item => {
        if (item.category && grouped[item.category]) {
          grouped[item.category].push(item);
        }
      });
      console.log(`\n📊 Grouped by category:`, grouped);
    }
    
    // Test 4: Insert test document
    const testDoc = {
      date: new Date().toISOString().split('T')[0],
      label: 'Test Entry',
      rate: 50,
      qty: 10,
      total: 500,
      category: 'milk'
    };
    
    const saved = await Form.create(testDoc);
    console.log(`\n✅ Test document inserted:`, saved);
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });

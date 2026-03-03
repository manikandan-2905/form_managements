const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// replace with the URI the user provided
const MONGO_URI = "mongodb+srv://mani:mani123@image-generator.x56ji.mongodb.net/?appName=Image-generator";

// middleware
app.use(cors());
app.use(express.json());

// mongoose connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// simple schema/collection called "form". use strict: false so any shape can be stored.
const formSchema = new mongoose.Schema({}, { strict: false, collection: 'form' });
const Form = mongoose.model('Form', formSchema);

// routes
app.get('/api/form', async (req, res) => {
  try {
    const items = await Form.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/form', async (req, res) => {
  try {
    const doc = new Form(req.body);
    const saved = await doc.save();
    console.log('📦 Data saved to DB:', saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Error saving to DB:', err);
    res.status(500).json({ error: err.message, details: err.toString() });
  }
});

// delete a document by id
app.delete('/api/form/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Form.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ error: 'Not found' });
    }
    console.log('🗑️  Deleted from DB:', removed);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting from DB:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Form server running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

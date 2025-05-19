const express = require('express');
const cors = require('cors');
const { Parser } = require('json2csv');
const mongoose = require('mongoose');

const app = express();
const PORT = 8000;
const AUTH_TOKEN = "mySuperSecretToken123!@#";

app.use(cors());
app.use(express.json());

// Connect to MongoDB (replace with your connection string)
mongoose.connect('mongodb://localhost:27017/system_health_monitor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Define Mongoose schema and model
const reportSchema = new mongoose.Schema({
  machine_id: { type: String, required: true, unique: true },
  os: String,
  timestamp: String,
  checks: {
    disk_encryption: Boolean,
    antivirus: Boolean,
    sleep_timeout: Number,
    os_update: String,
  }
});

const Report = mongoose.model('Report', reportSchema);

// POST /report route
app.post('/report', async (req, res) => {
  const authHeader = req.headers['authorization'];
  console.log("Received auth header:", authHeader);
  
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log("Received report data:", req.body);  // <--- Add this line

  const report = req.body;
  if (!report.machine_id) {
    return res.status(400).json({ error: 'Missing machine_id' });
  }

  try {
    // Upsert report in MongoDB
    const savedReport = await Report.findOneAndUpdate(
      { machine_id: report.machine_id },
      report,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ message: 'Report saved successfully', report: savedReport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /machines route with filtering
app.get('/machines', async (req, res) => {
  const osFilter = req.query.os;
  const issuesOnly = req.query.issues === 'true';

  try {
    let query = {};

    if (osFilter) {
      query.os = { $regex: new RegExp(`^${osFilter}$`, 'i') };
    }

    let reports = await Report.find(query).lean();

    if (issuesOnly) {
      reports = reports.filter(r => {
        const c = r.checks || {};
        return !c.disk_encryption || !c.antivirus || (c.sleep_timeout && c.sleep_timeout > 10) || (c.os_update && c.os_update.toLowerCase().includes('outdated'));
      });
    }

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /export route to export CSV
app.get('/export', async (req, res) => {
  try {
    const reports = await Report.find().lean();
    const parser = new Parser();
    const csv = parser.parse(reports);

    res.header('Content-Type', 'text/csv');
    res.attachment('system_reports.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

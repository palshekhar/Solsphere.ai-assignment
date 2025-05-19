import React, { useEffect, useState } from 'react';
import './Report.css';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function Report() {
  const [reports, setReports] = useState([]);

  const fetchReports = () => {
    fetch('http://localhost:8000/machines')
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error("Error fetching reports:", err));
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  // Count OS types (only Windows, Linux, macOS)
  const osCount = reports.reduce((acc, report) => {
    let os = report.os?.toLowerCase();
    if (os.includes("windows")) os = "Windows";
    else if (os.includes("linux")) os = "Linux";
    else if (os.includes("mac")) os = "macOS";
    else return acc; // Skip unknown OS

    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(osCount).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28']; // Windows, Linux, macOS

  return (
    <div className="report-dashboard">
      <div className="report-container">
        <h2>🖥️ System Health Reports</h2>
        <div className="card-grid">
          {reports.map((r, i) => (
            <div key={i} className="report-card">
              <table className="report-table">
                <tbody>
                  <tr><td className="label">Machine ID</td><td>{r.machine_id}</td></tr>
                  <tr><td className="label">OS</td><td>{r.os}</td></tr>
                  <tr><td className="label">Timestamp</td><td>{r.timestamp}</td></tr>
                  <tr>
                    <td className="label">Disk Encryption</td>
                    <td className={r.checks?.disk_encryption ? 'status-true' : 'status-false'}>
                      {r.checks?.disk_encryption ? '✅ Yes' : '❌ No'}
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Antivirus</td>
                    <td className={r.checks?.antivirus ? 'status-true' : 'status-false'}>
                      {r.checks?.antivirus ? '✅ Active' : '❌ Inactive'}
                    </td>
                  </tr>
                  <tr><td className="label">Sleep Timeout</td><td>{r.checks?.sleep_timeout ?? 'N/A'}</td></tr>
                  <tr><td className="label">OS Update</td><td>{r.checks?.os_update}</td></tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <h3>📊 OS Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100}>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Report;

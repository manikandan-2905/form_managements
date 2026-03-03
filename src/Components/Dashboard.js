import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filterMonth, setFilterMonth] = useState('');
  const [db, setDb] = useState({
    milk: [],
    egg: [],
    feed: []
  });

  // Check if user is logged in
  useEffect(() => {
    if (!localStorage.getItem('user')) {
      navigate('/');
    }
  }, [navigate]);

  // Fetch data from backend and group by category
  useEffect(() => {
    fetch('http://localhost:5001/api/form')
      .then(res => res.json())
      .then(data => {
        const grouped = { milk: [], egg: [], feed: [] };
        data.forEach(item => {
          if (item.category && grouped[item.category]) {
            grouped[item.category].push(item);
          }
        });
        setDb(grouped);
      })
      .catch(err => console.error('Failed to fetch dashboard data:', err));
  }, []);

  // Initialize filter to current month
  useEffect(() => {
    const today = new Date();
    setFilterMonth(today.toISOString().slice(0, 7));
  }, []);

  const handleLogout = () => {
    // show confirmation before logging out
    Swal.fire({
      title: 'Logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('user');
        Swal.fire({
          icon: 'success',
          title: 'Logged out successfully',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top'
        }).then(() => {
          navigate('/', { replace: true });
        });
      }
    });
  };

  const calculateMetrics = () => {
    const milkEntries = filterMonth ? db.milk.filter(i => i.date.startsWith(filterMonth)) : db.milk;
    const eggEntries = filterMonth ? db.egg.filter(i => i.date.startsWith(filterMonth)) : db.egg;
    const feedEntries = filterMonth ? db.feed.filter(i => i.date.startsWith(filterMonth)) : db.feed;

    const mQty = milkEntries.reduce((s, i) => s + i.qty, 0);
    const mVal = milkEntries.reduce((s, i) => s + i.total, 0);
    const eQty = eggEntries.reduce((s, i) => s + i.qty, 0);
    const eVal = eggEntries.reduce((s, i) => s + i.total, 0);
    const fQty = feedEntries.reduce((s, i) => s + i.qty, 0);
    const fVal = feedEntries.reduce((s, i) => s + i.total, 0);

    const profit = mVal + eVal;
    const expense = fVal;

    return {
      milk: { qty: mQty, val: mVal },
      egg: { qty: eQty, val: eVal },
      feed: { qty: fQty, val: fVal },
      profit,
      expense,
      net: profit - expense
    };
  };

  const metrics = calculateMetrics();

  const formatCurrency = (num) => {
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="dashboard-app">
      <div className="glass-header text-center">
        <div className="d-flex justify-content-center align-items-center mb-3">
          {/* <h5 className="mb-0 text-white fw-bold">FarmTrack Pro</h5> */}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              position: 'absolute',
              right: '15px',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0'
            }}
          >
            <i className="bi bi-power"></i>
          </button>
        </div>
        <small className="opacity-75 text-uppercase fw-bold d-block">Overview</small>
        <h2 className="fw-bold mb-3">Daily Performance</h2>
        <div>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="modern-input"
            style={{ maxWidth: '160px', width: '100%' }}
          />
        </div>
      </div>

      <div className="container-fluid" style={{ marginTop: '-50px', paddingBottom: '100px' }}>
        <div className="metric-card text-center py-4 mx-3 mx-md-0">
          <span className="text-muted small fw-bold">NET PROFIT</span>
          <h1 className="fw-bold text-primary">₹{formatCurrency(metrics.net)}</h1>
        </div>

        <div className="row g-3 mt-2 px-2 px-md-3">
          <div className="col-6 col-md-6">
            <div className="metric-card text-center py-3">
              <span className="text-muted small fw-bold">PROFIT</span>
              <h2 className="fw-bold text-success">₹{formatCurrency(metrics.profit)}</h2>
            </div>
          </div>
          <div className="col-6 col-md-6">
            <div className="metric-card text-center py-3">
              <span className="text-muted small fw-bold">EXPENSE</span>
              <h2 className="fw-bold text-danger">₹{formatCurrency(metrics.expense)}</h2>
            </div>
          </div>
        </div>

        <div className="row g-3 px-2 px-md-3">
          <div className="col-6 col-md-6">
            <div className="metric-card">
              <div className="icon-circle bg-primary-subtle text-primary">
                <i className="bi bi-droplet-fill"></i>
              </div>
              <h6 className="fw-bold mb-1">Milk</h6>
              <small className="text-muted">{metrics.milk.qty} Ltr</small>
              <div className="fw-bold text-success">₹{formatCurrency(metrics.milk.val)}</div>
            </div>
          </div>
          <div className="col-6 col-md-6">
            <div className="metric-card">
              <div className="icon-circle bg-warning-subtle text-warning">
                <i className="bi bi-egg-fill"></i>
              </div>
              <h6 className="fw-bold mb-1">Eggs</h6>
              <small className="text-muted">{metrics.egg.qty} Pcs</small>
              <div className="fw-bold text-success">₹{formatCurrency(metrics.egg.val)}</div>
            </div>
          </div>
          <div className="col-12">
            <div className="metric-card d-flex justify-content-between align-items-center flex-wrap">
              <div className="d-flex align-items-center mb-2 mb-md-0">
                <div className="icon-circle bg-danger-subtle text-danger mb-0 me-3">
                  <i className="bi bi-truck"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Feed Expense</h6>
                  <small className="text-muted">{metrics.feed.qty} Bags</small>
                </div>
              </div>
              <h5 className="fw-bold text-danger mb-0">₹{formatCurrency(metrics.feed.val)}</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-bar">
        <button
          className="nav-btn active"
          onClick={() => {}}
          title="Dashboard"
        >
          <i className="bi bi-grid-1x2-fill fs-4"></i>
          <br />
          <small className="fw-bold">Home</small>
        </button>
        <button
          className="nav-btn"
          onClick={() => navigate('/logs')}
          title="Logs"
        >
          <i className="bi bi-receipt fs-4"></i>
          <br />
          <small className="fw-bold">Logs</small>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Logs.css';

const Logs = () => {
  const navigate = useNavigate();
  const [db, setDb] = useState({
    milk: [],
    egg: [],
    feed: []
  });

  const [currentCategory, setCurrentCategory] = useState('milk');
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalRate, setModalRate] = useState('65');
  const [modalQty, setModalQty] = useState('');
  const [modalLabel, setModalLabel] = useState('');
  const [modalBatch, setModalBatch] = useState('');
  const [modalSource, setModalSource] = useState('');

  // Check if user is logged in
  useEffect(() => {
    if (!localStorage.getItem('user')) {
      navigate('/');
    }
  }, [navigate]);

  // load data from backend and group by category
  useEffect(() => {
    fetch('http://localhost:5001/api/form')
      .then(res => res.json())
      .then(data => {
        console.log('📥 Fetched data from backend:', data);
        const grouped = { milk: [], egg: [], feed: [] };
        data.forEach(item => {
          if (item.category && grouped[item.category]) {
            grouped[item.category].push(item);
          }
        });
        console.log('📊 Grouped data:', grouped);
        setDb(grouped);
      })
      .catch(err => console.error('Failed to fetch logs:', err));
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

  const calculateSummary = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const monthStr = todayStr.substring(0, 7);
    const mKey = filterDate ? filterDate.substring(0, 7) : monthStr;

    // if no filter, show only today's collection
    const dayKey = filterDate || todayStr;
    const dayVal = db[currentCategory]
      .filter(i => i.date === dayKey)
      .reduce((s, i) => s + i.total, 0);

    const mValLog = db[currentCategory]
      .filter(i => i.date.startsWith(mKey))
      .reduce((s, i) => s + i.total, 0);

    return { dayVal, mValLog };
  };

  const getUnit = () => {
    if (currentCategory === 'milk') return 'Ltr';
    if (currentCategory === 'egg') return 'Pcs';
    return 'Bags';
  };

  const getFilteredList = () => {
    if (filterDate) {
      return db[currentCategory].filter(i => i.date === filterDate);
    }
    return db[currentCategory];
  };

  const formatCurrency = (num) => {
    return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleShowAdd = () => {
    setModalRate(currentCategory === 'egg' ? '7' : currentCategory === 'milk' ? '65' : '1800');
    setModalQty('');
    setModalLabel('');
    setModalBatch('');
    setModalSource('');
    setShowModal(true);
  };

  const handleModalRateChange = () => {
    // When source changes for milk, update rate
    if (currentCategory === 'milk') {
      if (modalSource === 'Society') {
        setModalRate('55');
      } else if (modalSource.startsWith('House') || modalSource === 'Others') {
        setModalRate('60');
      } else {
        setModalRate('');
      }
    }
  };

  useEffect(() => {
    handleModalRateChange();
  }, [modalSource]);

  const calculateTotal = () => {
    const r = parseFloat(modalRate) || 0;
    const q = parseFloat(modalQty) || 0;
    return r * q;
  };

  const handleSave = () => {
    const q = parseFloat(modalQty);
    if (!q) {
      Swal.fire({
        icon: 'warning',
        title: 'Please enter quantity',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top'
      });
      return;
    }

    let labelVal;
    if (currentCategory === 'milk') {
      const batch = modalBatch || '';
      const source = modalSource || '';
      labelVal = batch + (source ? ' - ' + source : '');
      if (!labelVal.trim()) labelVal = 'Unnamed Batch';
    } else {
      labelVal = modalLabel || 'Unnamed Batch';
    }

    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      label: labelVal,
      rate: parseFloat(modalRate),
      qty: q,
      total: calculateTotal(),
      category: currentCategory
    };

    setDb(prev => ({
      ...prev,
      [currentCategory]: [newEntry, ...prev[currentCategory]]
    }));

    // send to backend
    fetch('http://localhost:5001/api/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(data => console.log('✅ Entry saved to DB:', data))
      .catch(err => console.error('❌ Failed to save entry:', err));

    setShowModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Entry Added',
      timer: 1000,
      showConfirmButton: false,
      toast: true,
      position: 'top'
    });
  };

  const handleDelete = (docId) => {
    Swal.fire({
      title: 'Remove entry?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // call backend
        fetch(`http://localhost:5001/api/form/${docId}`, {
          method: 'DELETE'
        })
          .then(res => {
            if (!res.ok) throw new Error('Delete failed');
            // update local state
            setDb(prev => ({
              ...prev,
              [currentCategory]: prev[currentCategory].filter(i => i._id !== docId)
            }));
          })
          .catch(err => console.error('Failed to delete from server:', err));
      }
    });
  };

  const summary = calculateSummary();
  const filteredList = getFilteredList();
  const unit = getUnit();
  const todayStr = new Date().toISOString().split('T')[0];
  const dayLabel = filterDate ? (filterDate === todayStr ? 'Today' : filterDate) : 'Today';

  const headerBgClass = `header-bg-${currentCategory}`;

  return (
    <div className="logs-app">
      <div className="container-fluid mt-4 px-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Inventory Logs</h4>
          {/* <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
            title="Logout"
            style={{width: '40px', padding: '6px 8px'}}
          >
            <i className="bi bi-power fs-5"></i>
          </button> */}
        </div>

        {/* Horizontal Tabs */}
        <div className="horizontal-tabs shadow-sm">
          <button
            className={`tab-item ${currentCategory === 'milk' ? 'active' : ''}`}
            onClick={() => setCurrentCategory('milk')}
          >
            <i className="bi bi-droplet-fill"></i> Milk
          </button>
          <button
            className={`tab-item ${currentCategory === 'egg' ? 'active' : ''}`}
            onClick={() => setCurrentCategory('egg')}
          >
            <i className="bi bi-egg-fill"></i> Eggs
          </button>
          <button
            className={`tab-item ${currentCategory === 'feed' ? 'active' : ''}`}
            onClick={() => setCurrentCategory('feed')}
          >
            <i className="bi bi-truck"></i> Feed
          </button>
        </div>

        {/* Header Container */}
        <div className={`p-4 rounded-4 mb-4 header-container ${headerBgClass}`}>
          <div className="mb-3 d-flex justify-content-center">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="modern-input"
            />
          </div>
          <div className="row text-center">
            <div className="col-6 border-end">
              <small className="text-muted d-block mb-1">{dayLabel}</small>
              <h4 className="fw-bold mb-0">₹{formatCurrency(summary.dayVal)}</h4>
            </div>
            <div className="col-6">
              <small className="text-muted d-block mb-1">Month</small>
              <h4 className="fw-bold mb-0">₹{formatCurrency(summary.mValLog)}</h4>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="product-list mb-5">
          {filteredList.length > 0 ? (
            filteredList.map(item => (
              <div key={item._id} className="entry-card">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-secondary">{new Date(item.date).toLocaleDateString('en-GB')}</span>
                  <div className="d-flex gap-2 align-items-center">
                    <div style={{marginLeft:'135px',marginTop:'10px'}}
                      className={`h5 fw-bold mb-0 ml-10 ${
                        currentCategory === 'feed' ? 'text-danger' : 'text-success'
                      }`}
                    >
                      ₹{item.total.toLocaleString()}
                    </div>
                    <i
                      className="bi bi-trash3 text-danger"
                      style={{ cursor: 'pointer', fontSize: '1.2rem', marginLeft: '0px' ,marginTop:'10px' }}
                      onClick={() => handleDelete(item._id)}
                    ></i>
                  </div>
                </div>
                <h6 className="fw-bold mb-1">{item.label}</h6>
                <small className="text-muted">
                  {item.qty} {unit} × ₹{item.rate}
                </small>
              </div>
            ))
          ) : (
            <p className="text-center p-5 text-muted">No entries yet</p>
          )}
        </div>
      </div>

      {/* Add Button - hidden */}
      <button
        className="btn-add-floating"
        onClick={handleShowAdd}
        title="Add Entry"
        style={{ bottom: '70px' }}
      >
        <i className="bi bi-plus-lg fs-3"></i>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-wrapper">
            <div className="modal-header-custom">
              <h5 className="fw-bold mb-0">Add {currentCategory.toUpperCase()}</h5>
              <button
                className="btn-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <i className="bi bi-x-lg" style={{pointerEvents: 'none'}}></i>
              </button>
            </div>
            <div className="modal-body-custom">
              {currentCategory === 'milk' ? (
                <>
                  <div className="mb-3">
                    <label className="small fw-bold text-muted d-block mb-2">
                      Select Batch
                    </label>
                    <select
                      value={modalBatch}
                      onChange={(e) => setModalBatch(e.target.value)}
                      className="modern-input form-select"
                    >
                      <option value="">Select batch</option>
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold text-muted d-block mb-2">
                      Select Source
                    </label>
                    <select
                      value={modalSource}
                      onChange={(e) => setModalSource(e.target.value)}
                      className="modern-input form-select"
                    >
                      <option value="">Select source</option>
                      <option value="Society">Society</option>
                      <option value="House1">House1</option>
                      <option value="House2">House2</option>
                      <option value="House3">House3</option>
                      <option value="House4">House4</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  <label className="small fw-bold text-muted d-block mb-2">
                    Batch/Vendor Name
                  </label>
                  <input
                    type="text"
                    value={modalLabel}
                    onChange={(e) => setModalLabel(e.target.value)}
                    className="modern-input"
                    placeholder="Batch/Vendor Name"
                  />
                </div>
              )}

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="small fw-bold text-muted">Rate (₹)</label>
                  <input
                    type="number"
                    value={modalRate}
                    onChange={(e) => setModalRate(e.target.value)}
                    className="modern-input"
                  />
                </div>
                <div className="col-6">
                  <label className="small fw-bold text-muted">
                    {currentCategory === 'milk' ? 'Litres' : currentCategory === 'egg' ? 'Pieces' : 'Bags'}
                  </label>
                  <input
                    type="number"
                    value={modalQty}
                    onChange={(e) => setModalQty(e.target.value)}
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="bg-dark text-white p-3 rounded-4 text-center mb-4">
                <h2 className="fw-bold mb-0">₹{formatCurrency(calculateTotal())}</h2>
              </div>

              <button className="btn-premium w-100" onClick={handleSave}>
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bottom-bar">
        <button
          className="nav-btn"
          onClick={() => navigate('/dashboard')}
          title="Dashboard"
        >
          <i className="bi bi-grid-1x2-fill fs-4"></i>
          <br />
          <small className="fw-bold">Home</small>
        </button>
        <button
          className="nav-btn active"
          onClick={() => {}}
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

export default Logs;

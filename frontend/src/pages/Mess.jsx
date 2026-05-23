import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Mess() {
  const { user } = useAuth();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ day: 'Monday', breakfast: '', lunch: '', snacks: '', dinner: '' });

  const fetchMenu = async () => {
    const { data } = await api.get('/mess');
    setMenu(data);
    setLoading(false);
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/mess/${editing._id}`, form);
      } else {
        await api.post('/mess', form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ day: 'Monday', breakfast: '', lunch: '', snacks: '', dinner: '' });
      fetchMenu();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ day: item.day, breakfast: item.breakfast || '', lunch: item.lunch || '', snacks: item.snacks || '', dinner: item.dinner || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu entry?')) return;
    await api.delete(`/mess/${id}`);
    fetchMenu();
  };

  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  if (loading) return <div className="loading"><div className="spinner" />Loading…</div>;

  const orderedMenu = DAYS.map(day => menu.find(m => m.day === day)).filter(Boolean);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Mess Menu</h2>
          <p>Today is <strong>{todayName}</strong></p>
        </div>
        {(user?.role === 'admin' || user?.role === 'warden') && (
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ day: 'Monday', breakfast: '', lunch: '', snacks: '', dinner: '' }); setShowModal(true); }}>
            + Add Menu
          </button>
        )}
      </div>

      {orderedMenu.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
            <h3>No menu configured</h3>
            <p>Add mess menu for the week</p>
          </div>
        </div>
      ) : (
        <div className="mess-grid">
          {orderedMenu.map(item => (
            <div key={item._id} className="mess-day-card" style={{ outline: item.day === todayName ? '2px solid var(--primary)' : 'none' }}>
              <div className="mess-day-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{item.day} {item.day === todayName ? '— Today' : ''}</span>
                {(user?.role === 'admin' || user?.role === 'warden') && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(item)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontSize: 12 }}>Edit</button>
                    <button onClick={() => handleDelete(item._id)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontSize: 12 }}>✕</button>
                  </div>
                )}
              </div>
              <div className="mess-meals">
                {[['Breakfast', item.breakfast], ['Lunch', item.lunch], ['Snacks', item.snacks], ['Dinner', item.dinner]].map(([label, val]) => (
                  <div key={label} className="mess-meal">
                    <span className="meal-label">{label}</span>
                    <span style={{ color: val ? 'var(--text)' : 'var(--text-light)' }}>{val || 'Not set'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Menu' : 'Add Menu'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Day</label>
                  <select className="form-select" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => (
                  <div key={meal} className="form-group">
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>{meal}</label>
                    <input className="form-input" placeholder={`e.g. Poha, Tea`} value={form[meal]}
                      onChange={e => setForm({ ...form, [meal]: e.target.value })} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

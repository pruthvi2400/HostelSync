import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function StatusBadge({ status }) {
  const map = { available: 'badge-success', occupied: 'badge-warning', maintenance: 'badge-danger' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

export default function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allocateRoom, setAllocateRoom] = useState(null);
  const [form, setForm] = useState({ roomNumber: '', floor: 1, type: 'double', capacity: 2, monthlyFee: 5000, amenities: '' });
  const [selectedStudent, setSelectedStudent] = useState('');

  const fetchRooms = async () => {
    const { data } = await api.get('/rooms');
    setRooms(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
    if (user?.role === 'admin' || user?.role === 'warden') {
      api.get('/users/students').then(({ data }) => setStudents(data)).catch(() => {});
    }
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const amenities = form.amenities.split(',').map(a => a.trim()).filter(Boolean);
      await api.post('/rooms', { ...form, amenities });
      setShowModal(false);
      setForm({ roomNumber: '', floor: 1, type: 'double', capacity: 2, monthlyFee: 5000, amenities: '' });
      fetchRooms();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleAllocate = async () => {
    if (!selectedStudent) return;
    try {
      await api.post(`/rooms/${allocateRoom._id}/allocate`, { studentId: selectedStudent });
      setAllocateRoom(null);
      setSelectedStudent('');
      fetchRooms();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleDeallocate = async (roomId, studentId) => {
    if (!confirm('Remove this student from the room?')) return;
    try {
      await api.post(`/rooms/${roomId}/deallocate`, { studentId });
      fetchRooms();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusUpdate = async (room, status) => {
    try {
      await api.put(`/rooms/${room._id}`, { status });
      fetchRooms();
    } catch (err) { alert('Failed to update status'); }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading…</div>;

  const myRoom = user?.role === 'student' ? rooms.find(r => r.occupants?.some(o => o._id === user.id)) : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Rooms</h2>
          <p>
            {user?.role === 'student'
              ? myRoom ? `You are in Room ${myRoom.roomNumber}` : 'No room allocated yet'
              : `${rooms.length} rooms · ${rooms.filter(r => r.status === 'available').length} available`}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Room</button>
        )}
      </div>

      {/* Student view — show only their room */}
      {user?.role === 'student' && (
        myRoom ? (
          <div className="card" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>Room {myRoom.roomNumber}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Floor {myRoom.floor} · {myRoom.type}</div>
              </div>
              <StatusBadge status={myRoom.status} />
            </div>
            <div className="room-details">
              <div className="room-detail-row"><span>Capacity</span><span>{myRoom.occupants?.length} / {myRoom.capacity}</span></div>
              <div className="room-detail-row"><span>Monthly Fee</span><span>₹{myRoom.monthlyFee?.toLocaleString()}</span></div>
              {myRoom.amenities?.length > 0 && (
                <div className="room-detail-row"><span>Amenities</span><span>{myRoom.amenities.join(', ')}</span></div>
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>ROOMMATES</div>
              <div className="room-occupants">
                {myRoom.occupants?.map(o => (
                  <span key={o._id} className="occupant-chip">{o.name}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
              <h3>No room allocated</h3>
              <p>Contact your warden or admin for room allocation</p>
            </div>
          </div>
        )
      )}

      {/* Admin / Warden view */}
      {(user?.role === 'admin' || user?.role === 'warden') && (
        <div className="rooms-grid">
          {rooms.map(room => (
            <div key={room._id} className="room-card">
              <div className="room-card-header">
                <div className="room-number">#{room.roomNumber}</div>
                <StatusBadge status={room.status} />
              </div>
              <div className="room-details">
                <div className="room-detail-row"><span>Floor</span><span>{room.floor}</span></div>
                <div className="room-detail-row"><span>Type</span><span style={{ textTransform: 'capitalize' }}>{room.type}</span></div>
                <div className="room-detail-row"><span>Occupancy</span><span>{room.occupants?.length} / {room.capacity}</span></div>
                <div className="room-detail-row"><span>Fee</span><span>₹{room.monthlyFee?.toLocaleString()}/mo</span></div>
              </div>
              {room.occupants?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>OCCUPANTS</div>
                  <div className="room-occupants">
                    {room.occupants.map(o => (
                      <div key={o._id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="occupant-chip">{o.name}</span>
                        {user?.role === 'admin' && (
                          <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 14, lineHeight: 1 }}
                            onClick={() => handleDeallocate(room._id, o._id)} title="Remove">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {room.occupants?.length < room.capacity && room.status !== 'maintenance' && (
                  <button className="btn btn-outline btn-sm" onClick={() => { setAllocateRoom(room); setSelectedStudent(''); }}>
                    + Allocate
                  </button>
                )}
                {user?.role === 'admin' && room.status !== 'maintenance' && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleStatusUpdate(room, 'maintenance')}>
                    Set Maintenance
                  </button>
                )}
                {user?.role === 'admin' && room.status === 'maintenance' && (
                  <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(room, 'available')}>
                    Mark Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Room</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Room Number</label>
                    <input className="form-input" placeholder="e.g. 101" value={form.roomNumber}
                      onChange={e => setForm({ ...form, roomNumber: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Floor</label>
                    <input type="number" className="form-input" value={form.floor} min={1}
                      onChange={e => setForm({ ...form, floor: +e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, capacity: e.target.value === 'single' ? 1 : e.target.value === 'double' ? 2 : 3 })}>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly Fee (₹)</label>
                    <input type="number" className="form-input" value={form.monthlyFee}
                      onChange={e => setForm({ ...form, monthlyFee: +e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Amenities (comma separated)</label>
                  <input className="form-input" placeholder="WiFi, AC, Attached Bathroom" value={form.amenities}
                    onChange={e => setForm({ ...form, amenities: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Room</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Allocate Modal */}
      {allocateRoom && (
        <div className="modal-overlay" onClick={() => setAllocateRoom(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Allocate Student to Room {allocateRoom.roomNumber}</h3>
              <button className="modal-close" onClick={() => setAllocateRoom(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Student</label>
                <select className="form-select" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                  <option value="">— Select a student —</option>
                  {students.filter(s => !s.room).map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNo || s.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setAllocateRoom(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAllocate} disabled={!selectedStudent}>Allocate</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

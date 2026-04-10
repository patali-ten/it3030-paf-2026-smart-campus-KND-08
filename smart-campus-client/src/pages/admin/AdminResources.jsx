import { useState, useEffect } from 'react';
import { getAllResources, createResource, updateResource, deleteResource } from '../../api/resources';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', resourceCode: '', type: 'LECTURE_HALL',
  capacity: '', location: '', description: '',
  status: 'ACTIVE', availabilityStart: '', availabilityEnd: ''
};

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await getAllResources();
      setResources(res.data);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setForm({
      name: resource.name,
      resourceCode: resource.resourceCode,
      type: resource.type,
      capacity: resource.capacity || '',
      location: resource.location || '',
      description: resource.description || '',
      status: resource.status,
      availabilityStart: resource.availabilityStart || '',
      availabilityEnd: resource.availabilityEnd || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await deleteResource(id);
      toast.success('Resource deleted!');
      fetchResources();
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.resourceCode || !form.type) {
      toast.error('Name, Code and Type are required!');
      return;
    }
    try {
      setSubmitting(true);
      if (editingResource) {
        await updateResource(editingResource.id, form);
        toast.success('Resource updated!');
      } else {
        await createResource(form);
        toast.success('Resource created!');
      }
      setShowForm(false);
      setEditingResource(null);
      setForm(emptyForm);
      fetchResources();
    } catch {
      toast.error('Failed to save resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">Resource Management</h1>
            <p className="text-gray-500 mt-1">Add, edit and manage campus resources</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingResource(null); setForm(emptyForm); }}
            className="bg-[#d4a017] hover:bg-[#b88a14] text-[#1e3a5f] px-6 py-2.5 rounded-xl font-bold transition shadow-md shadow-amber-100"
          >
            + Add Resource
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#1e3a5f]"></div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1e3a5f] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Name</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Code</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Type</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Location</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Capacity</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Availability</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-[#1e3a5f] font-bold">{r.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{r.resourceCode}</td>
                    <td className="px-6 py-4 text-gray-500">{r.type.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-gray-500">{r.location}</td>
                    <td className="px-6 py-4 text-gray-500">{r.capacity || '-'}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {r.availabilityStart && r.availabilityEnd
                        ? `${r.availabilityStart} - ${r.availabilityEnd}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        r.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(r)}
                          className="text-[#1e3a5f] hover:text-[#d4a017] font-bold text-xs transition underline decoration-2 underline-offset-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#1e3a5f]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#1e3a5f] text-2xl font-bold">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-[#1e3a5f] transition">
                <span className="text-2xl font-light">✕</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-widest block mb-2">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e3a5f] outline-none"
                  placeholder="e.g. Lecture Hall 101"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-widest block mb-2">Code *</label>
                  <input
                    value={form.resourceCode}
                    onChange={(e) => setForm({ ...form, resourceCode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e3a5f] outline-none"
                    placeholder="e.g. LH-101"
                  />
                </div>
                <div>
                  <label className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-widest block mb-2">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e3a5f] outline-none"
                  >
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Lab</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="EQUIPMENT">Equipment</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-widest block mb-2">Capacity</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e3a5f] outline-none"
                    placeholder="e.g. 100"
                  />
                </div>
                <div>
                  <label className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-widest block mb-2">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e3a5f] outline-none"
                    placeholder="e.g. Block A"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-widest block mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm resize-none focus:ring-1 focus:ring-[#1e3a5f] outline-none"
                  rows={2}
                  placeholder="Optional details..."
                />
              </div>
              <div>
                <label className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-widest block mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e3a5f] outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-widest block mb-2">From</label>
                  <input
                    type="time"
                    value={form.availabilityStart}
                    onChange={(e) => setForm({ ...form, availabilityStart: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-widest block mb-2">Until</label>
                  <input
                    type="time"
                    value={form.availabilityEnd}
                    onChange={(e) => setForm({ ...form, availabilityEnd: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#1e3a5f] hover:bg-[#162a45] disabled:opacity-50 text-white py-3.5 rounded-xl text-sm font-bold transition shadow-lg shadow-blue-100"
              >
                {submitting ? 'Saving...' : editingResource ? 'Update Resource' : 'Create Resource'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl text-sm font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
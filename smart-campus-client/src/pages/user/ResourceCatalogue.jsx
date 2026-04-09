import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllResources } from '../../api/resources';
import ResourceCard from '../../components/ResourceCard';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function ResourceCatalogue() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);

  // Filter states
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (typeFilter) filters.type = typeFilter;
      if (statusFilter) filters.status = statusFilter;
      if (locationFilter) filters.location = locationFilter;
      if (capacityFilter) filters.minCapacity = capacityFilter;

      const res = await getAllResources(filters);
      setResources(res.data);
    } catch (err) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSearch = () => {
    fetchResources();
  };

  const handleClear = () => {
    setTypeFilter('');
    setStatusFilter('');
    setLocationFilter('');
    setCapacityFilter('');
    setTimeout(() => fetchResources(), 100);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-20">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4 transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">Facilities & Resources</h1>
          <p className="text-slate-400 mt-1">Browse and search available campus resources</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4">🔍 Search & Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="LAB">Lab</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>

            {/* Location Filter */}
            <input
              type="text"
              placeholder="Search by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 
                         rounded-lg px-3 py-2 text-sm"
            />

            {/* Capacity Filter */}
            <input
              type="number"
              placeholder="Min capacity..."
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 
                         rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Search
            </button>
            <button
              onClick={handleClear}
              className="bg-slate-600 hover:bg-slate-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-slate-400 text-sm mb-4">
          Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
        </p>

        {/* Resource Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>No resources found matching your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onClick={setSelectedResource}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-white text-xl font-bold">{selectedResource.name}</h2>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-slate-400 hover:text-white text-xl"
              >✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-slate-300">
                <span className="text-slate-500">Code:</span> {selectedResource.resourceCode}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500">Type:</span> {selectedResource.type.replace('_', ' ')}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500">Location:</span> {selectedResource.location}
              </p>
              {selectedResource.capacity && (
                <p className="text-slate-300">
                  <span className="text-slate-500">Capacity:</span> {selectedResource.capacity}
                </p>
              )}
              {selectedResource.description && (
                <p className="text-slate-300">
                  <span className="text-slate-500">Description:</span> {selectedResource.description}
                </p>
              )}
              <p className="text-slate-300">
                <span className="text-slate-500">Status:</span>{' '}
                <span className={selectedResource.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}>
                  {selectedResource.status}
                </span>
              </p>
              {selectedResource.availabilityStart && (
                <p className="text-slate-300">
                  <span className="text-slate-500">Available:</span>{' '}
                  {selectedResource.availabilityStart} - {selectedResource.availabilityEnd}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedResource(null)}
              className="mt-5 w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
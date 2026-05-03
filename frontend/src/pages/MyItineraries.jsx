import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Plus, Trash2, Calendar, ClipboardList, Sparkles, MapPin, Clock } from 'lucide-react';
import { useRealTime } from '../hooks/useRealTime';
import { offlineDb } from '../utils/indexedDb';
import { toast } from 'react-hot-toast';

const MyItineraries = () => {
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newItinerary, setNewItinerary] = useState({ title: '', startDate: '', endDate: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchItineraries();
    }, []);

    // Live updates for itinerary list
    useRealTime('NOTIFICATION_RECEIVED', (payload) => {
        if (payload.type && payload.type.startsWith('ITINERARY_')) {
            console.log("[Live] Itinerary update received, refreshing list...");
            fetchItineraries();
        }
    });

    useRealTime('ITINERARY_CREATED', () => fetchItineraries());
    useRealTime('ITINERARY_DELETED', () => fetchItineraries());

    const fetchItineraries = async () => {
        try {
            const response = await axiosInstance.get('/itineraries/my');
            setItineraries(response.data);

            // Cache in IndexedDB
            if (response.data && Array.isArray(response.data)) {
                await Promise.all(response.data.map(it => offlineDb.saveItinerary(it)));
            }
        } catch (error) {
            console.error("Failed to fetch itineraries", error);
            // Fallback to IndexedDB
            const cached = await offlineDb.getAllItineraries();
            if (cached && cached.length > 0) {
                setItineraries(cached);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/itineraries', newItinerary);
            toast.success('Itinerary created!');
            setItineraries([response.data, ...itineraries]);
            setShowModal(false);
            setNewItinerary({ title: '', startDate: '', endDate: '' });
            navigate(`/itineraries/${response.data.id}`);
        } catch (error) {
            toast.error('Failed to create itinerary');
            console.error("Failed to create itinerary", error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            await axiosInstance.delete(`/itineraries/${id}`);
            setItineraries(itineraries.filter(i => i.id !== id));
            toast.success('Itinerary deleted');
        } catch (error) {
            toast.error('Failed to delete itinerary');
            console.error("Failed to delete", error);
        }
    };

    return (
        <div className="min-h-screen bg-surface-100 dark:bg-surface-800/50 p-8">
            <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Travel Architect</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight">My Itineraries</h1>
                        <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Syncing Live</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 self-start md:self-end active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Create New Plan
                </button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Opening your map case...</p>
                </div>
            ) : itineraries.length === 0 ? (
                <div className="max-w-xl mx-auto text-center py-20 bg-surface-50 dark:bg-surface-900 rounded-[2.5rem] border-2 border-dashed border-surface-200 dark:border-surface-700 shadow-sm px-8">
                    <div className="bg-blue-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <ClipboardList className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 mb-4">No plans drafted yet</h3>
                    <p className="text-gray-500 mb-10 font-medium">
                        The world is waiting for your signature. Create your first day-by-day adventure and share it with the world.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-surface-900 dark:bg-surface-50 text-white dark:text-surface-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all"
                    >
                        Draft First Adventure
                    </button>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {itineraries.map(itinerary => (
                        <div
                            key={itinerary.id}
                            onClick={() => navigate(`/itineraries/${itinerary.id}`)}
                            className="bg-surface-50 dark:bg-surface-900 p-8 rounded-[2rem] border border-surface-200 dark:border-surface-700 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full active:scale-[0.98]"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
                            
                            <div className="relative z-10 mb-6">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="font-black text-xl text-surface-900 dark:text-surface-100 leading-tight group-hover:text-blue-600 transition-colors">{itinerary.title}</h3>
                                    <ClipboardList className="w-6 h-6 text-gray-200 group-hover:text-blue-500 transition-colors shrink-0" />
                                </div>
                                <div className="mt-4 flex items-center gap-3 text-sm text-gray-400 font-bold uppercase tracking-wider">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    <span>
                                        {new Date(itinerary.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        {' - '}
                                        {new Date(itinerary.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 flex items-center justify-between border-t border-gray-100 dark:border-surface-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-tight border border-blue-100/50">
                                        <Clock className="w-3.5 h-3.5" />
                                        {itinerary.days?.length || 0} Days
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                                        <MapPin className="w-3 h-3" />
                                        Planned
                                    </div>
                                </div>
                                
                                <button
                                    onClick={(e) => handleDelete(itinerary.id, e)}
                                    className="text-gray-300 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-all group/delete z-10"
                                >
                                    <Trash2 className="w-5 h-5 group-hover/delete:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-surface-50 dark:bg-surface-900 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create New Itinerary</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded px-3 py-2"
                                    value={newItinerary.title}
                                    onChange={e => setNewItinerary({ ...newItinerary, title: e.target.value })}
                                    placeholder="e.g. Summer in Pokhara"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded px-3 py-2"
                                        value={newItinerary.startDate}
                                        onChange={e => setNewItinerary({ ...newItinerary, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded px-3 py-2"
                                        value={newItinerary.endDate}
                                        onChange={e => setNewItinerary({ ...newItinerary, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Create Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyItineraries;

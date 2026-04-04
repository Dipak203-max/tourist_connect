import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { PlusIcon, TrashIcon, CalendarIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { offlineDb } from '../utils/indexedDb';

const MyItineraries = () => {
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newItinerary, setNewItinerary] = useState({ title: '', startDate: '', endDate: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchItineraries();
    }, []);

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
            setItineraries([response.data, ...itineraries]);
            setShowModal(false);
            setNewItinerary({ title: '', startDate: '', endDate: '' });
            navigate(`/itineraries/${response.data.id}`);
        } catch (error) {
            console.error("Failed to create itinerary", error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure?")) return;
        try {
            await axiosInstance.delete(`/itineraries/${id}`);
            setItineraries(itineraries.filter(i => i.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Itineraries</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
                >
                    <PlusIcon className="w-5 h-5 mr-1" /> Create New
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : itineraries.length === 0 ? (
                <div className="text-center py-16 bg-surface-50 dark:bg-surface-900 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 mt-6">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">You haven't created any itineraries yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Start planning your dream trip! Organize your days, add activities, and share with friends.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
                    >
                        Create Your First Itinerary
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itineraries.map(itinerary => (
                        <div
                            key={itinerary.id}
                            onClick={() => navigate(`/itineraries/${itinerary.id}`)}
                            className="card p-6 rounded-xl hover:shadow-md cursor-pointer transition relative group hover:border-blue-200"
                        >
                            <div className="absolute top-4 right-4 text-gray-300 group-hover:text-blue-500 transition">
                                <ClipboardIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-800 mb-2 truncate pr-8">{itinerary.title}</h3>
                            <div className="text-sm text-gray-500 mb-4 flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1.5" />
                                <span>{new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}</span>
                            </div>

                            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-4 overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: '0%' }}></div> {/* Placeholder for progress if needed */}
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                                    {itinerary.days?.length || 0} Days
                                </span>
                                <button
                                    onClick={(e) => handleDelete(itinerary.id, e)}
                                    className="text-muted hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition z-10"
                                    title="Delete Itinerary"
                                >
                                    <TrashIcon className="w-5 h-5" />
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

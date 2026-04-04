import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRealTime } from '../hooks/useRealTime';
import axiosInstance from '../api/axiosInstance';
import ActivityCard from '../components/ActivityCard';
import ShareModal from '../components/ShareModal';
import { offlineDb } from '../utils/indexedDb';
import {
    PlusIcon,
    ShareIcon,
    ArrowLeftIcon,
    ClockIcon,
    MapPinIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const AddActivityForm = ({ dayId, initialData, onSave, onCancel, saving }) => {
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            // Parse fallback: "Title - Description @ Location"
            let fullDesc = initialData.description || '';
            let parsedTitle = fullDesc;
            let parsedDesc = '';
            let parsedLoc = '';

            // Try to split by " @ " for location
            const locSplit = fullDesc.split(' @ ');
            if (locSplit.length > 1) {
                parsedLoc = locSplit[locSplit.length - 1];
                fullDesc = locSplit.slice(0, -1).join(' @ ');
            }

            // Try to split by " - " for description
            const descSplit = fullDesc.split(' - ');
            if (descSplit.length > 1) {
                parsedTitle = descSplit[0];
                parsedDesc = descSplit.slice(1).join(' - ');
            } else {
                parsedTitle = fullDesc;
            }

            setTitle(parsedTitle);
            setDescription(parsedDesc);
            setLocation(parsedLoc);
            setTime(initialData.timeSlot || '');
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Activity title is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSave(dayId, { title, time, description, location });
    };

    return (
        <div className="mt-4 bg-surface-50 dark:bg-surface-900 border border-blue-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                <h4 className="text-sm font-semibold text-blue-800">{initialData ? 'Edit Activity' : 'New Activity'}</h4>
                <button
                    onClick={onCancel}
                    className="text-blue-400 hover:text-blue-600 transition"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
                {/* Title */}
                <div>
                    <input
                        type="text"
                        placeholder="Activity Title (e.g., Breakfast, Museum Visit)"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (errors.title) setErrors({ ...errors, title: null });
                        }}
                        autoFocus
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1 ml-1">{errors.title}</p>}
                </div>

                {/* Time & Location Row */}
                <div className="flex space-x-3">
                    <div className="flex-1">
                        <div className="relative">
                            <ClockIcon className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                            <input
                                type="time"
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-[1.5]">
                        <div className="relative">
                            <MapPinIcon className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Location (Optional)"
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <textarea
                        rows="2"
                        placeholder="Additional notes or description..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ItineraryPlanner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [globalSaving, setGlobalSaving] = useState(false); // For top-level saves like title/sharing

    // Activity Form State
    const [activeDayId, setActiveDayId] = useState(null);
    const [addItemMode, setAddItemMode] = useState(false); // True if adding new, False if editing
    const [editingItem, setEditingItem] = useState(null); // Item being edited
    const [activitySaving, setActivitySaving] = useState(false);

    // Share Modal State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Centralized Real-Time Event Handling
    useRealTime('ITINERARY_UPDATED', (payload) => {
        if (payload.itineraryId != id) return;
        setItinerary(prev => ({
            ...prev,
            title: payload.title || prev.title,
            startDate: payload.startDate || prev.startDate,
            endDate: payload.endDate || prev.endDate
        }));
    });

    useRealTime('ACTIVITY_ADDED', (payload) => {
        if (payload.itineraryId != id) return;
        setItinerary(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                days: prev.days.map(day => {
                    if (day.id === payload.dayId) {
                        // Avoid duplicates if added via optimistic update
                        if (day.items.some(i => i.id === payload.item.id)) return day;
                        return { ...day, items: sortItems([...day.items, payload.item]) };
                    }
                    return day;
                })
            };
        });
    });

    useRealTime('ACTIVITY_UPDATED', (payload) => {
        if (payload.itineraryId != id) return;
        setItinerary(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                days: prev.days.map(day => {
                    if (day.id === payload.dayId) {
                        return {
                            ...day,
                            items: sortItems(day.items.map(i => 
                                i.id === payload.item.id ? payload.item : i
                            ))
                        };
                    }
                    return day;
                })
            };
        });
    });

    useRealTime('ACTIVITY_DELETED', (payload) => {
        if (payload.itineraryId != id) return;
        setItinerary(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                days: prev.days.map(day => {
                    if (day.id === payload.dayId) {
                        return {
                            ...day,
                            items: day.items.filter(i => i.id !== payload.itemId)
                        };
                    }
                    return day;
                })
            };
        });
    });

    useEffect(() => {
        fetchItinerary();
    }, [id]);

    const sortItems = (items) => {
        if (!items) return [];
        return items.sort((a, b) => {
            // Sort by Pinned (desc)
            if (a.pinned !== b.pinned) {
                return a.pinned ? -1 : 1;
            }
            // Then by TimeSlot (asc)
            const t1 = a.timeSlot || "";
            const t2 = b.timeSlot || "";
            return t1.localeCompare(t2);
        });
    };

    const fetchItinerary = async () => {
        try {
            const response = await axiosInstance.get(`/itineraries/${id}`);
            const sorted = response.data;
            if (sorted.days) {
                sorted.days.sort((a, b) => a.dayNumber - b.dayNumber);
                // Sort items locally too to ensure instant feedback look correct even before refresh
                sorted.days.forEach(day => {
                    day.items = sortItems(day.items);
                });
            } else {
                sorted.days = [];
            }

            setItinerary(sorted);
            await offlineDb.saveItinerary(sorted);
        } catch (error) {
            console.error("Failed to fetch", error);
            // Offline fallback
            const cached = await offlineDb.getItinerary(id);
            if (cached) {
                setItinerary(cached);
                setError('Offline mode: Showing cached data');
            } else {
                setError('Failed to load itinerary');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleShareClick = async () => {
        // If not shared or no token, share it first to generate token
        if (!itinerary.isShared || !itinerary.shareToken) {
            try {
                setGlobalSaving(true);
                const response = await axiosInstance.post(`/itineraries/${id}/share`);
                // Backend now returns DTO with shareToken
                setItinerary(response.data);
                setIsShareModalOpen(true);
            } catch (error) {
                alert("Failed to initialize sharing");
            } finally {
                setGlobalSaving(false);
            }
        } else {
            setIsShareModalOpen(true);
        }
    };

    const handleAddDay = async () => {
        try {
            setGlobalSaving(true);
            const response = await axiosInstance.post(`/itineraries/${id}/days`);
            setItinerary(response.data);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                alert("Error: " + error.response.data.message);
            } else {
                alert("Failed to add day. Check date range.");
            }
            console.error(error);
        } finally {
            setGlobalSaving(false);
        }
    };

    // Actions
    const openAddActivityForm = (dayId) => {
        setActiveDayId(dayId);
        setAddItemMode(true);
        setEditingItem(null);
    };

    const openEditActivityForm = (dayId, item) => {
        setActiveDayId(dayId);
        setAddItemMode(false);
        setEditingItem(item);
    };

    const closeForm = () => {
        setActiveDayId(null);
        setEditingItem(null);
        setAddItemMode(false);
    };

    const handleDeleteActivity = async (dayId, item) => {
        if (!window.confirm("Delete this activity?")) return;
        try {
            // Optimistic update
            const updatedDays = itinerary.days.map(d => {
                if (d.id === dayId) {
                    return { ...d, items: d.items.filter(i => i.id !== item.id) };
                }
                return d;
            });
            setItinerary({ ...itinerary, days: updatedDays });

            await axiosInstance.delete(`/itineraries/${id}/days/${dayId}/items/${item.id}`);
            // No fetch needed if optimistic succeeded, but good to sync eventually
        } catch (err) {
            alert("Failed to delete activity");
            fetchItinerary(); // Revert
        }
    };

    const handlePinActivity = async (dayId, item) => {
        try {
            const newPinned = !item.pinned;

            // Optimistic update with sorting
            const updatedDays = itinerary.days.map(d => {
                if (d.id === dayId) {
                    const updatedItems = d.items.map(i =>
                        i.id === item.id ? { ...i, pinned: newPinned } : i
                    );
                    return { ...d, items: sortItems(updatedItems) };
                }
                return d;
            });
            setItinerary({ ...itinerary, days: updatedDays });

            // API Call
            await axiosInstance.put(`/itineraries/${id}/days/${dayId}/items/${item.id}`, {
                ...item,
                pinned: newPinned
            });
            // Background fetch to ensure sync
            // fetchItinerary();
        } catch (err) {
            alert("Failed to update pin status");
            fetchItinerary(); // Revert
        }
    };

    const handleSaveActivity = async (dayId, formData) => {
        let compositeDescription = formData.title;
        if (formData.description) compositeDescription += ` - ${formData.description}`;
        if (formData.location) compositeDescription += ` @ ${formData.location}`;

        const timeSlot = formData.time || "TBD";

        setActivitySaving(true);
        try {
            if (addItemMode) {
                // CREATE
                const response = await axiosInstance.post(`/itineraries/${id}/days/${dayId}/items`, {
                    type: 'ACTIVITY',
                    referenceId: null,
                    description: compositeDescription,
                    timeSlot: timeSlot,
                    pinned: false
                });

                // Merge response intelligently or just set it
                // We want to sort the items in the response usually
                const updatedItinerary = response.data;
                if (updatedItinerary.days) {
                    updatedItinerary.days.forEach(d => {
                        if (d.id === dayId) d.items = sortItems(d.items);
                    });
                    // Maintain sorted days order? usually backend returns it right but safe to resort
                    updatedItinerary.days.sort((a, b) => a.dayNumber - b.dayNumber);
                }
                setItinerary(updatedItinerary);
            } else {
                // UPDATE
                await axiosInstance.put(`/itineraries/${id}/days/${dayId}/items/${editingItem.id}`, {
                    ...editingItem,
                    description: compositeDescription,
                    timeSlot: timeSlot,
                    pinned: editingItem.pinned // preserve pin
                });
                // fetchItinerary(); // No longer needed, RealTime system handles sync
            }
            closeForm();
        } catch (error) {
            alert("Failed to save activity");
            console.error(error);
        } finally {
            setActivitySaving(false);
        }
    };

    const handleSaveItinerary = async () => {
        try {
            setGlobalSaving(true);
            const response = await axiosInstance.put(`/itineraries/${id}`, {
                title: itinerary.title,
                startDate: itinerary.startDate,
                endDate: itinerary.endDate
            });
            setItinerary(response.data);
            alert("Changes saved!");
        } catch (error) {
            alert("Failed to save changes");
            console.error(error);
        } finally {
            setGlobalSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-surface-100 dark:bg-surface-800">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="text-muted text-sm">Loading planner...</div>
            </div>
        </div>
    );

    if (!itinerary) return <div className="p-8 text-center text-red-500">{error || "Itinerary not found"}</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                itinerary={itinerary}
            />

            {/* Header */}
            <div className="bg-surface-50 dark:bg-surface-900 border-b px-6 py-4 flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center">
                    <button onClick={() => navigate('/itineraries')} className="mr-4 text-gray-500 hover:text-gray-800 transition">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">{itinerary.title}</h1>
                        <p className="text-sm text-gray-500 font-medium">
                            {new Date(itinerary.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            {' '}-{' '}
                            {new Date(itinerary.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleShareClick}
                        className={`flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition duration-200 ${itinerary.isShared
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'text-gray-600 bg-surface-50 dark:bg-surface-900 border-gray-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                            }`}
                    >
                        <ShareIcon className="w-4 h-4 mr-2" />
                        {itinerary.isShared ? 'Shared' : 'Share'}
                    </button>
                    <button
                        onClick={handleSaveItinerary}
                        disabled={globalSaving}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {globalSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Planner Content */}
            <div className="flex-1 overflow-x-auto p-8 bg-surface-100 dark:bg-surface-800/50">
                <div className="flex space-x-6 pb-4 h-full">
                    {itinerary.days.map((day) => (
                        <div
                            key={day.id}
                            className={`w-80 flex-shrink-0 bg-surface-50 dark:bg-surface-900 rounded-xl shadow-sm border border-gray-200 flex flex-col transition-all duration-300 ${activeDayId === day.id ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                                } max-h-full`}
                        >
                            <div className="p-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded-t-xl sticky top-0 z-10">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-gray-800 text-lg">Day {day.dayNumber}</h3>
                                </div>
                                {day.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{day.notes}</p>}
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {day.items && day.items.length > 0 ? (
                                    day.items.map(item => (
                                        (activeDayId === day.id && editingItem?.id === item.id) ? (
                                            <AddActivityForm
                                                key={item.id}
                                                dayId={day.id}
                                                initialData={item}
                                                onSave={handleSaveActivity}
                                                onCancel={closeForm}
                                                saving={activitySaving}
                                            />
                                        ) : (
                                            <ActivityCard
                                                key={item.id}
                                                item={item}
                                                onEdit={(i) => openEditActivityForm(day.id, i)}
                                                onDelete={(i) => handleDeleteActivity(day.id, i)}
                                                onPin={(i) => handlePinActivity(day.id, i)}
                                            />
                                        )
                                    ))
                                ) : (
                                    activeDayId !== day.id && (
                                        <div className="text-center py-10 px-4">
                                            <div className="text-gray-300 mb-2">
                                                <PlusIcon className="w-8 h-8 mx-auto" />
                                            </div>
                                            <p className="text-sm text-muted font-medium">No activities yet</p>
                                        </div>
                                    )
                                )}

                                {/* Inline Form for NEW Item */}
                                {(activeDayId === day.id && addItemMode) ? (
                                    <AddActivityForm
                                        dayId={day.id}
                                        onSave={handleSaveActivity}
                                        onCancel={closeForm}
                                        saving={activitySaving}
                                    />
                                ) : (
                                    (activeDayId !== day.id || !editingItem) && (
                                        <button
                                            onClick={() => openAddActivityForm(day.id)}
                                            className="w-full py-2.5 mt-2 text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg border border-dashed border-gray-300 hover:border-blue-300 transition-all flex items-center justify-center group"
                                        >
                                            <PlusIcon className="w-4 h-4 mr-2 text-muted group-hover:text-blue-500" />
                                            Add Activity
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}

                    {/* New Day Placeholder */}
                    {(() => {
                        const start = new Date(itinerary.startDate);
                        const end = new Date(itinerary.endDate);
                        const maxDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                        const currentDays = itinerary.days.length;

                        if (currentDays < maxDays) {
                            return (
                                <div
                                    onClick={handleAddDay}
                                    className="w-80 flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer group min-h-[400px]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 border border-gray-200 flex items-center justify-center mb-3 group-hover:bg-blue-100 group-hover:border-blue-200 transition">
                                        <PlusIcon className="w-6 h-6 text-muted group-hover:text-blue-600" />
                                    </div>
                                    <span className="font-medium text-gray-500 group-hover:text-blue-700">Add Day {currentDays + 1}</span>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>
        </div>
    );
};

export default ItineraryPlanner;

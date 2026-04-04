import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon, GlobeAltIcon, PhotoIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { destinationApi } from '../../api/destinationApi';
import { toast } from 'react-hot-toast';

const AdminDestinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        city: '',
        country: '',
        latitude: '',
        longitude: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            const response = await destinationApi.getAllDestinations(0, 50); // Fetch a large enough page for admin list
            setDestinations(response.data.content || []);
        } catch (error) {
            toast.error("Failed to load destinations");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await destinationApi.adminUpdateDestination(editingId, formData);
                toast.success("Destination updated successfully");
                // Update locally
                setDestinations(prev => prev.map(d => d.id === editingId ? { ...d, ...formData } : d));
            } else {
                const response = await destinationApi.adminAddDestination(formData);
                toast.success("Destination added successfully");
                // Append new destination from response (which contains the ID)
                if (response.data) {
                    setDestinations(prev => [...prev, response.data]);
                }
            }
            setIsModalOpen(false);
            resetForm();
            // Removed fetchDestinations() to avoid state override before DB commit visibility
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleEdit = (dest) => {
        setEditingId(dest.id);
        setFormData({
            name: dest.name,
            description: dest.description,
            city: dest.city,
            country: dest.country || '',
            latitude: dest.latitude || '',
            longitude: dest.longitude || '',
            imageUrl: dest.imageUrl
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this destination?")) return;
        try {
            await destinationApi.adminDeleteDestination(id);
            toast.success("Destination deleted");
            // Update locally for instant removal
            setDestinations(prev => prev.filter(d => d.id !== id));
            // Removed fetchDestinations() to strictly rely on local state
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            city: '',
            country: '',
            latitude: '',
            longitude: '',
            imageUrl: ''
        });
        setEditingId(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header section with glassmorphism */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-surface-50 dark:bg-surface-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 shadow-xl shadow-indigo-100/20">
                <div>
                    <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-2">
                        Destination <span className="text-indigo-600">Forge</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Engineer and manage the coordinates of your tourism network.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-gray-200 hover:shadow-indigo-200 hover:-translate-y-1"
                >
                    <PlusIcon className="w-5 h-5" />
                    Forge New Place
                </button>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.isArray(destinations) && destinations.length > 0 ? (
                    destinations.map((dest) => (
                        <div key={dest.id} className="group relative bg-surface-50 dark:bg-surface-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-surface-200 dark:border-surface-700 flex flex-col h-full">
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={dest.imageUrl || 'https://images.unsplash.com/photo-1467226632440-65f0b4957563?auto=format&fit=crop&q=80'}
                                    alt={dest.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(dest)}
                                        className="p-2.5 bg-surface-50 dark:bg-surface-900/90 backdrop-blur-md rounded-xl shadow-lg hover:bg-indigo-600 hover:text-white transition-all duration-300"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dest.id)}
                                        className="p-2.5 bg-surface-50 dark:bg-surface-900/90 backdrop-blur-md rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-all duration-300"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-indigo-100">
                                        {dest.city}
                                    </span>
                                    <span className="bg-surface-100 dark:bg-surface-800 text-gray-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700">
                                        {dest.country || 'N/A'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 mb-4 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                    {dest.name}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-3 mb-6">
                                    {dest.description}
                                </p>

                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center gap-4 text-muted text-xs font-bold uppercase tracking-wider">
                                    <div className="flex items-center gap-1.5">
                                        <MapPinIcon className="w-3.5 h-3.5" />
                                        {dest.latitude?.toFixed(4)}, {dest.longitude?.toFixed(4)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="lg:col-span-3 py-20 bg-surface-50 dark:bg-surface-900/50 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-[2.5rem] text-center">
                        <p className="text-muted font-medium italic">No destinations found in the coordinate forge.</p>
                    </div>
                )}
            </div>

            {/* Creative Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-surface-50 dark:bg-surface-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50">
                            <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100 tracking-tight">
                                {editingId ? 'Refine Coordinate' : 'Forge New Entry'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <XMarkIcon className="w-6 h-6 text-muted" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Place Name</label>
                                    <div className="relative">
                                        <DocumentTextIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                        <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="E.g. Eiffel Tower" className="w-full pl-11 pr-4 py-4 bg-surface-100 dark:bg-surface-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">City</label>
                                    <div className="relative">
                                        <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                        <input required name="city" value={formData.city} onChange={handleInputChange} placeholder="Paris" className="w-full pl-11 pr-4 py-4 bg-surface-100 dark:bg-surface-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Country</label>
                                    <div className="relative">
                                        <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                        <input required name="country" value={formData.country} onChange={handleInputChange} placeholder="France" className="w-full pl-11 pr-4 py-4 bg-surface-100 dark:bg-surface-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Image URL</label>
                                    <div className="relative">
                                        <PhotoIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                        <input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." className="w-full pl-11 pr-4 py-4 bg-surface-100 dark:bg-surface-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Latitude</label>
                                    <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="48.8584" className="w-full px-4 py-4 bg-surface-100 dark:bg-surface-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Longitude</label>
                                    <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="2.2945" className="w-full px-4 py-4 bg-surface-100 dark:bg-surface-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Description</label>
                                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Tell the story of this place..." className="w-full px-4 py-4 bg-surface-100 dark:bg-surface-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium resize-none"></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 hover:shadow-indigo-200">{editingId ? 'Apply Forge' : 'Complete Forge'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDestinations;

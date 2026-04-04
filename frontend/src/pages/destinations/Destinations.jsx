import React, { useState, useEffect } from 'react';
import { destinationApi } from '../../api/destinationApi';
import DestinationCard from '../../components/DestinationCard';
import { MapIcon, MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Destinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const pageSize = 9;

    useEffect(() => {
        const fetchDestinations = async () => {
            setLoading(true);
            try {
                const response = await destinationApi.getAllDestinations(page, pageSize);
                setDestinations(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            } catch (error) {
                console.error("Failed to fetch destinations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDestinations();
    }, [page]);

    const filteredDestinations = destinations.filter(dest =>
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface-50 dark:bg-surface-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/20 shadow-xl shadow-indigo-100/20">
                <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
                            <MapIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">World Explorer</span>
                    </div>
                    <h1 className="text-5xl font-black text-surface-900 dark:text-surface-100 tracking-tight leading-none mb-4">
                        Discover <span className="text-blue-600">Perfect</span> Places
                    </h1>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Explore our curated selection of breathtaking destinations across Nepal and beyond. Every place tells a story, find yours today.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by city or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-surface-50 dark:bg-surface-900 border-2 border-transparent focus:border-blue-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50 transition-all w-full md:w-80 font-medium text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[400px] bg-surface-50 dark:bg-surface-900/50 rounded-3xl animate-pulse border border-surface-200 dark:border-surface-700" />
                    ))}
                </div>
            ) : filteredDestinations.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDestinations.map(dest => (
                            <DestinationCard key={dest.id} destination={dest} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-10">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${page === i
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                                            : 'bg-surface-50 dark:bg-surface-900 text-muted border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="p-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-surface-50 dark:bg-surface-900/50 border-2 border-dashed border-gray-200 rounded-[3rem] py-20 text-center">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FunnelIcon className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 mb-2">No Destinations Found</h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                        We couldn't find any places matching "{searchTerm}". Try adjusting your filters or search term.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Destinations;

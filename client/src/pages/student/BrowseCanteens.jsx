import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import CanteenCard from '../../components/student/CanteenCard'; 
import FilterSidebar from '../../components/student/FilterSidebar';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10m-7 8h4" />
    </svg>
);

const BrowseCanteens = () => {
    const [canteens, setCanteens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ cuisines: [] });

    useEffect(() => {
        const fetchCanteens = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/canteens');
                setCanteens(data);
            } catch (error) {
                toast.error('Could not fetch canteens. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchCanteens();
    }, []);
    
    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
    };

    const filteredCanteens = useMemo(() => {
        return canteens.filter(canteen => {
            const nameMatch = canteen.canteenDetails.canteenName.toLowerCase().includes(searchTerm.toLowerCase());
            const cuisineMatch = activeFilters.cuisines.length === 0 || 
                activeFilters.cuisines.some(cuisine => 
                    canteen.canteenDetails.cuisineTypes?.includes(cuisine)
                );
            return nameMatch && cuisineMatch;
        });
    }, [canteens, searchTerm, activeFilters]);

    const SkeletonCard = () => (
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="w-full h-40 bg-gray-200"></div>
            <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
            </div>
        </div>
    );


    return (
        // FIX: Main container for the new centered layout
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-brand-dark-blue">Browse Canteens</h1>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex justify-center items-center mb-8 gap-4">
                <div className="relative w-full max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search canteens..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#111184]"
                    />
                </div>
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white shadow-sm hover:bg-gray-50"
                >
                    <FilterIcon />
                    Filters
                </button>
            </div>
            
            {/* Canteen Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCanteens.length > 0 ? (
                        filteredCanteens.map(canteen => (
                            <CanteenCard key={canteen._id} canteen={canteen} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500 py-10">No canteens found matching your criteria.</p>
                    )}
                </div>
            )}

            <FilterSidebar 
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApplyFilters={handleApplyFilters}
                canteens={canteens}
            />
        </div>
    );
};

export default BrowseCanteens;


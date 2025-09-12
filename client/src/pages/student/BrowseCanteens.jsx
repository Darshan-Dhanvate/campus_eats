import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import CanteenCard from '../../components/student/CanteenCard'; 

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

    useEffect(() => {
        const fetchCanteens = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/canteens');
                setCanteens(data);
            } catch (error) {
                toast.error('Could not fetch canteens. Please try again.');
                console.error("Fetch Canteens Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCanteens();
    }, []);
    
    const filteredCanteens = canteens.filter(canteen => 
        canteen.canteenDetails.canteenName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SkeletonCard = () => (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-300"></div>
            <div className="p-4">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-full"></div>
            </div>
        </div>
    );


    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brand-dark-blue">Browse Canteens</h1>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="relative w-full sm:w-auto sm:flex-grow mr-0 sm:mr-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search canteens..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green"
                    />
                </div>
                <button className="w-full sm:w-auto mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <FilterIcon />
                    Filters
                </button>
            </div>
            
            {/* Canteen Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCanteens.length > 0 ? (
                        filteredCanteens.map(canteen => (
                            <CanteenCard key={canteen._id} canteen={canteen} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">No canteens found matching your search.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BrowseCanteens;


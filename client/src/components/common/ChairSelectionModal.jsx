import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import LayoutViewer from '../student/LayoutViewer';

const ChairSelectionModal = ({ isOpen, onClose, onConfirm, item, canteen }) => {
  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [canteenLayout, setCanteenLayout] = useState(null);
  const [selectedChairs, setSelectedChairs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && canteen) {
      // Always reload fresh data when modal opens
      loadCanteenLayout();
    }
  }, [isOpen, canteen]);

  // Add ESC key support
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        resetAndClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const loadCanteenLayout = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/canteens/${canteen._id}/layout?t=${Date.now()}`);
      setCanteenLayout(data.layout);
      
      // Also load available slots (with cache-busting timestamp)
      const canteenData = await api.get(`/canteens/${canteen._id}?t=${Date.now()}`);
      const allSlots = canteenData.data.canteenDetails.dailySlots || [];
      console.log('📊 Loaded slots from API (first 3):', allSlots.slice(0, 3).map(s => ({ 
        startTime: s.startTime, 
        availableSeats: s.availableSeats,
        occupiedChairs: s.occupiedChairs 
      })));
      setAvailableSlots(allSlots);
    } catch (error) {
      toast.error("Could not load canteen layout.");
      console.error('Error loading layout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    console.log('🕐 Selected slot:', { startTime: slot.startTime, occupiedChairs: slot.occupiedChairs });
    
    setSelectedSlot(slot);
    
    // Update chair availability based on selected slot
    if (canteenLayout && canteenLayout.chairs) {
      const updatedLayout = { ...canteenLayout };
      updatedLayout.chairs = updatedLayout.chairs.map(chair => {
        const isOccupied = slot.occupiedChairs.includes(chair.chairNumber);
        console.log(`🪑 Chair ${chair.chairNumber} (${typeof chair.chairNumber}): occupied=${isOccupied} (checking in [${slot.occupiedChairs.map(c => `${c}(${typeof c})`).join(', ')}])`);
        return {
          ...chair,
          isOccupied: isOccupied
        };
      });
      console.log('🔴 Chairs marked as occupied:', updatedLayout.chairs.filter(c => c.isOccupied).map(c => c.chairNumber));
      setCanteenLayout(updatedLayout);
    }
    
    setSelectedChairs([]);
    setStep(2);
  };

  const handleChairSelect = (chair) => {
    if (chair.isOccupied) {
      toast.error(`Chair ${chair.chairNumber} is already occupied.`);
      return;
    }

    setSelectedChairs(prev => {
      if (prev.includes(chair.chairNumber)) {
        // Deselect chair
        return prev.filter(id => id !== chair.chairNumber);
      } else {
        // Select chair
        return [...prev, chair.chairNumber];
      }
    });
  };

  const handleConfirm = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot.");
      return;
    }
    
    if (selectedChairs.length === 0) {
      toast.error("Please select at least one chair.");
      return;
    }

    // Pass selected chair IDs instead of seat count
    onConfirm(item, canteen, selectedSlot, selectedChairs);
    resetAndClose();
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setAvailableSlots([]);
      setSelectedSlot(null);
      setSelectedChairs([]);
      setCanteenLayout(null);
    }, 300);
  };

  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      resetAndClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl m-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b relative">
          <h2 className="text-2xl font-bold text-brand-dark-blue pr-10">
            Book a Slot for {item.name}
          </h2>
          <button 
            onClick={resetAndClose} 
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-2xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
          >
            &times;
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading layout...</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Select a Time Slot</h3>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {availableSlots.map(slot => (
                        <button 
                          key={slot.startTime}
                          onClick={() => handleSlotSelect(slot)}
                          className="p-3 border rounded-md text-center text-sm transition-colors hover:bg-blue-50 border-gray-300 flex flex-col"
                        >
                          <span className="font-medium">{slot.startTime}</span>
                          <span className="text-xs text-gray-500 mt-1">
                            {slot.availableChairs?.length || slot.availableSeats || 0} chairs
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No time slots available.</p>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Select Your Chairs - {selectedSlot.startTime}
                    </h3>
                    <button 
                      onClick={() => setStep(1)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      ← Change Time
                    </button>
                  </div>
                  
                  {canteenLayout ? (
                    <LayoutViewer
                      layout={canteenLayout}
                      onChairSelect={handleChairSelect}
                      selectedChairs={selectedChairs}
                    />
                  ) : (
                    <div className="bg-gray-100 p-8 rounded-lg text-center">
                      <p className="text-gray-500">
                        This canteen hasn't set up a visual layout yet. 
                        You can book {selectedSlot.availableSeats} available seats.
                      </p>
                      <div className="mt-4">
                        <input
                          type="number"
                          min="1"
                          max={selectedSlot.availableSeats}
                          defaultValue="1"
                          className="border rounded px-3 py-2 mr-2"
                          onChange={(e) => {
                            // For backward compatibility with old system
                            const count = parseInt(e.target.value);
                            setSelectedChairs(Array.from({length: count}, (_, i) => `legacy_${i + 1}`));
                          }}
                        />
                        <span className="text-sm text-gray-600">seats</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {step === 2 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedChairs.length > 0 ? (
                  <span className="text-green-600 font-medium">
                    {selectedChairs.length} chair{selectedChairs.length > 1 ? 's' : ''} selected
                  </span>
                ) : (
                  <span>Select chairs from the layout above</span>
                )}
              </div>
              <div className="space-x-3">
                <button 
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={selectedChairs.length === 0}
                  className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChairSelectionModal;
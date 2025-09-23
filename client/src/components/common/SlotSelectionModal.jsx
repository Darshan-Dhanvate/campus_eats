import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const SlotSelectionModal = ({ isOpen, onClose, onConfirm, item, canteen }) => {
  const [step, setStep] = useState(1);
  const [seatsNeeded, setSeatsNeeded] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindSlots = async () => {
    if (seatsNeeded < 1) {
      toast.error("Please enter a valid number of seats.");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.get(`/canteens/${canteen._id}`);
      const allSlots = data.canteenDetails.dailySlots || [];
      
      const filteredSlots = allSlots.filter(
        (slot) => slot.availableSeats >= seatsNeeded
      );

      setAvailableSlots(filteredSlots);
      setStep(2);
    } catch (error) {
      toast.error("Could not fetch available slots.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot.");
      return;
    }
    // MODIFIED: Added 'seatsNeeded' to the onConfirm call
    onConfirm(item, canteen, selectedSlot, seatsNeeded);
    resetAndClose();
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
        setStep(1);
        setSeatsNeeded(1);
        setAvailableSlots([]);
        setSelectedSlot(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <h2 className="text-2xl font-bold text-brand-dark-blue mb-4">
          Book a Slot for {item.name}
        </h2>
        
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="seats" className="block text-sm font-medium text-gray-700">
                How many seats do you need?
              </label>
              <input
                type="number"
                id="seats"
                value={seatsNeeded}
                onChange={(e) => setSeatsNeeded(parseInt(e.target.value, 10))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                min="1"
              />
            </div>
            <button onClick={handleFindSlots} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
              {isLoading ? 'Finding...' : 'Find Available Slots'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-gray-600 mb-3">Select a time slot for <strong>{seatsNeeded}</strong> seat(s):</p>
            {availableSlots.length > 0 ? (
                <div className="max-h-60 overflow-y-auto grid grid-cols-3 gap-2 pr-2">
                    {availableSlots.map(slot => (
                        <button 
                            key={slot.startTime}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2 border rounded-md text-center text-sm transition-colors ${selectedSlot?.startTime === slot.startTime ? 'bg-green-500 text-white border-green-500' : 'hover:bg-gray-100 border-gray-300'}`}
                        >
                            {slot.startTime}
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">No slots available with enough seats. Try reducing the number of seats.</p>
            )}
            <div className="mt-6 flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">
                    Back
                </button>
                <button onClick={handleConfirm} disabled={!selectedSlot} className="bg-[green] text-white font-bold py-2 px-5 rounded-lg hover:bg-green-600 disabled:bg-gray-300">
                    Add to Cart
                </button>
            </div>
          </div>
        )}
        
        <button onClick={resetAndClose} className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
      </div>
    </div>
  );
};

export default SlotSelectionModal;
import React, { useState, useEffect } from "react";
import CanvasLayoutDesigner from "../canteen/CanvasLayoutDesigner";
import api from "../../api/axiosConfig";
import toast from "react-hot-toast";

// Helper function to generate time slots in 30-min increments
const generateTimeOptions = () => {
  const options = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const minute = j === 0 ? "00" : "30";
      const period = i < 12 ? "AM" : "PM";
      options.push(`${hour}:${minute} ${period}`);
    }
  }
  return options;
};

const EditProfileModal = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    canteenDetails: {
      canteenName: "",
      canteenAddress: "",
      operatingHours: "",
      numberOfSeats: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [openingTime, setOpeningTime] = useState("9:00 AM");
  const [closingTime, setClosingTime] = useState("5:00 PM");
  const [isLayoutDesignerOpen, setIsLayoutDesignerOpen] = useState(false);
  const [currentLayout, setCurrentLayout] = useState(null);
  const [totalChairs, setTotalChairs] = useState(0);
  const timeOptions = generateTimeOptions();

  useEffect(() => {
    if (user) {
      const details = user.canteenDetails || {};
      const hours = details.operatingHours || "";
      
      if (hours.includes(" - ")) {
        const [open, close] = hours.split(" - ");
        setOpeningTime(open);
        setClosingTime(close);
      } else {
        setOpeningTime("9:00 AM");
        setClosingTime("5:00 PM");
      }

      setFormData({
        name: user.name || "",
        phone: details.phone || user.studentDetails?.phone || "",
        canteenDetails: {
          canteenName: details.canteenName || "",
          canteenAddress: details.canteenAddress || "",
          operatingHours: hours,
          numberOfSeats: details.numberOfSeats || 0,
        },
      });

      // Load existing layout if canteen
      if (user.role === 'canteen') {
        loadLayout();
      }
    }
  }, [user, isOpen]);

  const loadLayout = async () => {
    try {
      const { data } = await api.get('/canteens/layout');
      setCurrentLayout(data.layout);
      setTotalChairs(data.layout?.chairs?.length || 0);
    } catch (error) {
      console.log('No existing layout found or error loading layout');
      setCurrentLayout(null);
      setTotalChairs(0);
    }
  };

  const handleLayoutSave = async (layout) => {
    try {
      await api.put('/canteens/layout', { layout });
      setCurrentLayout(layout);
      setTotalChairs(layout.chairs?.length || 0);
      setIsLayoutDesignerOpen(false);
      toast.success('Layout saved successfully!');
    } catch (error) {
      toast.error('Failed to save layout: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCanteenDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      canteenDetails: {
        ...prev.canteenDetails,
        [name]: value,
      },
    }));
  };

  const handleTimeChange = (time, type) => {
    let newOpeningTime = openingTime;
    let newClosingTime = closingTime;

    if (type === 'open') {
      setOpeningTime(time);
      newOpeningTime = time;
    } else {
      setClosingTime(time);
      newClosingTime = time;
    }
    
    const combinedHours = `${newOpeningTime} - ${newClosingTime}`;
    
    setFormData(prev => ({
      ...prev,
      canteenDetails: {
        ...prev.canteenDetails,
        operatingHours: combinedHours
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg m-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-brand-dark-blue mb-6">
          Edit Profile
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text" name="name" id="name" value={formData.name} onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {user.role === "canteen" && (
              <>
                <hr className="my-4" />
                <div>
                  <label htmlFor="canteenName" className="block text-sm font-medium text-gray-700">
                    Canteen Name
                  </label>
                  <input
                    type="text" name="canteenName" id="canteenName" value={formData.canteenDetails.canteenName} onChange={handleCanteenDetailsChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="canteenAddress" className="block text-sm font-medium text-gray-700">
                    Canteen Address
                  </label>
                  <input
                    type="text" name="canteenAddress" id="canteenAddress" value={formData.canteenDetails.canteenAddress} onChange={handleCanteenDetailsChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Operating Hours
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <select
                      name="openingTime" value={openingTime} onChange={(e) => handleTimeChange(e.target.value, 'open')}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {timeOptions.map(time => <option key={`open-${time}`} value={time}>{time}</option>)}
                    </select>
                    <span className="text-gray-500">to</span>
                    <select
                      name="closingTime" value={closingTime} onChange={(e) => handleTimeChange(e.target.value, 'close')}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {timeOptions.map(time => <option key={`close-${time}`} value={time}>{time}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seating Layout
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Design your canteen's layout with tables and chairs. Each chair will get a unique number for booking.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLayoutDesignerOpen(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                  >
                    Design Layout ({totalChairs} chairs)
                  </button>
                  {totalChairs > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Layout configured with {totalChairs} chairs
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="px-4 py-2 bg-[#111184] text-white rounded-md hover:bg-slate-700 disabled:bg-slate-400 transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Canvas Layout Designer */}
      <CanvasLayoutDesigner
        isOpen={isLayoutDesignerOpen}
        onClose={() => setIsLayoutDesignerOpen(false)}
        onSave={handleLayoutSave}
        initialLayout={currentLayout}
      />
    </div>
  );
};

export default EditProfileModal;
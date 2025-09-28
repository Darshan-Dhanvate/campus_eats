import { User } from '../models/User.model.js';
import cron from 'node-cron';

// Function to reset daily slots (clear all occupiedChairs)
const resetDailySlots = async () => {
  try {
    console.log('Starting daily slot reset...');
    
    // Find all canteens
    const canteens = await User.find({ role: 'canteen' });
    
    let totalUpdated = 0;
    
    for (const canteen of canteens) {
      if (canteen.canteenDetails.dailySlots && canteen.canteenDetails.dailySlots.length > 0) {
        // Reset all slots
        canteen.canteenDetails.dailySlots.forEach(slot => {
          slot.occupiedChairs = [];
          // Restore available chairs from layout
          if (canteen.canteenDetails.canteenLayout && canteen.canteenDetails.canteenLayout.chairs) {
            slot.availableChairs = canteen.canteenDetails.canteenLayout.chairs.map(chair => chair.chairNumber);
            slot.availableSeats = slot.availableChairs.length;
          }
        });
        
        // Clear booking history from layout chairs
        if (canteen.canteenDetails.canteenLayout && canteen.canteenDetails.canteenLayout.chairs) {
          canteen.canteenDetails.canteenLayout.chairs.forEach(chair => {
            chair.bookingHistory = [];
            chair.isOccupied = false;
          });
          canteen.markModified('canteenDetails.canteenLayout');
        }
        
        canteen.markModified('canteenDetails.dailySlots');
        await canteen.save();
        totalUpdated++;
      }
    }
    
    console.log(`Daily slot reset completed. Updated ${totalUpdated} canteens.`);
  } catch (error) {
    console.error('Error during daily slot reset:', error);
  }
};

// Function to reset slots after their time has passed
const resetExpiredSlots = async () => {
  try {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    console.log(`Checking for expired slots at ${currentTime}...`);
    
    const canteens = await User.find({ role: 'canteen' });
    let slotsReset = 0;
    
    for (const canteen of canteens) {
      if (canteen.canteenDetails.dailySlots && canteen.canteenDetails.dailySlots.length > 0) {
        let updated = false;
        
        canteen.canteenDetails.dailySlots.forEach(slot => {
          // Parse slot end time
          const slotEndTime = new Date();
          const [time, period] = slot.endTime.split(' ');
          const [hours, minutes] = time.split(':');
          let hour24 = parseInt(hours);
          if (period === 'PM' && hour24 !== 12) hour24 += 12;
          if (period === 'AM' && hour24 === 12) hour24 = 0;
          slotEndTime.setHours(hour24, parseInt(minutes), 0, 0);
          
          // If slot has ended and has occupied chairs, reset them
          if (now > slotEndTime && slot.occupiedChairs.length > 0) {
            console.log(`Resetting expired slot ${slot.startTime} - ${slot.endTime} for canteen ${canteen.canteenDetails.canteenName}`);
            
            // Move occupied chairs back to available
            slot.availableChairs.push(...slot.occupiedChairs);
            slot.occupiedChairs = [];
            slot.availableSeats = slot.availableChairs.length;
            
            // Update layout chair status
            if (canteen.canteenDetails.canteenLayout && canteen.canteenDetails.canteenLayout.chairs) {
              canteen.canteenDetails.canteenLayout.chairs.forEach(chair => {
                chair.isOccupied = false;
                // Keep booking history for records but mark as completed
                chair.bookingHistory = chair.bookingHistory.map(booking => ({
                  ...booking,
                  completed: true
                }));
              });
              canteen.markModified('canteenDetails.canteenLayout');
            }
            
            updated = true;
            slotsReset++;
          }
        });
        
        if (updated) {
          canteen.markModified('canteenDetails.dailySlots');
          await canteen.save();
        }
      }
    }
    
    if (slotsReset > 0) {
      console.log(`Reset ${slotsReset} expired slots.`);
    }
  } catch (error) {
    console.error('Error during expired slot reset:', error);
  }
};

// Schedule daily reset at midnight
const scheduleDailyReset = () => {
  // Run at 12:00 AM every day
  cron.schedule('0 0 * * *', () => {
    console.log('Running scheduled daily slot reset...');
    resetDailySlots();
  });
  
  console.log('Daily slot reset scheduled for 12:00 AM every day');
};

// Schedule expired slot check every 30 minutes
const scheduleExpiredSlotCheck = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    resetExpiredSlots();
  });
  
  console.log('Expired slot check scheduled every 30 minutes');
};

// Initialize schedulers
const initializeSlotSchedulers = () => {
  scheduleDailyReset();
  scheduleExpiredSlotCheck();
  
  // Run initial check
  resetExpiredSlots();
};

export { resetDailySlots, resetExpiredSlots, initializeSlotSchedulers };
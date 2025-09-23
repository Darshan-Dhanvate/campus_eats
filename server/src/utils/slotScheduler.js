import cron from 'node-cron';
import { User } from '../models/User.model.js';
import { parse, addMinutes, format } from 'date-fns';

/**
 * Daily job to reset the 'availableSeats' for all canteens based on their template.
 */
const dailySlotResetJob = async () => {
  console.log('Running daily slot reset job...');

  // 1. Find all canteens
  const allCanteens = await User.find({ role: 'canteen' });

  // 2. Loop through each canteen and reset its slots
  for (const canteen of allCanteens) {
    const { operatingHours, numberOfSeats, dailySlots } = canteen.canteenDetails;
    if (!operatingHours || !dailySlots || dailySlots.length === 0) continue;

    const baseDate = '2025-01-01';
    const [startTimeStr, endTimeStr] = operatingHours.split(' - ');
    const openTime = parse(`${baseDate} ${startTimeStr}`, 'yyyy-MM-dd h:mm a', new Date());
    const closeTime = parse(`${baseDate} ${endTimeStr}`, 'yyyy-MM-dd h:mm a', new Date());

    // Reset each slot's availability
    for (const slot of dailySlots) {
      const slotStart = parse(`${baseDate} ${slot.startTime}`, 'yyyy-MM-dd h:mm a', new Date());
      const isWithinHours = slotStart >= openTime && slotStart < closeTime;
      slot.availableSeats = isWithinHours ? numberOfSeats : 0;
    }
    
    // Mark the array as modified for Mongoose to detect the change
    canteen.markModified('canteenDetails.dailySlots');
    await canteen.save();
  }
  
  console.log(`Daily slot reset job finished for ${allCanteens.length} canteens.`);
};

// Schedule the job to run every day at 12:05 AM
export const startSlotScheduler = () => {
  cron.schedule('5 0 * * *', dailySlotResetJob, {
    timezone: "Asia/Kolkata" // Use your server's timezone
  });
  console.log('✅ Daily slot reset scheduler started.');
};
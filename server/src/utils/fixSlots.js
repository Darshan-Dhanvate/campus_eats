import { User } from '../models/User.model.js';
import { generateDailySlots } from '../controllers/user.controller.js';

// Function to fix all existing canteens with improper slot generation
const fixAllCanteenSlots = async () => {
  try {
    console.log('🔧 Starting slot regeneration for all canteens...');
    
    const canteens = await User.find({ role: 'canteen' });
    console.log(`Found ${canteens.length} canteens to fix`);
    
    let fixedCount = 0;
    
    for (const canteen of canteens) {
      try {
        console.log(`\n📍 Processing canteen: ${canteen.canteenDetails?.canteenName || canteen.name}`);
        console.log(`   Operating hours: ${canteen.canteenDetails?.operatingHours || 'NOT SET'}`);
        console.log(`   Current slots: ${canteen.canteenDetails?.dailySlots?.length || 0}`);
        
        // Clear existing slots first
        canteen.canteenDetails.dailySlots = [];
        canteen.markModified('canteenDetails.dailySlots');
        
        // Regenerate slots with proper operating hours
        if (canteen.canteenDetails?.operatingHours) {
          canteen.canteenDetails.dailySlots = generateDailySlots(
            canteen.canteenDetails.operatingHours,
            canteen.canteenDetails.canteenLayout
          );
          console.log(`   ✅ Generated ${canteen.canteenDetails.dailySlots.length} new slots`);
        } else {
          console.log(`   ⚠️  No operating hours set, leaving slots empty`);
        }
        
        canteen.markModified('canteenDetails.dailySlots');
        await canteen.save();
        fixedCount++;
        
      } catch (error) {
        console.error(`   ❌ Error fixing canteen ${canteen._id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Slot regeneration complete! Fixed ${fixedCount}/${canteens.length} canteens`);
    
  } catch (error) {
    console.error('❌ Error in slot regeneration:', error);
  }
};

export { fixAllCanteenSlots };
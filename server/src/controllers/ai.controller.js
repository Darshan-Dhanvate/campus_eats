import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Review } from '../models/Review.model.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to handle transient API errors with exponential backoff
const withRetry = async (apiCall, retries = 3, delay = 1000) => {
    try {
        return await apiCall();
    } catch (error) {
        // Only retry on 503 Service Unavailable errors
        if (retries > 0 && error.status === 503) {
            console.log(`Model overloaded. Retrying in ${delay / 1000}s... (${retries} retries left)`);
            await new Promise(res => setTimeout(res, delay));
            return withRetry(apiCall, retries - 1, delay * 2); // Double the delay for the next retry
        }
        // If it's another type of error or retries are exhausted, throw it
        throw error;
    }
};


const getFoodRecommendation = asyncHandler(async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { query, chatHistory } = req.body;

    if (!query) {
        res.status(400);
        throw new Error('Query is required.');
    }

    // 1. Fetch all relevant data from the database
    const canteens = await User.find({ role: 'canteen' }).select('canteenDetails');
    const menuItems = await MenuItem.find({ isAvailable: true }).populate('canteen', 'canteenDetails.canteenName');
    const reviews = await Review.find().limit(50).sort({ createdAt: -1 });

    // 2. Format the data into a comprehensive prompt for the AI
    let context = "You are an expert food recommender for a college campus... (Full context prompt remains the same)";
    // ... (omitted for brevity)
    context += "You are an expert food recommender for a college campus. Your goal is to give personalized, helpful, and specific food recommendations to students based on the data provided.\n\n";
    canteens.forEach(c => {
        context += `- ${c.canteenDetails.canteenName} located at ${c.canteenDetails.canteenAddress}. Currently ${c.canteenDetails.isOpen ? 'Open' : 'Closed'}.\n`;
    });
    context += "\n=== FULL MENU ACROSS ALL CANTEENS ===\n";
    menuItems.forEach(item => {
        context += `- Item: ${item.name}, Price: ₹${item.price}, Category: ${item.category}, Canteen: ${item.canteen.canteenDetails.canteenName}, Description: ${item.description}\n`;
    });
    context += "\n=== RECENT STUDENT REVIEWS ===\n";
    reviews.forEach(review => {
        context += `- A student gave a ${review.rating}/5 rating and said: "${review.comment}"\n`;
    });
    context += "\n=== TASK ===\n";
    context += `Based on all the data above, and the student's conversation history, provide a helpful and friendly recommendation for the following query: "${query}". Be specific, mention menu item names and the canteens they are from. Keep your response concise and conversational.`;


    // 3. Call the Gemini API with the new retry logic
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
        
        let conversationHistory = [...chatHistory];
        if (conversationHistory.length > 0 && conversationHistory[0].from === 'ai') {
            conversationHistory.shift(); 
        }
        
        const history = conversationHistory.map(msg => ({
            role: msg.from === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }],
        }));
        
        const chat = model.startChat({ history });
        
        // Use the retry helper to make the API call more robust
        const result = await withRetry(() => chat.sendMessage(context));
        
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ recommendation: text });

    } catch (error) {
        console.error("Gemini API Error (after retries):", error);
        res.status(500).json({ message: "Failed to get AI recommendation after multiple attempts." });
    }
});

export { getFoodRecommendation };


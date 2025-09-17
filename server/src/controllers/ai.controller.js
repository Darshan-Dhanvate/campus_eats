import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Review } from '../models/Review.model.js';
import { Order } from '../models/Order.model.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper for retrying Gemini API calls
const withRetry = async (apiCall, retries = 3, delay = 1000) => {
    try {
        return await apiCall();
    } catch (error) {
        if (retries > 0 && error.status === 503) {
            console.log(`Model overloaded. Retrying in ${delay / 1000}s...`);
            await new Promise(res => setTimeout(res, delay));
            return withRetry(apiCall, retries - 1, delay * 2);
        }
        throw error;
    }
};

// =======================
// Student Food Recommender
// =======================
const getFoodRecommendation = asyncHandler(async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { query, chatHistory } = req.body;

    if (!query) {
        res.status(400);
        throw new Error('Query is required.');
    }

    const canteens = await User.find({ role: 'canteen' }).select('canteenDetails');
    const menuItems = await MenuItem.find({ isAvailable: true }).populate('canteen', 'canteenDetails.canteenName');
    const reviews = await Review.find().limit(50).sort({ createdAt: -1 });

    let context = "You are an expert food recommender for a college campus. Your goal is to give personalized, helpful, and specific food recommendations to students based on the data provided.\n\n";
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

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        let conversationHistory = [...chatHistory];
        if (conversationHistory.length > 0 && conversationHistory[0].from === 'ai') {
            conversationHistory.shift();
        }

        const history = conversationHistory.map(msg => ({
            role: msg.from === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({ history });
        const result = await withRetry(() => chat.sendMessage(context));
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ recommendation: text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ message: "Failed to get AI recommendation." });
    }
});

// =======================
// Canteen Performance Analysis
// =======================
const getCanteenAnalysis = asyncHandler(async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const canteenId = req.user._id;

    const reviews = await Review.find({ canteen: canteenId }).sort({ createdAt: -1 }).limit(50);
    const orders = await Order.find({ canteen: canteenId, status: 'Completed' }).populate('items.menuItem', 'name');

    let totalPrepTime = 0;
    let ordersWithPrepTime = 0;
    const itemPerformance = {};

    orders.forEach(order => {
        const acceptedEntry = order.statusHistory.find(h => h.status === 'Accepted');
        const readyEntry = order.statusHistory.find(h => h.status === 'Ready');

        if (acceptedEntry && readyEntry) {
            const prepTime = (readyEntry.timestamp - acceptedEntry.timestamp) / (1000 * 60);
            totalPrepTime += prepTime;
            ordersWithPrepTime++;
        }

        order.items.forEach(item => {
            const name = item.menuItem.name;
            if (!itemPerformance[name]) {
                itemPerformance[name] = { count: 0 };
            }
            itemPerformance[name].count += item.quantity;
        });
    });

    const avgPrepTime = ordersWithPrepTime > 0 ? (totalPrepTime / ordersWithPrepTime).toFixed(2) : 0;

    let context = "You are an expert business analyst for a college canteen. Provide a concise, actionable analysis of the canteen's performance.\n\n";
    context += `=== PERFORMANCE DATA ===\n`;
    context += `- Average Preparation Time: ${avgPrepTime} minutes.\n`;

    context += "\n=== POPULAR ITEMS (by quantity sold) ===\n";
    Object.entries(itemPerformance).forEach(([name, data]) => {
        context += `- ${name}: ${data.count} sold.\n`;
    });

    context += "\n=== RECENT STUDENT REVIEWS ===\n";
    reviews.forEach(review => {
        context += `- Rating: ${review.rating}/5, Comment: "${review.comment || 'No comment'}"\n`;
    });

    context += "\n=== TASK ===\n";
    context += "Identify one key strength and one area for improvement. Suggest one actionable tip.";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await withRetry(() => model.generateContent(context));
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ analysis: text });
    } catch (error) {
        console.error("Canteen Analysis Gemini API Error:", error);
        res.status(500).json({ message: "Failed to get AI analysis." });
    }
});

// =======================
// Follow-up Question Handler
// =======================
const getCanteenFollowUp = asyncHandler(async (req, res) => {
    const { history, question } = req.body;

    if (!question) {
        res.status(400);
        throw new Error("Follow-up question is required.");
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let filteredHistory = [...history];
        let initialAnalysis = null;

        if (filteredHistory.length > 0 && filteredHistory[0].from === 'ai') {
            initialAnalysis = filteredHistory[0].text;
            filteredHistory.shift();
        }

        const systemContext = 
            "You are an expert business and menu consultant for a college canteen. " +
            (initialAnalysis ? `Here is your previous performance analysis:\n"${initialAnalysis}"\n\n` : "") +
            "Even if the data has limitations, try to give the canteen owner practical, creative, and helpful advice. " +
            "If asked about new dishes, suggest specific menu items that are generally popular in Indian college canteens, " +
            "taking into account affordability, speed of preparation, and student preferences.";

        const chatHistory = [
            { role: "user", parts: [{ text: systemContext }] },
            ...filteredHistory.map(msg => ({
                role: msg.from === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }))
        ];

        const chat = model.startChat({ history: chatHistory });

        const result = await withRetry(() => chat.sendMessage(question));
        const response = await result.response;
        res.status(200).json({ answer: response.text() });

    } catch (error) {
        console.error("Follow-up Gemini API Error:", error);
        res.status(500).json({ message: "Failed to get follow-up answer." });
    }
});




export { getFoodRecommendation, getCanteenAnalysis, getCanteenFollowUp };

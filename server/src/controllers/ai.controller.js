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

    // Fetch only textual fields needed (exclude image or binary heavy data)
    const canteens = await User.find({ role: 'canteen' }).select('canteenDetails.canteenName canteenDetails.canteenAddress canteenDetails.isOpen');
    const menuItems = await MenuItem.find({ isAvailable: true })
        .select('name price category description canteen')
        .populate('canteen', 'canteenDetails.canteenName');
    const reviews = await Review.find().limit(50).sort({ createdAt: -1 }).select('rating comment');

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
        console.log('[AI][recommend] context characters:', context.length);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        console.error("[AI][recommend] Gemini API Error:", error?.message, error?.response?.status);
        res.status(500).json({ message: "Failed to get AI recommendation.", error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
});

// =======================
// Canteen Performance Analysis
// =======================
// =======================
// Canteen Performance Analysis (Fixed)
// =======================
const getCanteenAnalysis = asyncHandler(async (req, res) => {
    let stage = 'init';
    try {
        const canteenId = req.user?._id;
        if (!canteenId) {
            return res.status(400).json({ message: 'Canteen id missing from auth context.', code: 'NO_CANTEEN_ID' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        stage = 'fetch';
        const reviews = await Review.find({ canteen: canteenId })
            .sort({ createdAt: -1 })
            .limit(50)
            .select('rating comment');
        const orders = await Order.find({ canteen: canteenId, status: 'Completed' })
            .populate('items.menuItem', 'name')
            .lean();

        stage = 'aggregate';
        let totalPrepTime = 0;
        let ordersWithPrepTime = 0;
        let skippedOrders = 0;
        const itemPerformance = {};

        orders.forEach(order => {
            const statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
            if (statusHistory.length === 0) skippedOrders++;
            const acceptedEntry = statusHistory.find(h => h.status === 'Accepted');
            const readyEntry = statusHistory.find(h => h.status === 'Ready');
            if (acceptedEntry && readyEntry) {
                const prepTime = (new Date(readyEntry.timestamp) - new Date(acceptedEntry.timestamp)) / (1000 * 60);
                if (!isNaN(prepTime)) {
                    totalPrepTime += prepTime;
                    ordersWithPrepTime++;
                }
            }
            (order.items || []).forEach(item => {
                if (!item.menuItem) return;
                const name = item.menuItem.name;
                if (!itemPerformance[name]) itemPerformance[name] = { count: 0 };
                itemPerformance[name].count += item.quantity;
            });
        });

        const avgPrepTime = ordersWithPrepTime > 0 ? (totalPrepTime / ordersWithPrepTime).toFixed(2) : 0;

        stage = 'prompt-build';
        let context = `You are an expert business analyst for a college canteen. Provide a concise, actionable analysis for this canteen only.\n\n`;

        context += `=== PERFORMANCE DATA ===\n`;
        context += `- Average Preparation Time: ${avgPrepTime} minutes.\n`;
        context += `- Orders With Prep Time Tracked: ${ordersWithPrepTime}. Skipped (no history): ${skippedOrders}. Total Orders Considered: ${orders.length}.\n`;

        context += "\n=== POPULAR ITEMS (by quantity sold) ===\n";
        const sortedItems = Object.entries(itemPerformance)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 15);
        sortedItems.forEach(([name, data]) => {
            context += `- ${name}: ${data.count} sold.\n`;
        });

        context += "\n=== RECENT STUDENT REVIEWS ===\n";
        reviews.forEach(review => {
            context += `- Rating: ${review.rating}/5, Comment: "${review.comment || 'No comment'}"\n`;
        });

        context += "\n=== TASK ===\n";
        context += "Identify one key strength and one area for improvement for this canteen. Suggest one actionable tip. Keep under 160 words.";

        // Optional: trim context if too long
        const MAX_CONTEXT_CHARS = 8000;
        if (context.length > MAX_CONTEXT_CHARS) {
            context = context.slice(0, MAX_CONTEXT_CHARS) + '\n...[TRIMMED]';
        }

        stage = 'model-call';
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await withRetry(() => model.generateContent({ contents: [{ role: 'user', parts: [{ text: context }] }] }));
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ analysis: text });
    } catch (error) {
        console.error('[AI][analysis][error]', { stage, message: error?.message, name: error?.name });
        res.status(500).json({ 
            message: 'Failed to get AI analysis.', 
            code: 'AI_ANALYSIS_FAILED', 
            stage, 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


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
            "taking into account affordability, speed of preparation, and student preferences, please dont give unnecessary extar informations";

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
        console.error("[AI][follow-up] Gemini API Error:", error?.message, error?.response?.status);
        res.status(500).json({ message: "Failed to get follow-up answer.", error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
});




export { getFoodRecommendation, getCanteenAnalysis, getCanteenFollowUp };

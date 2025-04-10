/**
 * Bible verse module for Daily Reflection Journal
 * Provides daily Bible verses either from a local collection or external API
 */

class BibleVerseProvider {
    constructor() {
        this.verses = null;
        this.usedPrompts = new Set();
        this.loadVerses();

        // Daily reflection prompts organized by category
        this.reflectionPrompts = {
            gratitude: [
                "What are you grateful for today?",
                "Who made a positive impact on your day?",
                "What simple pleasure brought you joy today?",
                "What challenge are you thankful for overcoming?",
                "What beauty did you notice in the world today?"
            ],
            growth: [
                "What did you learn about yourself today?",
                "What skill did you practice or improve?",
                "What mistake taught you something valuable?",
                "What would you do differently if you could relive today?",
                "What progress did you make toward your goals?"
            ],
            relationships: [
                "How did you show kindness to others today?",
                "What meaningful conversation did you have?",
                "How did you strengthen a relationship today?",
                "What did you learn from someone else today?",
                "How did you handle a difficult interaction?"
            ],
            emotions: [
                "What made you feel most alive today?",
                "What emotion was strongest today and why?",
                "How did you manage stress or anxiety today?",
                "What brought you peace today?",
                "What made you smile or laugh today?"
            ],
            future: [
                "What are you looking forward to tomorrow?",
                "What goal would you like to work on?",
                "What dream or aspiration was on your mind today?",
                "What small step can you take tomorrow toward your dreams?",
                "What would make tomorrow even better than today?"
            ]
        };

        // Initialize prompt tracking
        this.initializePromptTracking();
    }

    async loadVerses() {
        try {
            const response = await fetch('js/verses.json');
            this.verses = await response.json();
        } catch (error) {
            console.error('Error loading verses:', error);
            this.verses = {};
        }
    }

    /**
     * Initialize or load prompt tracking from localStorage
     */
    initializePromptTracking() {
        const stored = localStorage.getItem('promptTracking');
        if (stored) {
            this.promptTracking = JSON.parse(stored);
        } else {
            this.promptTracking = {
                lastUsed: {},
                streak: 0
            };
        }
    }

    /**
     * Save prompt tracking to localStorage
     */
    savePromptTracking() {
        localStorage.setItem('promptTracking', JSON.stringify(this.promptTracking));
    }

    async getTodayVerse() {
        if (!this.verses) {
            await this.loadVerses();
        }

        const today = new Date();
        const month = today.toLocaleString('default', { month: 'lowercase' });
        const monthData = this.verses[month];
        
        if (!monthData || !monthData.verses || monthData.verses.length === 0) {
            return {
                text: "The Lord is my shepherd; I shall not want.",
                reference: "Psalm 23:1"
            };
        }

        const dayOfMonth = today.getDate();
        const verseIndex = (dayOfMonth - 1) % monthData.verses.length;
        return monthData.verses[verseIndex];
    }

    getCurrentTheme() {
        const month = new Date().toLocaleString('default', { month: 'lowercase' });
        return this.verses?.[month]?.theme || "Daily Reflection";
    }

    /**
     * Get daily reflection prompts
     * @param {number} count - Number of prompts to return (default: 3)
     * @returns {Array} - Array of prompt strings
     */
    getDailyPrompts(count = 3) {
        const today = new Date().toDateString();
        
        // If we already have prompts for today, return them
        if (this.promptTracking.lastUsed[today]) {
            return this.promptTracking.lastUsed[today];
        }

        // Get all categories
        const categories = Object.keys(this.reflectionPrompts);
        
        // Select random categories
        const selectedCategories = categories
            .sort(() => 0.5 - Math.random())
            .slice(0, count);

        // Get one prompt from each selected category
        const selectedPrompts = selectedCategories.map(category => {
            const prompts = this.reflectionPrompts[category];
            const randomIndex = Math.floor(Math.random() * prompts.length);
            return prompts[randomIndex];
        });

        // Store the selected prompts for today
        this.promptTracking.lastUsed[today] = selectedPrompts;
        this.savePromptTracking();

        return selectedPrompts;
    }

    /**
     * Get a new set of prompts for today
     * @param {number} count - Number of prompts to return
     * @returns {Array} - Array of new prompt strings
     */
    getNewPrompts(count = 3) {
        const today = new Date().toDateString();
        delete this.promptTracking.lastUsed[today];
        return this.getDailyPrompts(count);
    }

    /**
     * Fetch a verse from an external API (if available)
     * @returns {Promise} - Promise resolving to a verse object
     */
    async fetchVerseFromAPI() {
        try {
            // Example API call - replace with actual Bible API if available
            const response = await fetch('https://bible-api.com/john+3:16');
            const data = await response.json();
            
            return {
                text: data.text,
                reference: data.reference
            };
        } catch (error) {
            console.error('Error fetching verse from API:', error);
            // Fall back to local verse if API fails
            return this.getTodayVerse();
        }
    }
}

// Create and export a singleton instance
const bibleVerseProvider = new BibleVerseProvider();

/**
 * Bible verse module for Daily Reflection Journal
 * Provides daily Bible verses either from a local collection or external API
 */

class BibleVerseProvider {
    constructor() {
        // Collection of Bible verses with references
        this.verses = [
            {
                text: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.",
                reference: "Jeremiah 29:11"
            },
            {
                text: "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
                reference: "Proverbs 3:5-6"
            },
            {
                text: "I can do all things through him who strengthens me.",
                reference: "Philippians 4:13"
            },
            {
                text: "Be strong and courageous. Do not fear or be in dread of them, for it is the LORD your God who goes with you. He will not leave you or forsake you.",
                reference: "Deuteronomy 31:6"
            },
            {
                text: "The LORD is my shepherd; I shall not want.",
                reference: "Psalm 23:1"
            },
            {
                text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
                reference: "Romans 8:28"
            },
            {
                text: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
                reference: "Isaiah 40:31"
            },
            {
                text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
                reference: "John 3:16"
            },
            {
                text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
                reference: "Philippians 4:6"
            },
            {
                text: "The LORD is my light and my salvation; whom shall I fear? The LORD is the stronghold of my life; of whom shall I be afraid?",
                reference: "Psalm 27:1"
            },
            {
                text: "Come to me, all who labor and are heavy laden, and I will give you rest.",
                reference: "Matthew 11:28"
            },
            {
                text: "Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you.",
                reference: "Ephesians 4:32"
            },
            {
                text: "Let all that you do be done in love.",
                reference: "1 Corinthians 16:14"
            },
            {
                text: "Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you.",
                reference: "1 Thessalonians 5:16-18"
            },
            {
                text: "The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.",
                reference: "Lamentations 3:22-23"
            },
            {
                text: "And let us not grow weary of doing good, for in due season we will reap, if we do not give up.",
                reference: "Galatians 6:9"
            },
            {
                text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.",
                reference: "Isaiah 41:10"
            },
            {
                text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.",
                reference: "Galatians 5:22-23"
            },
            {
                text: "The LORD bless you and keep you; the LORD make his face to shine upon you and be gracious to you; the LORD lift up his countenance upon you and give you peace.",
                reference: "Numbers 6:24-26"
            },
            {
                text: "Finally, brothers, whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, if there is any excellence, if there is anything worthy of praise, think about these things.",
                reference: "Philippians 4:8"
            }
        ];

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

    /**
     * Get a verse for today based on the date
     * @returns {Object} - Verse object with text and reference
     */
    getTodayVerse() {
        // Use the day of the year to select a verse, ensuring the same verse for the same day
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        // Use modulo to cycle through available verses
        const index = dayOfYear % this.verses.length;
        return this.verses[index];
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

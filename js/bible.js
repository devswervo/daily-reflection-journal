/**
 * Bible verse module for Daily Reflection Journal
 * Provides daily Bible verses from a local collection
 */

class BibleVerseProvider {
    constructor() {
        this.verses = null;
        this.loadVerses();
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
     * Get the Bible verse for today
     * @returns {Object} - Object containing the verse text and reference
     */
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
}

// Create and export a singleton instance
const bibleVerseProvider = new BibleVerseProvider();

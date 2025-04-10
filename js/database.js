/**
 * Database module for Daily Reflection Journal
 * Handles local storage of journal entries using IndexedDB
 */

class JournalDB {
    constructor() {
        this.dbName = 'journalDB';
        this.dbVersion = 3;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Error opening database');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create entries store with new fields
                if (!db.objectStoreNames.contains('entries')) {
                    const entriesStore = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
                    entriesStore.createIndex('date', 'date', { unique: false });
                }

                // Create images store
                if (!db.objectStoreNames.contains('images')) {
                    const imagesStore = db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
                    imagesStore.createIndex('entryId', 'entryId', { unique: false });
                }

                // Create bible quotes store
                if (!db.objectStoreNames.contains('bibleQuotes')) {
                    const quotesStore = db.createObjectStore('bibleQuotes', { keyPath: 'id', autoIncrement: true });
                    quotesStore.createIndex('date', 'date', { unique: true });
                }
            };
        });
    }

    async saveEntry(entry, images = []) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries', 'images'], 'readwrite');
            const entriesStore = transaction.objectStore('entries');
            const imagesStore = transaction.objectStore('images');

            // Ensure entry has all required fields
            const completeEntry = {
                ...entry,
                date: entry.date || new Date().toISOString(),
                moodRating: entry.moodRating || null,
                emotions: entry.emotions || [],
                prayedToday: entry.prayedToday || false,
                bibleQuote: entry.bibleQuote || null
            };

            const request = entriesStore.add(completeEntry);

            request.onsuccess = () => {
                const entryId = request.result;

                // Save images if any
                if (images.length > 0) {
                    images.forEach(image => {
                        imagesStore.add({
                            entryId: entryId,
                            data: image.data,
                            type: image.type
                        });
                    });
                }

                resolve(entryId);
            };

            request.onerror = () => {
                console.error('Error saving entry');
                reject(request.error);
            };
        });
    }

    async saveBibleQuote(quote, date = new Date().toISOString()) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bibleQuotes'], 'readwrite');
            const store = transaction.objectStore('bibleQuotes');
            
            const request = store.put({
                date: date.split('T')[0], // Store only the date part
                quote: quote
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getBibleQuote(date = new Date().toISOString()) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bibleQuotes'], 'readonly');
            const store = transaction.objectStore('bibleQuotes');
            const index = store.index('date');
            const request = index.get(date.split('T')[0]);

            request.onsuccess = () => resolve(request.result?.quote || null);
            request.onerror = () => reject(request.error);
        });
    }

    async getEntry(entryId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.get(entryId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error getting entry');
                reject(request.error);
            };
        });
    }

    async getEntryImages(entryId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readonly');
            const store = transaction.objectStore('images');
            const index = store.index('entryId');
            const request = index.getAll(entryId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error getting entry images');
                reject(request.error);
            };
        });
    }

    async getAllEntries() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const index = store.index('date');
            const request = index.getAll();

            request.onsuccess = () => {
                const entries = request.result;
                entries.sort((a, b) => new Date(b.date) - new Date(a.date));
                resolve(entries);
            };

            request.onerror = () => {
                console.error('Error getting all entries');
                reject(request.error);
            };
        });
    }

    async deleteEntry(entryId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries', 'images'], 'readwrite');
            const entriesStore = transaction.objectStore('entries');
            const imagesStore = transaction.objectStore('images');
            const imagesIndex = imagesStore.index('entryId');

            // Delete entry
            const entryRequest = entriesStore.delete(entryId);

            // Delete associated images
            const imageRequest = imagesIndex.openCursor(entryId);
            imageRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };

            entryRequest.onsuccess = () => {
                resolve();
            };

            entryRequest.onerror = () => {
                console.error('Error deleting entry');
                reject(entryRequest.error);
            };
        });
    }

    async clearAllEntries() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readwrite');
            const store = transaction.objectStore('entries');
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                console.error('Error clearing all entries');
                reject(request.error);
            };
        });
    }

    async getEntryByPage(pageNumber) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.getAll();

            request.onsuccess = () => {
                const entries = request.result.sort((a, b) => new Date(b.date) - new Date(a.date));
                const entry = entries[pageNumber - 1] || null;
                resolve(entry);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async getTotalPages() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Create and export database instance
const journalDB = new JournalDB();

/**
 * Main application script for Daily Reflection Journal
 * Handles UI interactions, data management, and app functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Initialize components
    initThemeToggle();
    displayCurrentDate();
    loadBibleQuote();
    setupEventListeners();
    loadJournalPage(1);
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    document.body.classList.toggle('dark-theme', isDarkMode);
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('darkMode', isDark);
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    });
}

function displayCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString(undefined, options);
}

async function loadBibleQuote() {
    const quoteElement = document.getElementById('bible-quote-text');
    let quote = await journalDB.getBibleQuote();
    
    if (!quote) {
        // If no quote exists for today, fetch a new one
        quote = await fetchRandomBibleQuote();
        await journalDB.saveBibleQuote(quote);
    }
    
    quoteElement.textContent = quote;
}

async function fetchRandomBibleQuote() {
    // This is a placeholder. In a real app, you would fetch from a Bible API
    const quotes = [
        "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future. - Jeremiah 29:11",
        "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go. - Joshua 1:9",
        "Trust in the Lord with all your heart and lean not on your own understanding. - Proverbs 3:5",
        "I can do all things through Christ who strengthens me. - Philippians 4:13",
        "The Lord is my shepherd, I lack nothing. - Psalm 23:1"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function setupEventListeners() {
    // Save button
    document.getElementById('save-btn').addEventListener('click', saveJournalEntry);
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', clearForm);
    
    // Image upload
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);
    
    // Journal navigation
    document.getElementById('prev-page').addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('page-number').value) || 1;
        if (currentPage > 1) loadJournalPage(currentPage - 1);
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('page-number').value) || 1;
        loadJournalPage(currentPage + 1);
    });
    
    document.getElementById('go-to-page').addEventListener('click', () => {
        const pageNumber = parseInt(document.getElementById('page-number').value);
        if (pageNumber > 0) loadJournalPage(pageNumber);
    });
}

async function saveJournalEntry() {
    const moodRating = document.querySelector('input[name="mood-rating"]:checked')?.value;
    const emotions = Array.from(document.querySelectorAll('input[name="emotions"]:checked'))
        .map(input => input.value);
    const prayedToday = document.querySelector('input[name="prayed-today"]:checked')?.value === 'yes';
    const bibleQuote = document.getElementById('bible-quote-text').textContent;
    
    const entry = {
        date: new Date().toISOString(),
        moodRating,
        emotions,
        prayedToday,
        bibleQuote
    };
    
    const images = Array.from(document.querySelectorAll('#image-preview img')).map(img => ({
        data: img.src,
        type: img.dataset.type
    }));
    
    try {
        await journalDB.saveEntry(entry, images);
        alert('Journal entry saved successfully!');
        clearForm();
        loadJournalPage(1);
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('Error saving journal entry. Please try again.');
    }
}

function clearForm() {
    document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
    document.getElementById('image-preview').innerHTML = '';
}

function handleImageUpload(event) {
    const files = event.target.files;
    const imagePreview = document.getElementById('image-preview');
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.dataset.type = file.type;
                
                const container = document.createElement('div');
                container.className = 'image-container';
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-image-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.onclick = () => container.remove();
                
                container.appendChild(img);
                container.appendChild(deleteBtn);
                imagePreview.appendChild(container);
            };
            reader.readAsDataURL(file);
        }
    });
    
    event.target.value = '';
}

async function loadJournalPage(pageNumber) {
    const entry = await journalDB.getEntryByPage(pageNumber);
    const totalPages = await journalDB.getTotalPages();
    const journalContent = document.getElementById('journal-content');
    const pageNumberInput = document.getElementById('page-number');
    
    pageNumberInput.value = pageNumber;
    
    if (!entry) {
        journalContent.innerHTML = '<p class="no-entry">No entry found for this page.</p>';
        return;
    }
    
    // Get images for this entry
    const images = await journalDB.getEntryImages(entry.id);
    
    // Format the date
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let html = `
        <div class="journal-entry">
            <h3>${formattedDate}</h3>
            <div class="bible-quote">
                <blockquote>${entry.bibleQuote || 'No Bible quote for this day.'}</blockquote>
            </div>
            <div class="prompts-section">
                <h4>Daily Reflection</h4>
                <div class="mood-rating">Mood: ${entry.moodRating || 'Not rated'}/10</div>
                <div class="emotions">Emotions: ${entry.emotions?.join(', ') || 'None recorded'}</div>
                <div class="prayer-status">Prayed Today: ${entry.prayedToday ? 'Yes' : 'No'}</div>
            </div>
    `;
    
    // Add images section if there are images
    if (images && images.length > 0) {
        html += '<div class="entry-images">';
        images.forEach(image => {
            html += `<img src="${image.data}" alt="Journal image">`;
        });
        html += '</div>';
    }
    
    html += '</div>';
    journalContent.innerHTML = html;
    
    // Update navigation buttons
    document.getElementById('prev-page').disabled = pageNumber <= 1;
    document.getElementById('next-page').disabled = pageNumber >= totalPages;
}

// Test script for database functionality
// This script will test the IndexedDB implementation

// Create a test entry
const testEntry = {
  date: new Date().toISOString(),
  verse: {
    text: "This is a test verse",
    reference: "Test 1:1"
  },
  prompts: [
    {
      question: "Test question 1?",
      answer: "Test answer 1"
    },
    {
      question: "Test question 2?",
      answer: "Test answer 2"
    }
  ]
};

// Create a test image
const testImage = {
  data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  type: "image/png"
};

// Function to run database tests
async function testDatabase() {
  console.log("Starting database tests...");
  
  try {
    // Test database initialization
    console.log("Testing database initialization...");
    await journalDB.initDatabase();
    console.log("✓ Database initialized successfully");
    
    // Test saving an entry
    console.log("Testing entry saving...");
    const entryId = await journalDB.saveEntry(testEntry, [testImage]);
    console.log(`✓ Entry saved successfully with ID: ${entryId}`);
    
    // Test retrieving all entries
    console.log("Testing entry retrieval...");
    const entries = await journalDB.getAllEntries();
    console.log(`✓ Retrieved ${entries.length} entries`);
    
    // Test retrieving a specific entry
    console.log("Testing specific entry retrieval...");
    const entry = await journalDB.getEntry(entryId);
    console.log(`✓ Retrieved entry with date: ${new Date(entry.date).toLocaleString()}`);
    
    // Test retrieving images for an entry
    console.log("Testing image retrieval...");
    const images = await journalDB.getEntryImages(entryId);
    console.log(`✓ Retrieved ${images.length} images for entry`);
    
    // Test exporting all data
    console.log("Testing data export...");
    const exportData = await journalDB.exportAllData();
    console.log(`✓ Exported ${exportData.entries.length} entries and ${exportData.images.length} images`);
    
    // Test deleting an entry
    console.log("Testing entry deletion...");
    await journalDB.deleteEntry(entryId);
    const entriesAfterDelete = await journalDB.getAllEntries();
    console.log(`✓ Entry deleted. Remaining entries: ${entriesAfterDelete.length}`);
    
    console.log("All database tests completed successfully!");
    return true;
  } catch (error) {
    console.error("Database test failed:", error);
    return false;
  }
}

// Run the tests when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const testButton = document.createElement('button');
  testButton.textContent = 'Run Database Tests';
  testButton.style.position = 'fixed';
  testButton.style.bottom = '10px';
  testButton.style.right = '10px';
  testButton.style.zIndex = '9999';
  testButton.style.padding = '10px';
  testButton.style.backgroundColor = '#4285f4';
  testButton.style.color = 'white';
  testButton.style.border = 'none';
  testButton.style.borderRadius = '4px';
  testButton.style.cursor = 'pointer';
  
  testButton.addEventListener('click', async () => {
    const resultsDiv = document.createElement('div');
    resultsDiv.style.position = 'fixed';
    resultsDiv.style.top = '50%';
    resultsDiv.style.left = '50%';
    resultsDiv.style.transform = 'translate(-50%, -50%)';
    resultsDiv.style.backgroundColor = 'white';
    resultsDiv.style.padding = '20px';
    resultsDiv.style.borderRadius = '8px';
    resultsDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    resultsDiv.style.zIndex = '10000';
    resultsDiv.style.maxWidth = '80%';
    resultsDiv.style.maxHeight = '80%';
    resultsDiv.style.overflow = 'auto';
    
    resultsDiv.innerHTML = '<h3>Running Database Tests...</h3>';
    document.body.appendChild(resultsDiv);
    
    // Create a log container
    const logContainer = document.createElement('div');
    logContainer.style.marginTop = '10px';
    logContainer.style.padding = '10px';
    logContainer.style.backgroundColor = '#f5f5f5';
    logContainer.style.borderRadius = '4px';
    logContainer.style.fontFamily = 'monospace';
    logContainer.style.whiteSpace = 'pre-wrap';
    resultsDiv.appendChild(logContainer);
    
    // Override console.log to display in the results div
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = function(...args) {
      originalLog.apply(console, args);
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
      const logLine = document.createElement('div');
      logLine.textContent = message;
      logContainer.appendChild(logLine);
    };
    
    console.error = function(...args) {
      originalError.apply(console, args);
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
      const logLine = document.createElement('div');
      logLine.textContent = '❌ ' + message;
      logLine.style.color = 'red';
      logContainer.appendChild(logLine);
    };
    
    try {
      const success = await testDatabase();
      
      if (success) {
        resultsDiv.querySelector('h3').textContent = '✅ Database Tests Completed Successfully';
        resultsDiv.querySelector('h3').style.color = 'green';
      } else {
        resultsDiv.querySelector('h3').textContent = '❌ Database Tests Failed';
        resultsDiv.querySelector('h3').style.color = 'red';
      }
    } catch (error) {
      resultsDiv.querySelector('h3').textContent = '❌ Database Tests Failed';
      resultsDiv.querySelector('h3').style.color = 'red';
      console.error('Unexpected error:', error);
    }
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '15px';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#ddd';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', () => {
      document.body.removeChild(resultsDiv);
      console.log = originalLog;
      console.error = originalError;
    });
    
    resultsDiv.appendChild(closeButton);
  });
  
  document.body.appendChild(testButton);
});

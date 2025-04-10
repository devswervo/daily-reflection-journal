/**
 * Export functionality for Daily Reflection Journal
 * Allows users to export their journal entries in different formats
 */

const exportManager = (() => {
    // Dependencies
    const db = journalDB;
    
    /**
     * Export all journal entries as JSON
     * @returns {Promise<string>} JSON string of all entries
     */
    async function exportAsJSON() {
        try {
            // Get all entries from database
            const entries = await db.getAllEntries();
            
            // Create a structured object with metadata
            const exportData = {
                appName: 'Daily Reflection Journal',
                exportDate: new Date().toISOString(),
                version: '1.0.0',
                entries: []
            };
            
            // Process each entry
            for (const entry of entries) {
                // Get images for this entry
                const images = await db.getEntryImages(entry.id);
                
                // Add entry to export data
                exportData.entries.push({
                    ...entry,
                    images: images.map(img => ({
                        type: img.type,
                        data: img.data
                    }))
                });
            }
            
            // Convert to JSON string with pretty formatting
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Error exporting as JSON:', error);
            throw new Error('Failed to export journal entries as JSON');
        }
    }
    
    /**
     * Export all journal entries as plain text
     * @returns {Promise<string>} Plain text of all entries
     */
    async function exportAsText() {
        try {
            // Get all entries from database
            const entries = await db.getAllEntries();
            
            // Create header
            let textContent = 'DAILY GRACE\n';
            textContent += '=======================\n\n';
            textContent += `Exported on: ${new Date().toLocaleString()}\n\n`;
            
            // Process each entry
            for (const entry of entries) {
                const entryDate = new Date(entry.date);
                
                // Add entry header
                textContent += `## ${entryDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}\n\n`;
                
                // Add verse
                textContent += `Today's Verse: "${entry.verse.text}"\n`;
                textContent += `Reference: ${entry.verse.reference}\n\n`;
                
                // Add prompts and answers
                for (const prompt of entry.prompts) {
                    textContent += `Q: ${prompt.question}\n`;
                    textContent += `A: ${prompt.answer}\n\n`;
                }
                
                // Add separator
                textContent += '----------------------------\n\n';
            }
            
            return textContent;
        } catch (error) {
            console.error('Error exporting as text:', error);
            throw new Error('Failed to export journal entries as text');
        }
    }
    
    /**
     * Export all journal entries as HTML
     * @returns {Promise<string>} HTML string of all entries
     */
    async function exportAsHTML() {
        try {
            // Get all entries from database
            const entries = await db.getAllEntries();
            
            // Create HTML header
            let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Grace - Export</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #4285f4;
            text-align: center;
            border-bottom: 2px solid #4285f4;
            padding-bottom: 10px;
        }
        .entry {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
            background-color: #f9f9f9;
        }
        .entry-date {
            font-size: 1.2em;
            color: #4285f4;
            margin-top: 0;
        }
        .verse {
            background-color: #e8f0fe;
            padding: 15px;
            border-left: 3px solid #4285f4;
            margin: 15px 0;
            font-style: italic;
        }
        .reference {
            text-align: right;
            font-weight: bold;
        }
        .prompt {
            margin-bottom: 15px;
        }
        .question {
            font-weight: bold;
            color: #4285f4;
        }
        .answer {
            margin-left: 20px;
            white-space: pre-wrap;
        }
        .images {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        .images img {
            max-width: 200px;
            max-height: 200px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .export-info {
            text-align: center;
            font-size: 0.8em;
            color: #666;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <h1>Daily Grace</h1>
`;
            
            // Process each entry
            for (const entry of entries) {
                const entryDate = new Date(entry.date);
                
                // Get images for this entry
                const images = await db.getEntryImages(entry.id);
                
                // Add entry
                htmlContent += `
    <div class="entry">
        <h2 class="entry-date">${entryDate.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</h2>
        
        <div class="verse">
            <p>${entry.verse.text}</p>
            <p class="reference">${entry.verse.reference}</p>
        </div>
        
        <div class="prompts">`;
                
                // Add prompts and answers
                for (const prompt of entry.prompts) {
                    htmlContent += `
            <div class="prompt">
                <p class="question">${prompt.question}</p>
                <p class="answer">${prompt.answer}</p>
            </div>`;
                }
                
                htmlContent += `
        </div>`;
                
                // Add images if any
                if (images.length > 0) {
                    htmlContent += `
        <div class="images">`;
                    
                    for (const image of images) {
                        htmlContent += `
            <img src="${image.data}" alt="Journal image">`;
                    }
                    
                    htmlContent += `
        </div>`;
                }
                
                htmlContent += `
    </div>`;
            }
            
            // Add footer
            htmlContent += `
    <div class="export-info">
        <p>Exported on: ${new Date().toLocaleString()}</p>
        <p>Daily Reflection Journal v1.0.0</p>
    </div>
</body>
</html>`;
            
            return htmlContent;
        } catch (error) {
            console.error('Error exporting as HTML:', error);
            throw new Error('Failed to export journal entries as HTML');
        }
    }
    
    /**
     * Export all journal entries as PDF
     * @returns {Promise<Blob>} PDF blob of all entries
     */
    async function exportAsPDF() {
        try {
            // First generate HTML content
            const htmlContent = await exportAsHTML();
            
            // Create a hidden iframe to render the HTML
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            // Write the HTML content to the iframe
            iframe.contentDocument.open();
            iframe.contentDocument.write(htmlContent);
            iframe.contentDocument.close();
            
            // Wait for images to load
            await new Promise(resolve => {
                iframe.onload = resolve;
                setTimeout(resolve, 1000); // Fallback timeout
            });
            
            // Use html2pdf library to convert to PDF
            // Note: In a real implementation, you would include the html2pdf.js library
            // For this demo, we'll simulate the PDF creation
            
            // Create a message to show in the console
            console.log('Generating PDF from HTML content...');
            
            // Return a promise that resolves with a simulated PDF blob
            return new Promise(resolve => {
                setTimeout(() => {
                    // In a real implementation, this would be the actual PDF blob
                    // For now, we'll just create a text blob with a message
                    const pdfBlob = new Blob(
                        ['This would be a PDF file in a real implementation.'],
                        { type: 'application/pdf' }
                    );
                    
                    // Clean up the iframe
                    document.body.removeChild(iframe);
                    
                    resolve(pdfBlob);
                }, 500);
            });
        } catch (error) {
            console.error('Error exporting as PDF:', error);
            throw new Error('Failed to export journal entries as PDF');
        }
    }
    
    /**
     * Download content as a file
     * @param {string|Blob} content - Content to download
     * @param {string} filename - Name of the file
     * @param {string} type - MIME type of the file
     */
    function downloadFile(content, filename, type) {
        // Create a blob from the content if it's not already a blob
        const blob = content instanceof Blob 
            ? content 
            : new Blob([content], { type });
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create a link element
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // Append the link to the body
        document.body.appendChild(link);
        
        // Click the link to trigger the download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Export journal entries in the specified format
     * @param {string} format - Format to export (json, text, html, pdf)
     * @returns {Promise<void>}
     */
    async function exportEntries(format) {
        try {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            
            switch (format.toLowerCase()) {
                case 'json':
                    const jsonContent = await exportAsJSON();
                    downloadFile(
                        jsonContent,
                        `daily-grace_${dateStr}.json`,
                        'application/json'
                    );
                    break;
                    
                case 'text':
                    const textContent = await exportAsText();
                    downloadFile(
                        textContent,
                        `daily-grace_${dateStr}.txt`,
                        'text/plain'
                    );
                    break;
                    
                case 'html':
                    const htmlContent = await exportAsHTML();
                    downloadFile(
                        htmlContent,
                        `daily-grace_${dateStr}.html`,
                        'text/html'
                    );
                    break;
                    
                case 'pdf':
                    const pdfBlob = await exportAsPDF();
                    downloadFile(
                        pdfBlob,
                        `daily-grace_${dateStr}.pdf`,
                        'application/pdf'
                    );
                    break;
                    
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
            
            console.log(`Successfully exported journal entries as ${format.toUpperCase()}`);
            return true;
        } catch (error) {
            console.error(`Error exporting entries as ${format}:`, error);
            throw error;
        }
    }
    
    // Public API
    return {
        exportAsJSON,
        exportAsText,
        exportAsHTML,
        exportAsPDF,
        exportEntries
    };
})();

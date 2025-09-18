// Chinese Pinyin Annotator Content Script
(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Only process text nodes that have Chinese characters
        minChineseChars: 1,
        // Maximum number of nodes to process to avoid performance issues
        maxNodesToProcess: 1000,
        // Delay before processing to allow page to fully load
        processingDelay: 1000,
        // CSS class for pinyin annotations
        pinyinClass: 'pinyin-annotation',
        // Exclude these tags from processing
        excludedTags: ['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT']
    };

    // Track processed nodes to avoid duplicate processing
    const processedNodes = new WeakSet();
    
    // Add CSS styles for pinyin annotations
    function addStyles() {
        if (document.getElementById('pinyin-annotator-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'pinyin-annotator-styles';
        style.textContent = `
            .${CONFIG.pinyinClass} {
                font-size: 0.8em;
                color: #666;
                font-weight: normal;
                margin-left: 1px;
                margin-right: 1px;
            }
            
            /* Ensure annotations don't break layout */
            .${CONFIG.pinyinClass}::before {
                content: "(";
            }
            
            .${CONFIG.pinyinClass}::after {
                content: ")";
            }
        `;
        document.head.appendChild(style);
    }

    // Check if element should be excluded from processing
    function shouldExcludeElement(element) {
        if (!element || !element.tagName) return true;
        
        const tagName = element.tagName.toUpperCase();
        if (CONFIG.excludedTags.includes(tagName)) return true;
        
        // Skip elements with contenteditable
        if (element.contentEditable === 'true') return true;
        
        // Skip hidden elements
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return true;
        
        return false;
    }

    // Process text content and add Pinyin annotations
    function processTextContent(text) {
        if (!text || typeof text !== 'string') return text;
        
        let result = '';
        let hasChineseChars = false;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            if (window.pinyinUtils && window.pinyinUtils.isChineseChar(char)) {
                hasChineseChars = true;
                const pinyin = window.pinyinUtils.getPinyin(char);
                
                // Only add pinyin if it's different from the character (i.e., we found a translation)
                if (pinyin !== char) {
                    result += char + `<span class="${CONFIG.pinyinClass}">${pinyin}</span>`;
                } else {
                    result += char;
                }
            } else {
                result += char;
            }
        }
        
        return hasChineseChars ? result : text;
    }

    // Process a single text node
    function processTextNode(textNode) {
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
        if (processedNodes.has(textNode)) return;
        
        const parent = textNode.parentNode;
        if (!parent || shouldExcludeElement(parent)) return;
        
        const originalText = textNode.textContent;
        if (!originalText || originalText.trim() === '') return;
        
        // Check if text contains Chinese characters
        let hasChineseChars = false;
        for (let char of originalText) {
            if (window.pinyinUtils && window.pinyinUtils.isChineseChar(char)) {
                hasChineseChars = true;
                break;
            }
        }
        
        if (!hasChineseChars) return;
        
        try {
            const processedText = processTextContent(originalText);
            
            if (processedText !== originalText && processedText.includes('class="' + CONFIG.pinyinClass + '"')) {
                // Create a temporary container to parse the HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = processedText;
                
                // Replace the text node with the processed content
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                
                parent.replaceChild(fragment, textNode);
                processedNodes.add(textNode);
            }
        } catch (error) {
            console.warn('Pinyin Annotator: Error processing text node:', error);
        }
    }

    // Get all text nodes in an element
    function getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (shouldExcludeElement(node.parentNode)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
            if (textNodes.length >= CONFIG.maxNodesToProcess) break;
        }
        
        return textNodes;
    }

    // Process all text nodes in the document
    function processDocument() {
        if (!window.pinyinUtils) {
            console.warn('Pinyin Annotator: Pinyin utilities not loaded');
            return;
        }
        
        console.log('Pinyin Annotator: Processing document...');
        
        const textNodes = getTextNodes(document.body || document.documentElement);
        let processedCount = 0;
        
        textNodes.forEach(textNode => {
            processTextNode(textNode);
            processedCount++;
        });
        
        console.log(`Pinyin Annotator: Processed ${processedCount} text nodes`);
    }

    // Observe DOM changes to handle dynamically loaded content
    function observeChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldProcess = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.TEXT_NODE || 
                            (node.nodeType === Node.ELEMENT_NODE && !shouldExcludeElement(node))) {
                            shouldProcess = true;
                            break;
                        }
                    }
                }
            });
            
            if (shouldProcess) {
                // Debounce processing to avoid excessive calls
                clearTimeout(observeChanges.timeout);
                observeChanges.timeout = setTimeout(() => {
                    processDocument();
                }, 500);
            }
        });
        
        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }

    // Initialize the extension
    function initialize() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
            return;
        }
        
        // Add CSS styles
        addStyles();
        
        // Process the document after a delay to ensure all content is loaded
        setTimeout(() => {
            processDocument();
            
            // Start observing for dynamic changes
            observeChanges();
        }, CONFIG.processingDelay);
    }

    // Check if we're in a frame/iframe and handle accordingly
    function shouldRunInFrame() {
        try {
            // Don't run in frames that are too small or hidden
            if (window.innerWidth < 100 || window.innerHeight < 100) return false;
            
            // Don't run in ad frames or tracking frames
            const hostname = window.location.hostname.toLowerCase();
            const adDomains = ['doubleclick', 'googlesyndication', 'googleadservices', 'facebook.com/tr'];
            if (adDomains.some(domain => hostname.includes(domain))) return false;
            
            return true;
        } catch (e) {
            return false;
        }
    }

    // Start the extension
    if (shouldRunInFrame()) {
        console.log('Pinyin Annotator: Starting extension...');
        initialize();
    }

})();
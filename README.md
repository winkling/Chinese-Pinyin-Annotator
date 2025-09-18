# Chinese Pinyin Annotator Chrome Extension

A Chrome extension that automatically adds Pinyin annotations to Chinese characters on any webpage, making it easier to read and learn Chinese text.

## Features

- **Automatic Detection**: Scans all webpages for Chinese characters (Unicode range \u4E00–\u9FFF)
- **Real-time Annotation**: Adds Pinyin immediately after each Chinese character
- **Smart Processing**: Only processes text nodes containing Chinese characters for optimal performance
- **Dynamic Content Support**: Works with dynamically loaded content using MutationObserver
- **Clean Styling**: Pinyin appears in smaller, gray text with parentheses
- **Manifest V3**: Built with the latest Chrome extension standards

## Example

When you visit a webpage with Chinese text, the extension transforms:
- `你好` → `你(nǐ)好(hǎo)`
- `中国` → `中(zhōng)国(guó)`
- `汉字` → `汉(hàn)字(zì)`

## Installation

### Step 1: Download the Extension Files

Create a new folder on your computer (e.g., "Chinese-Pinyin-Annotator") and save these files:

1. **manifest.json** - Extension configuration
2. **pinyin-data.js** - Chinese character to Pinyin dictionary
3. **content.js** - Main processing script

### Step 2: Load Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** by toggling the switch in the top-right corner
4. Click the **"Load unpacked"** button
5. Select the folder containing your extension files
6. The extension should now appear in your extensions list with a puzzle piece icon

### Step 3: Test the Extension

Visit any webpage containing Chinese text:

**Recommended test sites:**
- `https://baidu.com` - Chinese search engine
- `https://cn.bing.com` - Chinese Bing
- `https://zh.wikipedia.org` - Chinese Wikipedia
- `https://www.xinhuanet.com` - Chinese news site

You should immediately see Pinyin annotations appear after Chinese characters!

### Step 4: Verify Installation

- Look for Chinese characters followed by gray text in parentheses showing Pinyin
- Open browser console (F12 → Console) and look for messages like "Pinyin Annotator: Processing document..."
- The extension automatically works on all websites

## Troubleshooting

### Extension Not Loading
- **Error**: "Invalid value for icons"
  - **Solution**: Make sure you're using the latest manifest.json without any icons section

### Pinyin Not Appearing
- Check that the extension is enabled in `chrome://extensions/`
- Verify all three files are in the same folder
- Try refreshing the webpage

### Endless Pinyin Appending
- This has been fixed in the latest version
- If you encounter this, reload the extension in `chrome://extensions/`

### Limited Character Support
- The extension includes ~200 common Chinese characters
- Uncommon characters will display without Pinyin annotations
- You can expand the dictionary in `pinyin-data.js` if needed

## Technical Details

### Files Structure
```
Chinese-Pinyin-Annotator/
├── manifest.json          # Extension configuration (Manifest V3)
├── pinyin-data.js         # Character-to-Pinyin mapping dictionary
└── content.js            # Main content script for processing webpages
```

### Performance Optimizations
- Processes maximum 1000 text nodes per page
- Excludes script, style, and other non-content elements  
- Uses WeakSet for efficient duplicate prevention
- Debounced mutation observer (500ms delay)

### Browser Compatibility
- Chrome (Manifest V3 compatible)
- Other Chromium-based browsers (Edge, Opera, etc.)

## Development

### Expanding the Dictionary
To add more Chinese characters, edit the `PINYIN_MAP` object in `pinyin-data.js`:

```javascript
const PINYIN_MAP = {
  '你': 'nǐ',
  '好': 'hǎo',
  // Add more characters here
  '新': 'xīn',
  '词': 'cí'
};
```

### Customizing Styles
Modify the CSS in `content.js` within the `addStyles()` function:

```javascript
.pinyin-annotation {
  font-size: 0.8em;
  color: #666;
  font-weight: normal;
  // Customize appearance here
}
```

## License

This extension is provided as-is for educational and personal use.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify you're using the latest version of all files
3. Test on multiple websites to isolate the issue
4. Check browser console for error messages
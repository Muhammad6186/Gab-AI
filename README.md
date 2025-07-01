# Authors

<div align="center">
  <img src="https://i.imgur.com/TM6qhgB.jpeg" alt="Profile Image" width="120" height="120" style="border-radius: 50%;">
</div>
<div align="center">
  <p><strong>Joshua Apostol & Cyril Encenso</strong></p>
</div>

<div align="center">
  <h2><strong>NASHBOT</strong></h2>
</div>

<div align="center">
  <p>Welcome to NASHBOT - your ultimate AI-powered companion for managing Facebook group chats with advanced intelligence and real-time features!</p>
</div>

## ✨ Revolutionary Smart Commands System

NASH BOT features a groundbreaking intelligent command system that understands natural language and provides context-aware responses without requiring command prefixes.

### 🤖 Advanced AI Assistant
Interact naturally with sophisticated AI capabilities:
- **Educational Support**: Get detailed explanations on any topic
- **Programming Assistant**: Code help, debugging, and technical guidance
- **Mathematical Calculations**: Solve complex equations instantly
- **Natural Conversations**: Casual chat with intelligent responses
- **Multi-Language Support**: Communicate in various languages
- **Real-Time Processing**: Instant responses with advanced NLP

### 🎮 Grow A Garden Live Tracker (NEW!)
Real-time stock monitoring with WebSocket technology:
- **Live Monitoring**: "gag stock start" - Real-time WebSocket updates
- **Smart Filtering**: "gag stock start Sunflower | Watering Can" - Track specific items
- **Countdown Timers**: "restock timer" - Philippines timezone synchronized
- **Weather Integration**: Live weather bonuses and event tracking
- **Auto-Updates**: Refreshes every 10 seconds with live data
- **Session Management**: Start/stop tracking with persistent connections

### 📹 Enhanced Media & Entertainment
Advanced video and content management:
- **Smart Video Requests**: "video", "shoti", "girl video" - AI-curated content
- **TikTok Search**: "TikTok [topic]" - Search and download specific content
- **Instagram Downloads**: "Ig [URL] - High-quality video downloader
- **Spotify**: "song / music [name] - Search & Download songs from Spotify
- **Facebook Downloads**: "Download [URL]" - High-quality video extraction
- **Auto-Cleanup**: Temporary file management with error handling
- **Format Optimization**: Mobile-friendly video processing

### 🔧 Professional Utilities & Tools
Comprehensive group management features:
- **User Identification**: "uid", "my id" - Advanced user tracking
- **Group Analytics**: "list groups" - Complete group statistics
- **Broadcast System**: "notification [message]" - Multi-group messaging
- **Performance Monitoring**: "uptime" - Real-time bot statistics
- **Auto-Reactions**: Smart reaction management with cleanup

### 📱 Mobile-Optimized Notifications
Professional notification system designed for mobile:
- **Aesthetic Join/Leave Messages**: Clean, mobile-friendly design
- **Compact Line Formatting**: Optimized for mobile Messenger
- **Professional Layout**: Business-grade appearance
- **Error Handling**: Robust notification delivery system

### 📋 Available Commands & Features

#### 🎯 Smart Detection (No Prefix Required)
- **AI Conversations**: Ask any question naturally
- **Mathematical Expressions**: "What's 15 × 25 + 100?"
- **Educational Queries**: "Explain quantum physics"
- **Programming Help**: "How do I center a div in CSS?"
- **Real-Time Stock**: "gag stock start" / "gag stock stop"
- **Media Requests**: "Show me a funny video"
- **Information**: "What are the rules?" / "Contact info"

#### 🤖 AI Mode Control
- **Enable AI**: "on ai" / "ai on" - Full conversational mode
- **Disable AI**: "off ai" / "ai off" - Smart detection only
- **Alternative AI**: "aria [question]" - Secondary AI assistant

#### 📊 Advanced Features
- **URL Recognition**: Automatic Facebook video download detection
- **Spam Protection**: Individual user cooldown system (5 seconds)
- **Error Recovery**: Graceful fallback mechanisms
- **WebSocket Monitoring**: Real-time data streaming for GAG tracker

### 🚀 Latest Updates & New Features

#### 🆕 Version 2.0 Enhancements
- **Mobile-Optimized Notifications**: Professional join/leave messages for mobile
- **Enhanced Error Handling**: Improved "shoti" command with robust error management
- **Unified Help System**: Single comprehensive help command (removed duplicates)
- **Real-Time GAG Tracking**: Live WebSocket monitoring with filtering capabilities
- **Advanced NLP**: Improved natural language processing with conflict resolution

#### 🔧 Technical Improvements
- **Priority-Based Detection**: Specific commands processed before general AI queries
- **Memory Management**: Automatic cleanup and cooldown management
- **Session Persistence**: Reliable WebSocket connections with auto-reconnect
- **Performance Optimization**: Efficient processing with early returns
- **Mobile Compatibility**: Responsive design for mobile Messenger interface

## HOW TO CREATE COMMANDS?

### 📁 File Structure
Commands should be placed in the `modules/commands/` directory as `.js` files.

### 🔧 Advanced Command Template
```javascript
module.exports = {
  name: "commandname",           // Command name (required)
  description: "Command description", // What the command does
  nashPrefix: true,              // true = requires prefix, false = works without prefix
  role: "user",                  // "admin" or "user" - restricts command access
  aliases: ["alias1", "alias2"], // Alternative names for the command
  cooldowns: 5,                  // Cooldown in seconds (0 = no cooldown)
  version: "2.0.0",             // Command version (recommended)
  author: "Your Name",          // Command author
  execute: async (api, event, args, prefix) => {
    // Your advanced command logic here
    const { threadID, messageID, senderID, body } = event;
    
    // Enhanced message with design function
    const { format } = require("cassidy-styler");
    function design(title, content) {
        return format({
            title,
            titleFont: "bold",
            contentFont: "none",
            titlePattern: "【 NASH 】{word} {emojis}",
            content,
        });
    }
    
    const response = design("Command Response", "Your message content here");
    api.sendMessage(response, threadID, messageID);
  }
};
```

### 📝 Advanced Command Examples

#### 1. Smart Command with AI Integration
```javascript
module.exports = {
  name: "weather",
  description: "AI-powered weather information",
  nashPrefix: false, // No prefix required
  role: "user",
  cooldowns: 10,
  version: "2.0.0",
  execute: async (api, event, args, prefix) => {
    const { threadID, messageID, body } = event;
    
    // Smart location extraction
    const location = body.replace(/weather|in|for|what's|how's/gi, '').trim();
    
    if (!location) {
      return api.sendMessage("Please specify a location for weather info!", threadID, messageID);
    }
    
    // Processing message with design
    api.sendMessage("🌤️ Getting weather data...", threadID, async (err, info) => {
      try {
        // Your weather API integration here
        const weatherData = await getWeatherData(location);
        const response = design("Weather Information", 
          `📍 Location: ${location}\n🌡️ Temperature: ${weatherData.temp}°C\n☁️ Condition: ${weatherData.condition}`
        );
        api.editMessage(response, info.messageID);
      } catch (error) {
        api.editMessage("❌ Failed to get weather data", info.messageID);
      }
    });
  }
};
```

#### 2. WebSocket Real-Time Command
```javascript
const WebSocket = require('ws');

module.exports = {
  name: "livestock",
  description: "Real-time stock monitoring with WebSocket",
  nashPrefix: false,
  role: "user",
  cooldowns: 0,
  version: "2.0.0",
  execute: async (api, event, args, prefix) => {
    const { threadID, messageID } = event;
    
    // WebSocket connection for real-time data
    const ws = new WebSocket('wss://api.example.com/stock');
    
    ws.on('message', (data) => {
      const stockData = JSON.parse(data);
      const response = design("Live Stock Update", 
        `📊 ${stockData.symbol}: $${stockData.price}\n📈 Change: ${stockData.change}%`
      );
      api.sendMessage(response, threadID);
    });
    
    // Auto-cleanup after 5 minutes
    setTimeout(() => ws.close(), 300000);
  }
};
```

### 🌟 Smart Command Integration

To add functionality to the smart command system:

1. **Add Detection Function:**
```javascript
function isYourCommandRequest(message) {
  return message.includes('your keyword') || 
         message.includes('trigger phrase') ||
         /your-regex-pattern/i.test(message);
}
```

2. **Add Handler Function:**
```javascript
async function handleYourCommand(api, event, body, threadID, messageID) {
  const response = design("Your Feature", "Feature response content");
  api.sendMessage(response, threadID, messageID);
}
```

3. **Add to Priority System:**
```javascript
// Add in smartCommands.js execute function (maintain priority order)
if (isYourCommandRequest(message)) {
  return handleYourCommand(api, event, body, threadID, messageID);
}
```

## Features

- **Revolutionary Smart Commands**: 
  - Advanced natural language processing with context awareness
  - No prefix required for intelligent interactions
  - Priority-based command detection with conflict resolution
  - Individual user cooldown system with spam protection
  - Reply-context awareness for AI conversations

- **Real-Time WebSocket Integration**: 
  - Live Grow A Garden stock monitoring
  - Real-time updates every 10 seconds
  - Session management with auto-reconnect
  - Filter-specific item tracking
  - Philippines timezone synchronization

- **Enhanced Command System**: 
  - Dynamic command registration with hot-reload capability
  - Role-based access control for admin features
  - Advanced cooldown management per user
  - Command aliases with flexible naming
  - Mobile-optimized response formatting

- **Professional Auto-Features**: 
  - Aesthetic join/leave notifications optimized for mobile
  - Auto-reactions with intelligent cleanup
  - Error handling with graceful fallbacks
  - Temporary file management with auto-cleanup
  - Connection stability with retry mechanisms

- **AI-Powered Intelligence**: 
  - Context-aware conversations with memory
  - Advanced mathematical calculation processing
  - Programming assistance with code analysis
  - Educational content generation
  - Multi-language conversation support

- **Enterprise-Grade Monitoring**:
  - Express server with real-time dashboard
  - Performance metrics and uptime tracking
  - WebSocket connection monitoring
  - Error logging with detailed diagnostics
  - Resource usage optimization

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure the Bot**:
   - Edit `config.json` with your settings
   - Set your admin UID and preferred prefix

3. **Set up Facebook Authentication**:
   - Follow the C3C tutorial below to get your appstate
   - Place the appstate in `appstate.json`

4. **Run the Bot**:
   ```bash
   node index.js
   ```

5. **Verify Installation**:
   - Check console for successful login message
   - Test with "help" command in any group chat
   - Verify WebSocket connections for GAG tracker

## Configuration

### config.json Example:
```json
{
  "prefix": "!",
  "adminUID": ["your_facebook_user_id_here"]
}
```

### Advanced Configuration Options:
```json
{
  "prefix": "!",
  "adminUID": ["61577257754062"],
  "autoReact": true,
  "smartCommands": true,
  "gagTracking": true,
  "aiMode": "smart",
  "cooldownTime": 5000,
  "maxRetries": 3
}
```

## Troubleshooting

- **Issue:** Bot fails to log in or shows "ENOENT" error.
  - **Solution:** Check your `appstate.json` validity. Generate a new appstate using C3C method. Ensure all required files exist in the project directory.
  
- **Issue:** Smart commands not responding.
  - **Solution:** Verify that `nashPrefix: false` is set in command files. Check for typos in keyword detection functions. Test with simple phrases first.

- **Issue:** WebSocket connections failing for GAG tracker.
  - **Solution:** Check internet connectivity. Verify that the GAG stock API is accessible. Restart the bot to refresh connections.

- **Issue:** "shoti" command showing unhandled errors.
  - **Solution:** This has been fixed in the latest update with enhanced error handling. Update to the latest version and restart the bot.

- **Issue:** Join/Leave notifications not displaying properly on mobile.
  - **Solution:** Updated with mobile-optimized formatting. Messages are now designed specifically for mobile Messenger interface.

- **Issue:** Multiple help commands appearing.
  - **Solution:** Fixed in latest update - consolidated into single comprehensive help system.

# Facebook AppState C3C Tutorial 

## Overview
This project allows you to utilize the Facebook app state for your bot. Follow the instructions below to download the C3C extension and obtain your app state.

## Requirements
- **Kiwi Browser** (available on the Google Play Store)
- **C3C Extension** (available on GitHub)

## Step 1: Download the C3C Extension
1. **Download the C3C ZIP File**:
   - Go to the [C3C GitHub Releases page](https://github.com/c3cbot/c3c-ufc-utility/releases/tag/2.0.1)
   - Download the ZIP file of the latest release.

2. **Extract the ZIP File**:
   - Locate the downloaded ZIP file in your device's file manager and extract its contents.

## Step 2: Install the C3C Extension in Kiwi Browser
1. **Open Kiwi Browser**:
   - Launch the Kiwi Browser on your device.

2. **Access Extensions**:
   - Tap on the three-dot menu in the upper-right corner.
   - Select **Extensions** from the dropdown.

3. **Enable Developer Mode**:
   - Toggle the **Developer mode** option at the top right corner.

4. **Install the Extension**:
   - Tap on **Load unpacked** and select the extracted folder from the ZIP file.

## Step 3: Obtain Your Facebook AppState
1. **Log into Facebook**:
   - With the C3C extension installed, navigate to the Facebook website and log in to your account.

2. **Access AppState**:
   - Click on the C3C extension icon in the Kiwi Browser.
   - Use the extension to generate your app state.

3. **Copy the AppState**:
   - Once generated, copy the app state JSON data.

## Step 4: Use AppState in Your Project
1. **Replace AppState in Your Code**:
   - In your project, locate the `appstate.json` file.
   - Replace the entire content with the copied app state JSON data.

2. **Run Your Project**:
   - Start the project to see the bot in action using the app state.

## 📝 Security & Maintenance Notes
- Keep your app state secure and never share it publicly
- App states expire periodically (usually 1-2 weeks)
- Regenerate app state if you encounter frequent login failures
- Log into Facebook normally in a browser before generating new app state
- Use two-factor authentication on your Facebook account for security

## 🔧 Advanced Configuration & Customization

### Smart Command Customization
You can extend the smart command system by modifying detection patterns:

```javascript
// Custom keyword detection
function isCustomRequest(message) {
  const customKeywords = ['your', 'custom', 'keywords'];
  return customKeywords.some(keyword => message.includes(keyword));
}

// Advanced regex patterns
function isAdvancedRequest(message) {
  return /your-advanced-regex-pattern/i.test(message);
}
```

### WebSocket Integration
Add your own real-time features:

```javascript
const WebSocket = require('ws');

// Custom WebSocket handler
function setupCustomWebSocket(threadID) {
  const ws = new WebSocket('wss://your-api.com/data');
  
  ws.on('message', (data) => {
    // Process real-time data
    const response = design("Live Update", data);
    api.sendMessage(response, threadID);
  });
  
  return ws;
}
```

### AI Response Customization
Customize AI behavior and responses:

```javascript
// Custom AI prompt engineering
async function customAIHandler(prompt, context) {
  const enhancedPrompt = `
    Context: ${context}
    User Query: ${prompt}
    Instructions: Provide helpful, accurate responses with a friendly tone.
  `;
  
  // Your AI API call here
  return await getAIResponse(enhancedPrompt);
}
```

## 🤝 Support & Community

### Getting Help
- **Documentation**: Complete feature documentation available in this README
- **Community Support**: Join our developer community for assistance
- **Issue Reporting**: Report bugs or request features through GitHub issues
- **Updates**: Check for regular updates and new features

### Contributing
We welcome contributions! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Test your changes thoroughly
4. Submit a pull request with detailed description

### Support the Project
If NASHBOT helps you manage your Facebook groups effectively, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 📢 Sharing with other developers

---

## 🧠 Advanced Smart Command System Architecture

The smart command system in NASHBOT uses an intelligent priority-based detection mechanism with advanced natural language processing capabilities.

### 🔧 Core System Components

#### 1. Priority-Based Command Detection Engine
```javascript
// High Priority: Specific utility commands
- Facebook video downloads (URL detection)
- Instagram video download (URL detection)
- GAG stock tracking (WebSocket management)
- TikTok searches (API integration)
- Spotify search & download
- Contact and information requests

// Medium Priority: General functionality
- Video requests and media handling
- User identification and group management
- Notification broadcasting

// Low Priority: AI conversation
- Natural language questions
- Educational queries
- General conversation and chat
```

#### 2. Advanced Keyword Detection System
- **Multi-language Support**: Detects commands in various languages
- **Fuzzy Matching**: Handles typos and variations in command input
- **Context Analysis**: Understands conversation context and intent
- **Conflict Resolution**: Prevents command interference with smart prioritization

#### 3. Enhanced Cooldown Management
```javascript
const smartCooldowns = new Map();
// Individual user tracking with automatic cleanup
// Prevents spam while maintaining responsiveness
// Configurable cooldown periods per command type
```

#### 4. Professional Message Formatting
```javascript
function design(title, content) {
    return format({
        title,
        titleFont: "bold",
        contentFont: "none",
        titlePattern: "【 NASH 】{word} {emojis}",
        content,
    });
}
```

### 🎯 Intelligent Conflict Resolution Strategy

1. **Specific Pattern Matching**: Exact keyword matches receive highest priority
2. **Context Analysis**: Analyzes message context to prevent false positives
3. **Order of Operations**: Processes utility commands before conversational AI
4. **Fallback Mechanism**: Gracefully defaults to AI chat for unmatched queries
5. **Reply Context**: Maintains conversation context when replying to bot messages

### 📊 Performance & Reliability Features

- **Memory Optimization**: Efficient Map-based cooldown storage with auto-cleanup
- **Error Recovery**: Comprehensive try-catch blocks with graceful fallbacks
- **WebSocket Management**: Persistent connections with auto-reconnect capability
- **Mobile Optimization**: Responsive design for mobile Messenger interface
- **Real-Time Processing**: Sub-second response times with optimized detection algorithms

### 🆕 Latest Technical Improvements

- **Enhanced NLP**: Improved natural language processing with better intent recognition
- **Mobile-First Design**: Notifications and responses optimized for mobile viewing
- **Unified Command System**: Single comprehensive help system replacing multiple command lists
- **Advanced Error Handling**: Robust error management for all media and API operations

## 🚀 Top Contributors & Development Team

- **Joshua Apostol** - Lead Developer
- **Cyril Encenso** - Co-Lead Developer & WebSocket Implementation Expert, AI Integration Specialist

---

**NASHBOT** - Revolutionizing Facebook group management with intelligent AI assistance and real-time monitoring capabilities. Built with love for the developer community.


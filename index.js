const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const wiegine = require("ws3-fca");
const fs = require("fs");
const autoReact = require("./handle/autoReact");
// const unsendReact = require("./handle/unsendReact"); // Disabled due to ws3-fca library bug
const chalk = require("chalk");

const app = express();
const PORT = process.env.PORT || 3000;
const configPath = path.join(__dirname, "config.json");
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  // Validate config properties
  if (!config.prefix) config.prefix = "-";
  if (!Array.isArray(config.adminUID)) config.adminUID = [];

} catch (error) {
  console.error(
    chalk.bold.gray("[") + 
    chalk.bold.red("ERROR") + 
    chalk.bold.gray("] ") + 
    chalk.bold.redBright("Invalid config.json:", error.message)
  );
  process.exit(1);
}

app.use(bodyParser.json());
app.use(express.static("public"));

// Add proper web routes
app.get('/', (req, res) => {
  res.json({
    status: "online",
    name: "NASHBOT",
    version: config.version || "2.4.2",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    features: [
      "Smart Commands",
      "AI Integration", 
      "Real-time WebSocket",
      "Media Processing",
      "Group Management"
    ]
  });
});

app.get('/status', (req, res) => {
  res.json({
    bot: isLoggedIn ? "connected" : "disconnected",
    commands: global.NashBoT.commands.size,
    events: global.NashBoT.events.size,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

global.NashBoT = {
  commands: new Map(),
  events: new Map(),
  onlineUsers: new Map(),
  cooldowns: new Map(),
};

global.NashBot = {
  JOSHUA: "https://kaiz-apis.gleeze.com/"
};

// Add global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  // Filter out ws3-fca library errors to prevent spam
  if (reason && reason.message && reason.message.includes('Cannot read properties of undefined')) {
    console.log(
      chalk.bold.gray("[") + 
      chalk.bold.yellow("LIBRARY BUG") + 
      chalk.bold.gray("] ") + 
      chalk.bold.yellowBright("ws3-fca unsendMessage error ignored")
    );
    return;
  }

  console.error(
    chalk.bold.gray("[") + 
    chalk.bold.red("UNHANDLED REJECTION") + 
    chalk.bold.gray("] ") + 
    chalk.bold.redBright("Promise rejected:", reason)
  );
  // Don't crash the process
});

process.on('uncaughtException', (error) => {
  console.error(
    chalk.bold.gray("[") + 
    chalk.bold.red("UNCAUGHT EXCEPTION") + 
    chalk.bold.gray("] ") + 
    chalk.bold.redBright("Error:", error.message)
  );

  // Specific handling for ws3-fca library bugs
  if (error.message.includes('unsendMessage') || 
      error.message.includes('Cannot read properties of undefined') ||
      error.stack && error.stack.includes('ws3-fca')) {
    console.log(
      chalk.bold.gray("[") + 
      chalk.bold.yellow("LIBRARY BUG") + 
      chalk.bold.gray("] ") + 
      chalk.bold.yellowBright("ws3-fca library error ignored to prevent crash")
    );
    return; // Don't crash for library bugs
  }

  // Only crash for critical system errors
  process.exit(1);
});

let isLoggedIn = false;
let loginAttempts = 0;
const nax_retries = 5;
const interval = 5000;

const loadModules = (type) => {
  const folderPath = path.join(__dirname, "modules", type);
  const files = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

  console.log(chalk.bold.redBright(`──LOADING ${type.toUpperCase()}──●`));

  files.forEach(file => {
    try {
      const module = require(path.join(folderPath, file));
      if (module && module.name && module[type === "commands" ? "execute" : "onEvent"]) {
        module.nashPrefix = module.nashPrefix !== undefined ? module.nashPrefix : true;
        module.cooldowns = module.cooldowns || 0;
        global.NashBoT[type].set(module.name, module);

        if (type === "commands" && module.aliases && Array.isArray(module.aliases)) {
          module.aliases.forEach(alias => {
            global.NashBoT[type].set(alias, module);
          });
        }

        console.log(
          chalk.bold.gray("[") + 
          chalk.bold.cyan("INFO") + 
          chalk.bold.gray("] ") + 
          chalk.bold.green(`Loaded ${type.slice(0, -1)}: `) + 
          chalk.bold.magenta(module.name)
        );
      } else {
        console.log(
          chalk.bold.gray("[") + 
          chalk.bold.yellow("WARN") + 
          chalk.bold.gray("] ") + 
          chalk.bold.yellowBright(`Invalid ${type.slice(0, -1)} structure: ${file}`)
        );
      }
    } catch (error) {
      console.error(
        chalk.bold.gray("[") + 
        chalk.bold.red("ERROR") + 
        chalk.bold.gray("] ") + 
        chalk.bold.redBright(`Failed to load ${file}:`, error.message)
      );
    }
  });
};

const relogin = async () => {
  if (isLoggedIn) return;

  const appStatePath = path.join(__dirname, "appstate.json");
  if (fs.existsSync(appStatePath)) {
    try {
      const appState = JSON.parse(fs.readFileSync(appStatePath, "utf8"));

      const loginTimeout = setTimeout(() => {
        console.error(
          chalk.bold.gray("[") + 
          chalk.bold.red("TIMEOUT") + 
          chalk.bold.gray("] ") + 
          chalk.bold.redBright("Login timeout - retrying...")
        );
        retryLogin();
      }, 30000); 

      wiegine.login(appState, {}, (err, api) => {
        clearTimeout(loginTimeout);

        if (err) {
          console.error(
            chalk.bold.gray("[") + 
            chalk.bold.red("ERROR") + 
            chalk.bold.gray("] ") + 
            chalk.bold.redBright("Failed to auto-login:", err.message)
          );
          retryLogin();
          return;
        }
        const cuid = api.getCurrentUserID();
        global.NashBoT.onlineUsers.set(cuid, { userID: cuid, prefix: config.prefix });
        setupBot(api, config.prefix);
        isLoggedIn = true;
        loginAttempts = 0;
      });
    } catch (error) {
      console.error(
        chalk.bold.gray("[") + 
        chalk.bold.red("ERROR") + 
        chalk.bold.gray("] ") + 
        chalk.bold.redBright("Invalid appstate.json:", error.message)
      );
      retryLogin();
    }
  } else {
    console.error(
      chalk.bold.gray("[") + 
      chalk.bold.red("ERROR") + 
      chalk.bold.gray("] ") + 
      chalk.bold.redBright("appstate.json not found")
    );
  }
};

const retryLogin = () => {
  if (loginAttempts >= nax_retries) {
    console.error(
      chalk.bold.gray("[") + 
      chalk.bold.red("ERROR") + 
      chalk.bold.gray("] ") + 
      chalk.bold.redBright("Max login attempts reached. Please check your appstate file.")
    );
    return;
  }

  loginAttempts++;
  console.log(
    chalk.bold.gray("[") + 
    chalk.bold.yellow("RETRY") + 
    chalk.bold.gray("] ") + 
    chalk.bold.yellowBright(`Retrying login attempt ${loginAttempts} of ${nax_retries}...`)
  );

  setTimeout(relogin, interval);
};

const setupBot = (api, prefix) => {
  api.setOptions({
    forceLogin: false,
    selfListen: false,
    autoReconnect: false,
    listenEvents: true,
    logLevel: "silent",
    updatePresence: false,
    online: true,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });

  api.listenMqtt((err, event) => {
    if (err) {
      console.error(
        chalk.bold.gray("[") + 
        chalk.bold.red("ERROR") + 
        chalk.bold.gray("] ") + 
        chalk.bold.redBright("Connection error detected, attempting relogin...")
      );
      isLoggedIn = false;
      retryLogin();
      return;
    }

    handleMessage(api, event, prefix);
    handleEvent(api, event, prefix);
    autoReact(api, event);
    // unsendReact(api, event); // Disabled due to ws3-fca library bug
  });

  setInterval(() => {
    api.getFriendsList(() => console.log(
      chalk.bold.gray("[") + 
      chalk.bold.cyan("INFO") + 
      chalk.bold.gray("] ") + 
      chalk.bold.green("Keep-alive signal sent")
    ));
  }, 1000 * 60 * 45);
};

const handleEvent = async (api, event, prefix) => {
  const { events } = global.NashBoT;
  try {
    for (const { onEvent } of events.values()) {
      await onEvent({ prefix, api, event });
    }
  } catch (err) {
    console.error(
      chalk.bold.gray("[") + 
      chalk.bold.red("ERROR") + 
      chalk.bold.gray("] ") + 
      chalk.bold.redBright("Event handler error:")
    );
  }
};

const handleMessage = async (api, event, prefix) => {
  if (!event.body) return;

  // Log all user messages to console with aesthetic formatting
  try {
    const senderInfo = await api.getUserInfo(event.senderID);
    const threadInfo = await api.getThreadInfo(event.threadID);
    const senderName = senderInfo[event.senderID]?.name || "Unknown User";
    const threadName = threadInfo.threadName || "Unknown Group";
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Manila',
      hour12: true,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Aesthetic message logging with visual separators
    console.log(chalk.bold.gray("╭─────────────────────────────────────────────────────────────╮"));
    console.log(
      chalk.bold.gray("│ ") + 
      chalk.bold.blue("💬 MESSAGE RECEIVED") + 
      chalk.bold.gray(" ".repeat(35)) + 
      chalk.bold.gray("│")
    );
    console.log(chalk.bold.gray("├─────────────────────────────────────────────────────────────┤"));

    // User Information with emojis and colors
    console.log(
      chalk.bold.gray("│ ") + 
      chalk.bold.cyan("👤 User: ") + 
      chalk.bold.white(`${senderName}`) + 
      chalk.bold.gray(" ".repeat(Math.max(0, 44 - senderName.length))) + 
      chalk.bold.gray("│")
    );

    // Group Information
    const truncatedThreadName = threadName.length > 40 ? threadName.substring(0, 40) + "..." : threadName;
    console.log(
      chalk.bold.gray("│ ") + 
      chalk.bold.yellow("🏠 Group: ") + 
      chalk.bold.white(`${truncatedThreadName}`) + 
      chalk.bold.gray(" ".repeat(Math.max(0, 42 - truncatedThreadName.length))) + 
      chalk.bold.gray("│")
    );

    // Timestamp Information
    console.log(
      chalk.bold.gray("│ ") + 
      chalk.bold.green("⏰ Time: ") + 
      chalk.bold.magenta(`${timestamp}`) + 
      chalk.bold.gray(" ".repeat(Math.max(0, 43 - timestamp.length))) + 
      chalk.bold.gray("│")
    );

    console.log(chalk.bold.gray("├─────────────────────────────────────────────────────────────┤"));

    // Message Content with word wrapping
    const messageLines = event.body.match(/.{1,50}/g) || [event.body];
    messageLines.forEach((line, index) => {
      if (index === 0) {
        console.log(
          chalk.bold.gray("│ ") + 
          chalk.bold.blue("📝 Message: ") + 
          chalk.bold.white(`${line}`) + 
          chalk.bold.gray(" ".repeat(Math.max(0, 40 - line.length))) + 
          chalk.bold.gray("│")
        );
      } else {
        console.log(
          chalk.bold.gray("│ ") + 
          chalk.bold.gray("           ") + 
          chalk.bold.white(`${line}`) + 
          chalk.bold.gray(" ".repeat(Math.max(0, 40 - line.length))) + 
          chalk.bold.gray("│")
        );
      }
    });

    console.log(chalk.bold.gray("├─────────────────────────────────────────────────────────────┤"));

    // Technical Information
    console.log(
      chalk.bold.gray("│ ") + 
      chalk.bold.red("🆔 UID: ") + 
      chalk.bold.white(`${event.senderID}`) + 
      chalk.bold.gray(" | ") + 
      chalk.bold.red("TID: ") + 
      chalk.bold.white(`${event.threadID}`) + 
      chalk.bold.gray(" ".repeat(Math.max(0, 20 - event.threadID.length))) + 
      chalk.bold.gray("│")
    );

    console.log(chalk.bold.gray("╰─────────────────────────────────────────────────────────────╯"));
    console.log(); // Empty line for spacing

  } catch (error) {
    // Enhanced fallback logging with aesthetic design
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Manila',
      hour12: true
    });

    console.log(chalk.bold.gray("╭─────────────────────────────────────────────────────────────╮"));
    console.log(
      chalk.bold.gray("│ ") + 
      chalk.bold.red("⚠️  MESSAGE LOG (Limited Info)") + 
      chalk.bold.gray(" ".repeat(25)) + 
      chalk.bold.gray("│")
    );
    console.log(chalk.bold.gray("├─────────────────────────────────────────────────────────────┤"));
    console.log(
      chalk.bold.gray("│ ") + 
      chalk.bold.red("🆔 UID: ") + 
      chalk.bold.white(`${event.senderID}`) + 
      chalk.bold.gray(" | ") + 
      chalk.bold.red("TID: ") + 
      chalk.bold.white(`${event.threadID}`) + 
      chalk.bold.gray(" ".repeat(Math.max(0, 20 - event.threadID.length))) + 
      chalk.bold.gray("│")
    );
    console.log(
      chalk.bold.gray("│ ") + 
      chalk.bold.green("⏰ Time: ") + 
      chalk.bold.magenta(`${timestamp}`) + 
      chalk.bold.gray(" ".repeat(Math.max(0, 43 - timestamp.length))) + 
      chalk.bold.gray("│")
    );
    console.log(
      chalk.bold.gray("│ ") + 
      chalk.bold.blue("📝 Message: ") + 
      chalk.bold.white(`${event.body.substring(0, 40)}${event.body.length > 40 ? "..." : ""}`) + 
      chalk.bold.gray(" ".repeat(Math.max(0, 43 - Math.min(event.body.length, 43)))) + 
      chalk.bold.gray("│")
    );
    console.log(chalk.bold.gray("╰─────────────────────────────────────────────────────────────╯"));
    console.log(); // Empty line for spacing
  }

  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

  let [command, ...args] = event.body.trim().split(" ");
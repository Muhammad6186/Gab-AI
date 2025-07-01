const unsendReact = async (api, event) => {
  if (event.type === "message_reaction") {
    if (event.senderID === api.getCurrentUserID() && event.reaction === "👍") {
      try {
        // Add validation before attempting unsend
        if (!event.messageID || typeof event.messageID !== 'string') {
          console.log("Invalid messageID for unsend operation");
          return;
        }

        // Add a small delay to ensure message exists
        setTimeout(async () => {
          try {
            await api.unsendMessage(event.messageID);
          } catch (error) {
            // Silently handle all unsend errors to prevent crashes
            console.log("Unsend operation failed (ignored):", error.message);
          }
        }, 500);
        
      } catch (error) {
        console.log("Error in unsendReact:", error.message);
        // Ignore the error and continue - don't crash the bot
        return;
      }
    }
  }
};

module.exports = unsendReact;

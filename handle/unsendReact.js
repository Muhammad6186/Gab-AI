const unsendReact = async (api, event) => {
  if (event.type === "message_reaction") {
    if (event.senderID === api.getCurrentUserID() && event.reaction === "👍") {
      try {
        return api.unsendMessage(event.messageID);
      } catch (error) {
        console.error("Error unsending message:", error.message);
        // Ignore the error and continue - don't crash the bot
        return;
      }
    }
  }
};

module.exports = unsendReact;

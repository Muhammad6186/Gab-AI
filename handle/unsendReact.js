const unsendReact = async (api, event) => {
  // Temporarily disable unsend functionality due to ws3-fca library bug
  // The library has an unhandled error when trying to unsend messages
  // This prevents the bot from crashing

  if (event.type === "message_reaction") {
    if (event.senderID === api.getCurrentUserID() && event.reaction === "👍") {
      // Log the attempt but don't execute to prevent crashes
      console.log("Unsend reaction detected - functionality disabled to prevent crashes");
      return;
    }
  }
};

module.exports = unsendReact;
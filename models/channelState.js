const { Schema, model } = require("mongoose");

module.exports = model("channelStates", new Schema({
    id: { type: String, default: "" },
    ownerID: { type: String, default: "" },
    type: { type: String, default: "" },
    control: { type: String, default: "" },
    chat: { type: String, default: "" },
}));
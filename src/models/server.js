const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serverSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },

    owner: {
        type: String,
        required: false,
    },

    icon: {
        type: String,
        required: false,
    },

    name: {
        type: String,
        required: false,
    },

    
    
    


}, { timestamps: true });

module.exports = mongoose.model("Servers", serverSchema);
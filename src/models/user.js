const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    
    userId: {
        type: String,
        required: true,
    },

    avatar: {
        type: String,
        required: false,
    },

    username: {
        type: String,
        required: false,
    },

    discriminator: {
        type: String,
        required: false,
    },

    favoriteAnime: {
        type: String,
        required: false,
    },

    anime: {
        type: Array,
        required: false,
        _type: String,
        _id: String,
    },

    guilds: {
        type: Array,
        required: false,
    },

    bio: {
        type: String,
        required: false,
        default: "This user has not set a bio yet!",
    },

    badges: {
        type: Array,
        required: false,
    },

    color: {
        type: String,
        required: false,
        default: "#000000",
    },

    banner: {
        type: String,
        required: false,
        default: "https://thicc.mywaifulist.moe/series/magical-girl-lyrical-nanoha/Y8KHgqrP0NEEKWgrXlawz3EloEFaxghKlq7pwqPp.png",
    },

    messages: {
        type: Number,
        required: false,
        default: 0,
    },

    displayName: {
        type: String,
        required: false,
    },

    pronouns: {
        type: String,
        required: false,
        default: "They/Them",
    },


}, { timestamps: true });

module.exports = mongoose.model("Users", userSchema);
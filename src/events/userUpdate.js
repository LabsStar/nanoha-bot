const userSchema = require('../models/user.js');

module.exports = {
    name: "userUpdate",
    once: false,
    async execute(oldUser, newUser) {

        const checkIfAnimated = (avatar) => {
            if (avatar.startsWith("a_")) return `https://cdn.discordapp.com/avatars/${newUser.id}/${avatar}.gif`;
            else return `https://cdn.discordapp.com/avatars/${newUser.id}/${avatar}.png`;
        };

        const user = await userSchema.findOne({ userId: oldUser.id });

        if (!user) return;

        if (oldUser.username !== newUser.username) {
            user.username = newUser.username;
            user.save();
        }

        if (oldUser.discriminator !== newUser.discriminator) {
            user.discriminator = newUser.discriminator;
            user.save();
        }

        if (oldUser.avatar !== newUser.avatar) {
            user.avatar = checkIfAnimated(newUser.avatar);
            user.save();
        }
      

    },
};
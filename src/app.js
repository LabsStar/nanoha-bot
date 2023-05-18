const { Client, Intents, Collection, MessageEmbed, MessageActionRow, MessageButton, MessageCollector } = require("discord.js");
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    allowedMentions: { parse: ["users", "roles"], repliedUser: true },
});

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
client.commands = new Collection();

const Logger = require("./utils/Logger.js");
const logger = new Logger();

client.logger = logger;



const commandFolders = fs.readdirSync(path.join(__dirname, "commands"));

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, "commands", folder)).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(path.join(__dirname, "commands", folder, file));
        client.commands.set(command.data.name, command);
    }
}

const eventFiles = fs.readdirSync(path.join(__dirname, "events")).filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(path.join(__dirname, "events", file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}


client.formatDate = (date) => {
    return new Date(date).toLocaleString();
};

client.formatNumber = (number, returnAsInt) => {
    if (!number) return '0';

    const numberRegex = /\B(?=(\d{3})+(?!\d))/g;
    
    //? I don't know why I did this but it works (I think)
    if (returnAsInt) {
        return parseInt(number.toString().replace(numberRegex, ','));
    }

    return number.toString().replace(numberRegex, ',');
}

client.topMessages = async () => {
    const userSchema = require("./models/user.js");

    // Only show users who have sent at least 1 message
    const users = await userSchema.find({ messages: { $gte: 1 } }).sort({ messages: -1 }).limit(10);

    return users || [];
};

//? I don't know why I named this function this...
client.getPrettyGirls = async () => {
    const girls = [
        "https://img5.goodfon.com/wallpaper/nbig/3/1d/anime-anime-girl-cute-girl.jpg",
        "https://www.entoin.com/images/cute55.jpg",
    ];

    const randomGirl = girls[Math.floor(Math.random() * girls.length)];
    return randomGirl;
};

client.getStaff = async () => {
    const server = await client.guilds.fetch(process.env.guildId);

    const staff = server.roles.cache.get(process.env.staffRoleId);

    const createTopRole = (roleName) => {
        // Remove any emojis or special characters from the role name
        const roleNameRegex = /[^a-zA-Z0-9 ]/g;
        const roleNameNoSpecialChars = roleName.replace(roleNameRegex, '');

        return roleNameNoSpecialChars;
    };

    const staffMembers = staff.members.map(member => {
        return {
            id: member.id,
            tag: member.user.tag,
            avatar: member.user.displayAvatarURL({ dynamic: true }),
            username: member.user.username,
            discriminator: member.user.discriminator,
            topRole: createTopRole(member.roles.highest.name),
        }
    });

    return staffMembers;
};


client.login(process.env.token);

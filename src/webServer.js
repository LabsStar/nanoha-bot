const express = require("express");
const app = express();
const cron = require("node-cron");
const bodyParser = require("body-parser");
const { URLSearchParams } = require('url');
const fetch = require("node-fetch");
const cookieParser = require("cookie-parser");
const path = require("path");
const ejs = require("ejs");
const axios = require('axios').default;
const fs = require("fs");
const malScraper = require("mal-scraper");
const AnimeApi = require("./services/AnimeApi");
const animeApi = new AnimeApi();
const userSchema = require("./models/user");
const querystring = require('querystring');
const { v4: uuidv4 } = require('uuid');

const clientId = process.env.mal_client_id;
const clientSecret = process.env.mal_client_secret;
const redirectUri = 'http://localhost/api/verify/mal';


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let topPopularAnime = [];
let topAiringAnime = [];

async function getBotAvatar() {
    const options = {
        method: "GET",
        url: "https://discord.com/api/v9/users/1107467362212528189",
        headers: {
            "Authorization": `Bot ${process.env.token}`,
        },
    };

    const response = await axios.request(options);

    const avatarFormat = response.data.avatar.startsWith("a_") ? "gif" : "png";

    return `https://cdn.discordapp.com/avatars/1107467362212528189/${response.data.avatar}.${avatarFormat}?size=1024`;

}

// Temporary storage for state values
const stateStore = new Map();

// Generate a unique state value for each authentication request
function generateState() {
    const state = uuidv4();
    stateStore.set(state, true);
    return state;
}


// Custom Middleware
app.use(async (req, res, next) => {
    if (req.path === "/") return res.redirect("/home");
    if (req.path === "/api") {
        if (!req.headers["authorization"]) return res.redirect("/faq"); // /api/docs
        const token = req.headers["authorization"].split(" ")[1];
        if (!token) return res.redirect("/faq");

        next();
    }

    if (req.path === "/favicon.ico" || req.path === "/favicon") return res.redirect(await getBotAvatar());

    next();

});

function webServer(client) {

    app.get("/home", async (req, res) => {
        console.log(await topPopularAnime);
        res.status(200).render("home", {
            discord_client: client,
            popular: await topPopularAnime,
            top_messages: await client.topMessages(),
            topAiring: await topAiringAnime,
            logo: await client.getPrettyGirls(),
        });
    });

    app.get("/anime/:id", async (req, res) => {
        const animeId = req.params.id;

        if (!animeId) return res.status(404).render("404", { discord_client: client });

        const anime = await malScraper.getInfoFromURL(`https://myanimelist.net/anime/${animeId}`);
        malScraper.getStats(animeId).then((data) => {
            console.log(data);
        });

        if (!anime) return res.status(404).render("404", { discord_client: client });


        await res.status(200).render("anime", {
            discord_client: client,
            anime: anime,
        });
    });

    app.get("/news", async (req, res) => {
        const news = await malScraper.getNewsNoDetails(8)

        if (!news) return res.status(404).render("404", { discord_client: client });

        res.status(200).render("news", {
            discord_client: client,
            news: news,
        });
    });

    app.get("/staff", async (req, res) => {
        const staff = await client.getStaff();

        if (!staff) return res.status(404).render("404", { discord_client: client });

        console.log(staff);

        res.status(200).render("staff", {
            discord_client: client,
            staff: staff,
        });
    });


    // Redirect users to the MyAnimeList authorization URL
    app.get('/auth/login', (req, res) => {
        if (req.query.url === "discord") {
            res.redirect(`${process.env.login}`);
        }
        else if (req.query.url === "mal") {
            const state = generateState();
            const authorizationUrl = 'https://myanimelist.net/v1/oauth2/authorize?' +
                querystring.stringify({
                    response_type: 'code',
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    state: state,
                    code_challenge_method: 'S256',
                    code_challenge: '1234567890123456789012345678901234567890123',
                });

            res.redirect(authorizationUrl);
        }
        else {
            res.redirect("/home");
        }
    });

    // Handle the callback after the user grants authorization
    app.get('/api/verify/:url', async (req, res) => {
        const url = req.params.url;
        if (url === "mal") {
            const { code, state } = req.query;

            // Verify the state value to prevent CSRF attacks
            if (!stateStore.has(state)) {
                return res.status(401).send('Invalid state value');
            }

            // Exchange the authorization code for an access token
            try {
                const tokenResponse = await axios.post('https://myanimelist.net/v1/oauth2/token', {
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code,
                    redirect_uri: redirectUri,
                });

                const { access_token, expires_in, refresh_token } = tokenResponse.data;

                console.log('Received access token:', access_token);
                console.log('Received refresh token:', refresh_token);
                console.log('Expires in:', expires_in);

                // We can use the access token to make API calls on behalf of the user
                const userResponse = await axios.get('https://myanimelist.net/v1/users/@me', {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });

                const userData = userResponse.data;
                console.log('User data:', userData);

                res.send('Authentication successful!');
            } catch (error) {
                console.error('Error during token exchange:', error.response.data);
                res.status(500).send('Failed to authenticate');
            }
        }
        else if (url === "discord") {
            const data_1 = new URLSearchParams();
            data_1.append('client_id', client.user.id);
            data_1.append('client_secret', process.env.discord_secret);
            data_1.append('grant_type', 'authorization_code');
            data_1.append('redirect_uri', `${process.env.redirectUri}`);
            data_1.append('scope', 'identify, email');
            data_1.append('code', req.query.code);

            fetch('https://discord.com/api/v6/oauth2/token', { method: "POST", body: data_1 }).then(response => response.json()).then(data => {
                const options = {
                    method: 'GET',
                    url: 'https://discord.com/api/users/@me',
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`
                    }
                }

                axios
                    .get(options.url, { headers: options.headers })
                    .then(async (response) => {
                        const data = response.data;

                        const user = await userSchema.findOne({ userId: data.id }).exec();

                        if (!user) {
                            const newUser = new userSchema({
                                userId: data.id,
                                username: data.username,
                                discriminator: data.discriminator,
                                avatar: `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.${data.avatar.startsWith("a_") ? "gif" : "png"}`,
                                guilds: [],
                                anime: [],
                                favoriteAnime: null,
                            });

                            await newUser.save().catch((err) => {
                                console.log(err);
                            });

                            console.log(`Created new user ${data.username}#${data.discriminator}. ID: ${data.id}`);
                        }


                        res.cookie("user", data, {
                            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
                            httpOnly: true,
                        });



                        await userSchema.findOne({ userId: data.id }).exec().then((user) => {
                            user.save();
                        });


                        console.log(`User ${data.username}#${data.discriminator} logged in.`)

                        res.redirect(`/user/${data.id}`);

                    })
                    .catch((err) => {
                        console.log(err);
                    });
            });
        }
    });

    app.get("/logout", (req, res) => {
        res.clearCookie("user");
        res.redirect("/home");
    });

    app.get("/faq", (req, res) => {
        res.render("faq", { discord_client: client, query: req.query.q });
    });

    app.get("/user/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!id)
                return res
                    .status(404)
                    .render("error", { discord_client: client, message: "No user id provided" });

            const user = await client.users.fetch(id);

            if (!user)
                return res
                    .status(404)
                    .render("error", { discord_client: client, message: "No user found" });

            const userDB = await userSchema.findOne({ id: user.id });

            if (!userDB)
                return res
                    .status(404)
                    .render("error", { discord_client: client, message: "No user found" });

            const fetchAnimeInfo = async (anime) => {
                return malScraper.getInfoFromURL(`https://myanimelist.net/anime/${anime._id}`);
            };

            const animeTypes = ["watching", "completed", "dropped", "onhold", "plantowatch"];

            const animePromises = animeTypes.map((type) =>
                Promise.all(
                    userDB.anime
                        .filter((anime) => anime._type === type)
                        .map(fetchAnimeInfo)
                )
            );

            const [watching_anime, completed_anime, dropped_anime, on_hold_anime, plan_to_watch_anime] =
                await Promise.all(animePromises);

            res.status(200).render("user", {
                discord_client: client,
                user: userDB,
                watching_anime: watching_anime || [],
                completed_anime: completed_anime || [],
                dropped_anime: dropped_anime || [],
                on_hold_anime: on_hold_anime || [],
                plan_to_watch_anime: plan_to_watch_anime || [],
            });
        } catch (error) {
            console.error("An error occurred:", error);
            res
                .status(500)
                .render("error", { discord_client: client, message: `An error occurred: ${error}` });
        }
    });


    app.get("/api/v1/status", (req, res) => {
        res.status(200).json({ status: "offline", date: new Date("2023-06-25T00:00:00.000+00:00").toLocaleDateString({ timeZone: "UTC" }) });
    });



    app.get("/api/user/:id/:field", async (req, res) => {
        const id = req.params.id;
        const field = req.params.field;

        if (field === "avatar") {
            const user = await client.users.fetch(id);

            const avatar = user.displayAvatarURL({ dynamic: true, size: 1024 });

            res.redirect(avatar);

        }
        if (field === "username") {
            const user = await client.users.fetch(id);

            const username = user.username.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            res.send(username);
        }
    });

    app.listen(process.env.PORT || 80, async () => {
        client.logger.log(`Server is online and listening on port ${process.env.PORT || 80}`, "webserver");

        const popularAnime = async () => {
            topPopularAnime = await animeApi.getPopular(5, true);
            client.logger.log("Updated popular anime", "AnimeApi");
            cron.schedule("*/5 * * * *", async () => {
                topPopularAnime = await animeApi.getPopular(5, true);

                client.logger.log("Updated popular anime", "AnimeApi");
            });
        }

        const topAiring = async () => {
            topAiringAnime = await animeApi.getTopAiring(5, true);
            client.logger.log("Updated top airing anime", "AnimeApi");
            cron.schedule("*/5 * * * *", async () => {
                topAiringAnime = await animeApi.getTopAiring(5, true);

                client.logger.log("Updated top airing anime", "AnimeApi");
            });
        }

        await popularAnime();
        await topAiring();
    });
}

module.exports = webServer;
const axios = require("axios");
const malScraper = require("mal-scraper");

const BASE_URL = "https://webdis-4k6u.onrender.com";

class AnimeApi {
    constructor() {}

    async getAnime(id) {
        if (!id) throw new Error("No id provided");

        const response = await axios.get(`${BASE_URL}/anime-details/${id}`);

        return response.data;
    }

    async getPopular(amount, info) {
        if (!amount) amount = 8;
    
        if (typeof amount !== "number") throw new TypeError("Amount must be a number");
    
        try {
            const response = await axios.get(`${BASE_URL}/popular`);
            const r = response.data.slice(0, amount);
    
            if (info) {
                const anime = [];
    
                for (const animeId of r) {
                    const a = await this.getAnime(animeId.animeId);
                    const animeInfo = await malScraper.getInfoFromName(a.animeTitle);
                    anime.push(animeInfo);
                }
    
                return Promise.all(anime);
            }
    
            return r;
    
        } catch (err) {
            console.error(err);
        }
    }

    async getTopAiring(amount, info) {
        const response = await axios.get(`${BASE_URL}/top-airing`);
        const r = response.data.slice(0, amount);

        if (info) {
            const anime = [];

            for (const animeId of r) {
                const a = await this.getAnime(animeId.animeId);
                const animeInfo = await malScraper.getInfoFromName(a.animeTitle);
                anime.push(animeInfo);
            }

            return Promise.all(anime);
        }

        return r;

    } catch (err) {
        console.error(err);
    }
}

module.exports = AnimeApi;

import * as cheerio from "cheerio";
import axios from "axios";

const vods = ["netflix", "hbo_max", "canal_plus", "disney"];
const headers = ["Title", "VOD Title Service", "Rating"];

vods.forEach((platform) => {
  movieData(platform);
});

// gathering information about movies
async function movieData(platform) {
  const website = await axios.get(
    `https://filmweb.pl/ranking/vod/${platform}/film/2023`
  );
  const $ = cheerio.load(website.data);

  // get data about title, rating
  const movies = new Map();
  $(".rankingType__card")
    .slice(0, 10)
    .each((i, el) => {
      const movieTitle = $(el).find(".rankingType__title").text();
      const movieRating = $(el).find(".rankingType__rate--value").text();
      movies.set(movieTitle, [movieTitle, platform, movieRating]);
    });

  console.log(movies);
  // get csv
}

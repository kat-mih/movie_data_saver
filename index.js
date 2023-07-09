import * as cheerio from "cheerio";
import axios from "axios";

// gathering information about movies
async function fetchMovieData(platform) {
  try {
    const website = await axios.get(
      `https://filmweb.pl/ranking/vod/${platform}/film/2023`
    );
    const $ = cheerio.load(website.data);

    // get data about title, rating
    const movies = [];
    $(".rankingType__card")
      .slice(0, 10)
      .each((i, el) => {
        const movieTitle = $(el).find(".rankingType__title").text();
        const movieRating = $(el)
          .find(".rankingType__rate--value")
          .text()
          .replace(",", ".");
        // fullfill an array with the objects
        movies.push({
          title: movieTitle,
          vod: platform,
          rating: parseFloat(movieRating),
        });
      });

    return movies;
  } catch (error) {
    console.error("Error:", error);
  }
}

// sort and filtering gathered object with the movie data
async function scrapeMovies() {
  try {
    // list of VODs platforms
    const vods = ["netflix", "hbo_max", "canal_plus", "disney"];
    const headers = ["Title", "VOD Title Service", "Rating"];

    const promises = vods.map((platform) => fetchMovieData(platform));
    const results = await Promise.all(promises);
    const scrappedData = results.flat();

    // sorting an movies by rating (or title)
    scrappedData.sort((movie1, movie2) => {
      return (
        movie2.rating - movie1.rating ||
        movie1.title.localeCompare(movie2.title)
      );
    });

    // unique movie titles
    const result = new Map();
    scrappedData.forEach((movie) =>
      result.set(movie.title, Object.values(movie))
    );

    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

scrapeMovies();

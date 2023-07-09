import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";

// gathering information about movies
async function fetchMovieData(platform) {
  try {
    const website = await axios.get(
      `https://filmweb.pl/ranking/vod/${platform[0]}/film/2023`
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
          Title: movieTitle,
          "VOD service name": platform[1],
          Rating: parseFloat(movieRating),
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
    const vodServices = {
      netflix: "Netflix",
      hbo_max: "HBO Max",
      canal_plus: "Canal+",
      disney: "Disney+",
    };

    const promises = Object.entries(vodServices).map((platform) =>
      fetchMovieData(platform)
    );
    const results = await Promise.all(promises);
    const scrappedData = results.flat();

    // sorting an movies by rating (or title)
    scrappedData.sort((movie1, movie2) => {
      return (
        movie2["Rating"] - movie1["Rating"] ||
        movie1["Title"].localeCompare(movie2["Title"])
      );
    });

    // unique movie titles
    const uniqueMovieMap = new Map();
    scrappedData.forEach((movie) => uniqueMovieMap.set(movie["Title"], movie));

    return uniqueMovieMap;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function csvCreator() {
  const movieMap = await scrapeMovies();
  const csvMovieContent = createCsvContent(Array.from(movieMap.values()));

  // write CSV content to a file
  fs.writeFile("movies.csv", csvMovieContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing CSV file:", err);
      return;
    }
    console.log("CSV file has been created!");
  });
}

function createCsvContent(data) {
  // extract column headers from the first object
  const headers = Object.keys(data[0]);

  // create CSV header row
  const csvHeader = headers.join(",");

  // create CSV data rows
  const csvRows = data.map((row) => {
    const values = Object.values(row).join(",");
    return values;
  });

  // combine header row and data rows
  const csvContent = [csvHeader, ...csvRows].join("\n");

  return csvContent;
}

csvCreator();

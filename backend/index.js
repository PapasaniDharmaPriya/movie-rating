const express = require('express');
const db = require('./db');
const fs = require("fs");
// const fastcsv = require("fast-csv");
const { parse } = require("csv-parse");
const app = express();
/* api to insert values into table from csv
*/
app.get('/insert-values-from-csv', async (req, res) => {
  try {
    let csvData = [];
    fs.createReadStream("./data/ratings.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        csvData.push(row);
      })
      .on("end", function () {
        csvData.shift();
        // const query =
        //   "INSERT INTO movies (id, title, year, country, genre, director, minutes, poster) VALUES ($1, $2, $3, $4,$5,$6,$7,$8)";
        const query = "INSERT INTO ratings (rater_id, movie_id, rating, time) VALUES ($1, $2, $3, $4)"
        console.log(csvData);
        csvData.forEach(row => {
          db.query(query, row, (err, resp) => {
            if (err) {
              return resp.status(500).send("some error occured while inserting")
            }
          });
        });
      });
    const result = await db.query('select * from ratings');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


/* API to get Top 5 Movie Titles: Sort and print the top 5 movie titles based on the following criteria:
 Duration
 Year of Release
 Average rating (consider movies with minimum 5 ratings)
 Number of ratings given*/
app.get('/sort-movies', async (req, res) => {
  try {

    const query = `WITH MovieRatings AS (
                    SELECT
                        m.title,
                        m.minutes,
                        m.year,
                        AVG(r.rating) AS average_rating,
                        COUNT(r.rating) AS rating_count
                    FROM
                        movies m
                        JOIN ratings r ON m.id = r.movie_id
                    GROUP BY
                        m.id, m.title
                    HAVING
                        COUNT(r.rating) >= 5
                    )
                    SELECT
                        title
                    FROM
                        MovieRatings
                    ORDER BY
                        minutes DESC,
                        year DESC,
                        average_rating DESC,
                        rating_count DESC
                    LIMIT 5;
                    `;
    db.query(query, (err, resp) => {
      if (err) {
        return res.status(500).send("some error occured while executing query")
      }
      else if (resp) {
        const titles = resp.rows.map(movie => movie.title);
        res.send(titles);
      }

    })

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

/* to get b. Number of Unique Raters: */
app.get('/get-unique-raters', async (req, res) => {
  try {
    const query = "SELECT COUNT(DISTINCT(rater_id)) from ratings";
    db.query(query, (err, resp) => {
      if (err) {
        return res.status(500).send("some error occured while executing query")
      }
      else if (resp) {
        res.send(resp.rows[0].count);
      }

    })
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/top-rater-ids', async (req, res) => {
  try {

    const query = `WITH RaterStats AS (
                    SELECT
                        rater_id,
                        COUNT(DISTINCT movie_id) AS movies_rated,
                        AVG(rating) AS average_rating
                    FROM
                        ratings
                    GROUP BY
                        rater_id
                    HAVING
                        COUNT(DISTINCT movie_id) >= 5
                    )
                    SELECT
                        rater_id,
                        movies_rated,
                        average_rating
                    FROM
                        RaterStats
                    ORDER BY
                        movies_rated DESC,
                        average_rating DESC
                    LIMIT 5;
                    `;
    db.query(query, (err, resp) => {
      if (err) {
        return res.status(500).send("some error occured while executing query")
      }
      else if (resp) {
        const titles = resp.rows.map(movie => movie.title);
        res.send(titles);
      }

    })

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/top-rating-movie', async (req, res) => {
  try {

    const query = `WITH TopRatedMovies AS (
                  SELECT
                      m.title,
                      AVG(r.rating) AS average_rating,
                      COUNT(r.*) AS rating_count
                  FROM
                      movies m
                      JOIN ratings r ON m.id = r.movie_id
                  WHERE
                      m.director = 'Michael Bay'
                      AND m.genre = 'Comedy'
                      AND m.year = 2013
                      AND m.country = 'India'
                  GROUP BY
                      m.id, m.title
                  HAVING
                      COUNT(*) >= 5
                  )
                  SELECT
                      title
                  FROM
                      TopRatedMovies
                  ORDER BY
                      average_rating DESC
                  LIMIT 1;
                  `;
    db.query(query, (err, resp) => {
      if (err) {
        return res.status(500).send("some error occured while executing query")
      }
      else if (resp) {
        const titles = resp.rows.map(movie => movie.title);
        res.send(titles);
      }

    })

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/count-of-movies-with-high-rating', async (req, res) => {
  try {

    const query = `with movieratings AS (SELECT 
                  r.movie_id
                  FROM
                  ratings r
                  JOIN
                  movies m ON r.movie_id = m.id
                  GROUP BY
                   r.movie_id having count(*)>4 
                   and avg(r.rating)>=7) 
                  select count(*) from movieratings; 
                    `;
    db.query(query, (err, resp) => {
      if (err) {
        return res.status(500).send("some error occured while executing query")
      }
      else if (resp) {
        res.send(resp.rows[0].count);
      }

    })

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/year-with-second-highest-number-of-action-movies', async (req, res) => {
  try {

    const query = `WITH movie_ratings AS (
                  SELECT
                      m.year,
                      r.movie_id
                  FROM
                      ratings r
                      JOIN movies m ON r.movie_id = m.id
                  WHERE
                      'USA' = ANY (STRING_TO_ARRAY(m.country, ','::TEXT))
                      AND m.minutes < 120
                      AND 'Action' = ANY (STRING_TO_ARRAY(m.genre, ','::TEXT))
                  GROUP BY
                      m.year,
                      r.movie_id
                  HAVING
                      AVG(r.rating) >= 6.5
              )
              SELECT
                  movie_ratings.year,
                  COUNT(movie_id) AS movie_count
              FROM
                  movie_ratings
              GROUP BY
                  movie_ratings.year
              ORDER BY
                  movie_count DESC
              LIMIT 2;  
                    `;
    db.query(query, (err, resp) => {
      if (err) {
        return res.status(500).send(err)
      }
      else if (resp) {
        res.send(resp.rows?.lenght>1? resp.rows[1].year: 'there are no minimum number of match data in Table');
      }

    })

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/highest-average-rating-for-movie-genre-by-rater-id', async (req, res) => {
  try {

    const query = `SELECT 
                    m.genre, avg(r.rating) as rating
                  FROM
                      ratings r
                          JOIN
                      movies m ON r.movie_id = m.id
                  WHERE
                      r.rater_id=1040
                  group by m.genre having count(*)>=5
                  order by rating desc limit 1;`;
    db.query(query, (err, resp) => {
      if (err) {
        return res.status(500).send(err)
      }
      else if (resp) {
        res.send(resp.rows?.lenght?.rating);
      }

    })

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


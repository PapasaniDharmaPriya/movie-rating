steps to run in local
clone the repo
$nvm use 18
$cd backend
$npm i
$node index.js
now api ready for you to test

to test API's:
open any browser
run follwing 
localhost:3000/sort-movies
localhost:3000/get-unique-raters
localhost:3000/top-rater-ids
localhost:3000/top-rating-movie
localhost:3000/count-of-movies-with-high-rating
localhost:3000/year-with-second-highest-number-of-action-movies
localhost:3000/highest-average-rating-for-movie-genre-by-rater-id

Explanation:
imported express,pg,csv-pearse
created get API's 

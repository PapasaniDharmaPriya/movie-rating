const pg = require('pg');

var conString = "postgres://dharma_priya:BLkbO7fAvcbmlOQiTmwsZVDfSO6ZbSkN@dpg-cm2o41a1hbls73fr0pig-a.oregon-postgres.render.com/movierating?ssl=true";
var pool = new pg.Client(conString);
pool.connect();

module.exports = {
  query: (query,params) => pool.query(query,params)
};

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Stamina",
  password: "bazepodataka",
  port: 5432,
});

module.exports = {
  query: (text, params) => {
    return pool.query(text, params).then((res) => {
      return res;
    });
  },
  pool: pool
};
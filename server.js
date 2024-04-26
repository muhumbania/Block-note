import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "blocnote",
  password: "postgresmhb",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', (req, res) => {
    db.query('SELECT * FROM notes', function(err, result){

        console.log(result.rows);
        res.render("index.ejs", {notes : result.rows});
    });
    
});

app.get('/create', (req, res) => {
    res.render("create.ejs");
});

app.get('/show', (req, res) => {
    res.render("show.ejs");
});

app.get('/login', (req, res) => {
    res.render("login.ejs");
});

app.get('/register', (req, res) => {
    res.render("register.ejs");
});

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
});

function dateFormater(dateString){

    const dateObj = new Date(dateString);

    // Get year, month (0-indexed), day
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // Adjust for 0-based indexing
    const day = dateObj.getDate();

    // Format date as YYYY-MM-DD
    return`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

app.locals.dateFormater = dateFormater;
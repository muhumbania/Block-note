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

app.get('/', async (req, res) => {
    const result = await db.query('SELECT * FROM notes');
    res.render("index.ejs", {notes : result.rows, type : ""});
    
});

app.get('/asc', async (req, res) => {
    const result = await db.query('SELECT * FROM notes ORDER BY note_date ASC');
    res.render("index.ejs", {notes : result.rows, type : "asc"});
    
});

app.get('/desc', async (req, res) => {
    const result = await db.query('SELECT * FROM notes ORDER BY note_date DESC');
    res.render("index.ejs", {notes : result.rows, type: "desc"});
    
});

app.get('/create', (req, res) => {
    res.render("create.ejs", {type: "Create a note"});
});

app.post('/create', async (req, res) => {
    const newDate = new Date();
    const title = req.body.title;
    const body = req.body.body;
    await db.query('INSERT INTO notes (title, body, note_date) VALUES ($1, $2, $3)', [title, body, newDate]);

    res.redirect('/');
});

app.get('/show/:id', async (req, res) => {
    const id = req.params.id;
    await db.query('SELECT * FROM notes WHERE id = $1', [id], function(err, result){
        // console.log(result.rows);
    });
    res.render("show.ejs");
});

app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
    await db.query('DELETE FROM notes WHERE id = $1', [id]);
    res.redirect('/');
});

app.get('/edit/:id([0-9]+)', async (req, res) => {

    const id = req.params.id;

    try{
        const result = await db.query('SELECT * FROM notes WHERE id = $1', [id]);
        const note = result.rows[0];
        res.render("create.ejs", {note: note, type: "Edit a note"});
    }catch(err){
        console.log(err);
    }
    
});

app.post('/edit/:id([0-9]+)', async (req, res) => {
    const newDate = new Date();
    const title = req.body.title;
    const body = req.body.body;
    const id = req.params.id;

    await db.query('UPDATE notes SET title = $1, body = $2, note_date = $3 WHERE id = $4', [title, body, newDate, id]);

    res.redirect('/');
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
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: "TOPSECRETWORD",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

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
    if(req.isAuthenticated()){
        const result = await db.query('SELECT * FROM notes');
        res.render("index.ejs", {notes : result.rows, type : ""});
    }else{
        res.redirect("/login");
    }
    
});

app.get('/asc', async (req, res) => {
    if(req.isAuthenticated()){
        const result = await db.query('SELECT * FROM notes');
        res.render("index.ejs", {notes : result.rows, type : ""});
    }else{
        res.redirect("/login");
    }
    
});

app.get('/desc', async (req, res) => {
    if(req.isAuthenticated()){
        const result = await db.query('SELECT * FROM notes');
        res.render("index.ejs", {notes : result.rows, type : ""});
    }else{
        res.redirect("/login");
    }
    
});

app.get('/create', (req, res) => {
    if(req.isAuthenticated()){
        res.render("create.ejs", {type: "Create a note"});
    }else{
        res.redirect("/login");
    }
    
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

app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/login");
    });
  });

app.post('/edit/:id([0-9]+)', async (req, res) => {
    const newDate = new Date();
    const title = req.body.title;
    const body = req.body.body;
    const id = req.params.id;

    await db.query('UPDATE notes SET title = $1, body = $2, note_date = $3 WHERE id = $4', [title, body, newDate, id]);

    res.redirect('/');
});

app.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
    })
);

app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
        ]);

        if (checkResult.rows.length > 0) {
        req.redirect("/login");
        } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
            console.error("Error hashing password:", err);
            } else {
            const result = await db.query(
                "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
                [email, hash]
            );
            const user = result.rows[0];
            req.login(user, (err) => {
                console.log("success");
                res.redirect("/");
            });
            }
        });
        }
    } catch (err) {
        console.log(err);
    }
});

passport.use(
    new Strategy(async function verify(username, password, cb) {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
          username,
        ]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.password;
          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              //Error with password check
              console.error("Error comparing passwords:", err);
              return cb(err);
            } else {
              if (valid) {
                //Passed password check
                return cb(null, user);
              } else {
                //Did not pass password check
                return cb(null, false);
              }
            }
          });
        } else {
          return cb("User not found");
        }
      } catch (err) {
        console.log(err);
      }
    })
  );

app.get('/login', (req, res) => {
    res.render("login.ejs");
});

app.get('/register', (req, res) => {
    res.render("register.ejs");
});

passport.serializeUser((user, cb) => {
    cb(null, user);
  });
passport.deserializeUser((user, cb) => {
    cb(null, user);
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
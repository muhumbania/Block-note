// import bodyParser from "body-parser";
import express from "express";

const app = express();
const port = 3000;

app.use(express.static('public'));
// app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render("index.ejs");
});

app.get('/create', (req, res) => {
    res.render("create.ejs");
});

app.get('/show', (req, res) => {
    res.render("show.ejs");
});

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
});
import express from "express";
import { engine } from "express-handlebars";
import mysql from "mysql2/promise";
import session from "express-session";
import auth from "./components/authentification.js";
const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
app.use("/public", express.static("public"));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "labai slapta fraze",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 60000,
    },
  })
);

const database = await mysql.createConnection({
  host: "pauliuspetrunin.lt",
  user: "bit",
  database: "edvinaslipcius",
  password: "kulokas",
});
const port = process.env.port || 3000;

app.get("/", async (req, res) => {
  const songs = await database.query("SELECT * FROM `songs` ");

  res.render("homepage", { songs: songs[0] });
  console.log(req.session);
});
app.get("/register", (req, res) => {
  res.render("registration");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const users = await database.query(
      "INSERT INTO users (email, password, name) VALUES (?, ?,?)",
      [email, password, name]
    );
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email === "" && password === "") return res.redirect("/login");

    const user = await database.query(
      "SELECT * FROM `users` WHERE email = ? AND password = ?",
      [email, password]
    );
    req.session.loggedIn = true;
    if (user[0].length > 0) return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
  res.render("login");
});
app.get("/dashboard", auth, async (req, res) => {
  console.log(req.session.loggedIn);
  const songs = await database.query("SELECT * FROM `songs` ");
  res.render("dashboard", { songs: songs[0] });
});
app.post("/new-song", async (req, res) => {
  try {
    const songs = await database.query(
      "INSERT INTO songs (song_name, song_album,id) VALUES (?, ?,?)",
      [req.body.song_name, req.body.song_album, req.body.id]
    );
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port);

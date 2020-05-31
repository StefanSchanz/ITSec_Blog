var express = require("express"); // HTTP Server
const path = require("path"); // get Paths
var app = express();

// SQL-Database

var mysql = require("mysql");
var session = require("express-session");

var bodyParser = require("body-parser"); //form elements

app.use(bodyParser.urlencoded({ extended: false }));

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "ThisIsSecret",
    resave: false,
    saveUninitialized: true,
    cookie: { expires: 600000000000000 },
    user_id: "",
    admin: false,
  })
);

var conn = mysql.createConnection({
  host: "localhost",
  user: "ITSecUser",
  password: "admin",
  database: "ITSecDB",
  insecureAuth: true,
});

conn.connect(function (err) {
  if (err) throw err;
});

app.use(express.static(path.join(__dirname, "css")));
app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/html", express.static(__dirname + "/html/public"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/html/index.html"));
});

app.get("/api/getUsers", function (req, res) {
  conn.query("SELECT * FROM bloguser", function (err, result, fields) {
    res.send(result);
  });
});

app.get("/api/getBlogEntries", function (req, res) {
  conn.query(
    "SELECT blog.idblogentry, blog.blogtext, user.username FROM blogentry as blog " +
      "JOIN bloguser as user ON blog.bloguser_idbloguser = user.idbloguser",
    function (err, result, fields) {
      res.send(result);
    }
  );
});

app.post("/api/register", function (req, res) {
  if (req.body.password == req.body.passwordretry) {
    conn.query(
      `INSERT INTO bloguser (username, password) VALUES ('${req.body.username}', '${req.body.password}');`
    );
    res.redirect("/");
  } else {
    res.redirect("/Registrate");
  }
});

app.post("/api/postentry", function (req, res) {
  conn.query(
    `INSERT INTO blogentry (blogtext, bloguser_idbloguser) VALUES ('${req.body.blogtext}', '${current_user_id_to_insert}');`
  );
});

app.get("/api/admin", function (req, res) {
  res.sendFile(path.join(__dirname, "/html/adminpage.html"));
});

app.get("/Registrate", function (req, res) {
  res.sendFile(path.join(__dirname, "/html/registrate.html"));
});

app.post("/login", function (req, res) {
  var message = "";
  var session = req.session;

  if (req.method == "POST") {
    var post = req.body;
    var name = post.username;
    var pass = post.password;

    conn.query(
      `SELECT idbloguser, username, isAdmin FROM  bloguser WHERE username='${name}' AND password='${pass}'`,
      function (err, result, fields) {
        if (result.length) {
          req.session.username = name;
          if (result[0].isAdmin == 1) {
            req.session.admin = true;
          }
          req.session.save();
          res.redirect("/");
        }
      }
    );
  }
});

app.get("/api/getloggeduser", function (req, res) {
  res.send(req.session.username);
});

app.post("/logout", function (req, res) {
  console.log("Me gettin in logout!");
  req.session.destroy();
  res.end();
});

app.listen(3000, function () {
  console.log("listening on *:3000");
});

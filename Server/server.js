var express = require("express"); // HTTP Server
const path = require("path"); // get Paths
var app = express();

// SQL-Database

var mysql = require("mysql");
var session = require("express-session");

var bodyParser = require("body-parser"); //form elements
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "ThisIsSecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 600000000000000 /*, httpOnly: false    Stefan Schanz - httpOnly: false must be used
                                              allows to get the cookie with: document.cookie  */,
    },
    user_id: "",
    admin: false,
  })
);

var conn = mysql.createConnection({
  // SQL Connection
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

let connection_arr = {};

/*Stefan Schanz - when the same connection fails login 20 times
  the User-IP gets completely blocked from the Webserver.
  */

/*Everytime something is called, that function get called.*/
app.get("*", function (req, res, next) {
  if (connection_arr[req.connection.remoteAddress] > 18) {
    res.send(401);
  } else {
    next();
  }
});

app.get("/", function (req, res) {
  // wenn "/" aufgerufen -> /html/index.html schicken.
  res.sendFile(path.join(__dirname, "/html/index.html"));
});

app.get("/api/getUsers", function (req, res) {
  // api for getting all Users
  if (req.session.admin != undefined) {
    if (req.session.admin != false) {
      //Stefan Schanz - the line above checks if the
      //request session is applied by an admin, if not, redirect.
      conn.query("SELECT * FROM bloguser", function (err, result, fields) {
        res.send(result);
      });
    }
  } else {
    res.redirect("/");
  }
});

app.get("/api/getBlogEntries", function (req, res) {
  // api for getting all Blog entries
  conn.query(
    "SELECT blog.idblogentry, blog.blogtext, user.username FROM blogentry as blog " +
      "JOIN bloguser as user ON blog.bloguser_idbloguser = user.idbloguser",
    function (err, result, fields) {
      res.send(result);
    }
  );
});

app.post("/api/register", function (req, res) {
  // api for registering a new user
  if (req.body.password == req.body.passwordretry) {
    conn.query(
      `INSERT INTO bloguser (username, password) VALUES ('${req.body.username}', '${req.body.password}');` // for example SQL-Injection works here.
    );
    res.redirect("/");
  } else {
    res.redirect("/Registrate");
  }
});

app.get("/admin", function (req, res) {
  // send admin page
  res.sendFile(path.join(__dirname, "/html/adminpage.html"));
});

app.get("/Registrate", function (req, res) {
  // send registration site
  res.sendFile(path.join(__dirname, "/html/registrate.html"));
});

app.post("/login", function (req, res) {
  // send login page
  var message = "";
  var session = req.session;

  /*Stefan Schanz - check if connection exists in connection_arr
    when not, set default to 0.. this happens too when the user logins successfully
    when the connection fails, the count gets incremented.
   */
  let check_existence = connection_arr[req.connection.remoteAddress];

  if (check_existence == undefined) {
    connection_arr[req.connection.remoteAddress] = 0;
  } else {
    connection_arr[req.connection.remoteAddress] += 1;
  }
  if (req.method == "POST") {
    var post = req.body;
    var name = post.username;
    var pass = post.password;
    // Stefan Schanz
    var sql =
      "SELECT idbloguser, username, isAdmin FROM ?? WHERE ?? = ? AND ?? = ?";
    var inserts = ["bloguser", "username", name, "password", pass];
    sql = mysql.format(sql, inserts);

    conn.query(
      sql,
      /*OLD INSECURE COMMAND BELOW*/

      // `SELECT idbloguser, username, isAdmin FROM  bloguser WHERE username='${name}' AND password='${pass}'`,
      // Stefan Schanz - Here the login is done! - That Code above is vulnerable against SQL-Injection!
      function (err, result, fields) {
        if (result != undefined) {
          if (result.length != 0) {
            req.session.username = name; // save other things for the session.
            req.session.user_id = result[0].idbloguser;
            if (result[0].isAdmin == 1) {
              req.session.admin = true;
            } else {
              req.session.admin = false;
            }
            connection_arr[req.connection.remoteAddress] = 0;
            req.session.save();
            res.redirect("/"); //redirect to main page
          } else {
            res.redirect("/");
          }
        } else {
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
  req.session.destroy();
  res.end();
});

app.get("/api/listBlogs", function (req, res) {
  if (req.session.user_id != "") {
    conn.query(
      `SELECT idblogentry, blogtext FROM blogentry WHERE bloguser_idbloguser=${req.session.user_id}`,
      function (err, result, fields) {
        if (result != undefined) {
          res.send(result);
        }
      }
    );
  }
});

app.get("/ownBlog", function (req, res) {
  res.sendFile(path.join(__dirname, "/html/blogpage.html"));
});

app.post("/api/createBlogEntry", function (req, res) {
  if (req.session.user_id != "") {
    conn.query(
      `INSERT INTO blogentry (blogtext, bloguser_idbloguser) VALUES('${req.body.blogentry}', ${req.session.user_id});`
    );
    res.redirect("/ownBlog");
  } else {
    res.redirect("/");
  }
});

app.post("/api/deleteBlogEntry", function (req, res) {
  if (req.session.user_id != "") {
    conn.query(`DELETE FROM blogentry WHERE idblogentry=${req.body.id_blog};`);
    res.send("Message Deleted!");
  } else {
    res.send("Message Delete Failed.");
  }
});

app.post("/api/editBlogEntry", function (req, res) {
  var newblogentry = req.body.newblogentry;
  var blog_id = req.body.blog_id;
  blog_id = parseInt(blog_id);
  if (req.session.user_id != "") {
    conn.query(
      `UPDATE blogentry SET blogtext = '${newblogentry}' WHERE idblogentry=${blog_id};`
    );
    res.redirect("/ownBlog");
  } else {
    res.redirect("/");
  }
});

app.get("/api/getloggeduseradmin", function (req, res) {
  res.send(req.session.admin);
});

app.post("/api/editUser", function (req, res) {
  var newusername = req.body.newusername;
  var user_id = req.body.user_id;
  var newpassword = req.body.newpassword;
  var newisAdmin = req.body.newisAdmin;
  user_id = parseInt(user_id);
  newisAdmin = parseInt(newisAdmin);
  if (Number.isNaN(newisAdmin)) {
    newisAdmin = 0;
  }
  if (req.session.admin != false) {
    conn.query(
      `UPDATE bloguser SET username = '${newusername}', password = '${newpassword}', isAdmin = ${newisAdmin} WHERE idbloguser=${user_id};`
    );
    res.redirect("/admin");
  } else {
    res.redirect("/");
  }
});

app.post("/api/deleteUser", function (req, res) {
  if (req.session.admin != false) {
    conn.query(`DELETE FROM bloguser WHERE idbloguser=${req.body.id_user};`);
    res.send("Message Deleted!");
  } else {
    res.send("Message Delete Failed.");
  }
});

app.listen(3000, function () {
  console.log("listening on *:3000");
});

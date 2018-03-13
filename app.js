var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var session = require("express-session");
var formidable = require("formidable");
var fs = require("fs");
var multipart = require('parse-multipart');
var bcrypt = require("bcrypt");

var app = express();

app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");

app.use(express.static(__dirname + '/views')); // addding views as the default folder for response pages
app.use(bodyParser.urlencoded({ //accepts url encoded data
    extended: true
})); // setting body

app.use(session({secret: 'ssshhhhh'}));

var con = mysql.createConnection({//setting up mysql
    host: "127.0.0.1",
    port: "3306",
    user: "root",
    password: "8520",
    database: "iwt"
});
var sess;
var count = 1;

con.connect(function(err) {//connecting to mysql server
    if (err){ throw err;console.log("Error!! Restart Server");console.log(err);}
    else
      console.log("Connected!");
});

app.get("/", function(req, res){
    sess = req.session;
    if(sess.email){
        res.redirect("/home");
    } else{
        res.render("front");
    }
});

app.get('/logout',function(req,res){
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

app.get("/register", function(req, res){
    sess = req.session;
    if(sess.email){
        res.redirect("/home");
    } else{
        res.render("register");
    }
});

app.get("/password", function(req, res){
    sess = req.session;
    if(sess.email){
        var sql = "Select * from users where email = '"+sess.email+"'";
        con.query(sql, function (err, result) {
            if(err) {
                throw err;
            } else {
                res.render("password", {user: result[0]});
            }
        });   
    } else {
        res.redirect("/");
    }
});

app.get("/myads", function(req, res){
    sess = req.session;
    if(sess.email){
        var sql = "Select * from ads where user_mail='"+sess.email+"';";
        con.query(sql, function (err, ads) {
            if(err) {
                throw err;
            } else {
                var data = {user: sess.name, ads: ads};
                res.render("ads", {data: data});
            }
        });
    } else {
        res.redirect("/");
    }
});

app.get("/delad", function(req, res){
    sess=req.session;
    var image = req.query.img;
    if(sess.email){
        var sql = "Delete from ads where user_mail ='"+sess.email+"' and image = '"+image+"';";
        con.query(sql, function (err, ads) {
            if(err) {
                throw err;
            } else {
                res.redirect("/myads");
            }
        });
    } else {
        res.redirect("/");
    }
});

app.get("/home", function(req, res){
    var category = req.query.category;
    var sort = req.query.sort;
    sess = req.session;
    if(sess.email){
        var sql = "Select * from users where email = '"+sess.email+"'";
        con.query(sql, function (err, result) {
            if(err) {
                throw err;
            } else {
                if(!category && !sort)
                    var sql = "Select * from ads";
                else if(!category){
                    if(sort == "low")
                        var sql = "Select * from ads order by price";
                    else if(sort == "high")
                        var sql = "Select * from ads order by price desc";
                    else 
                        var sql = "Select * from ads order by age";
                }
                else if(!sort){
                    var sql = "Select * from ads where category = '"+category+"'";
                }
                else {
                    if(sort == "low")
                        var sql = "Select * from ads where category = '"+category+"'order by price";
                    else if(sort == "high")
                        var sql = "Select * from ads where category = '"+category+"'order by price desc";
                    else 
                        var sql = "Select * from ads where category = '"+category+"'order by age";
                }
                con.query(sql, function (err, ads) {
                    if(err) {
                        throw err;
                    } else {
                        var data = {user: result[0], ads: ads};
                        res.render("first", {data: data});
                    }
                });
            }
        });   
    } else {
        res.redirect("/");
    }
});

app.get("/add", function(req, res){
    sess = req.session;
    if(sess.email){
        var sql = "Select * from users where email = '"+sess.email+"'";
        con.query(sql, function (err, result) {
            if(err) {
                throw err;
            } else {
                res.render("add", {user: result[0]});
            }
        });   
    } else {
        res.redirect("/");
    }
});

app.get("/*", function(req, res){
    res.send("404<a href='/'>Go back</a>");
});


app.post("/register", function(req, res){
    sess = req.session;
    var user = req.body.user;
    var sql = "insert into users values('"+user.first+"','"+user.last+"','"+user.mail+"','"+user.pass+"','"+user.phone+"');";
    con.query(sql, function (err, result) {
        if(err) {
            throw err;
        } else {
            console.log("1 record inserted");
            sess.email = user.mail;
            sess.name = user.first+" "+user.last;
            res.redirect("/home");
        }
    });
});

app.post("/login", function(req, res){
    sess = req.session;
    var user = req.body.user;
    var sql = "Select * from users where email = '"+user.mail+"' and passwd = '"+user.pass+"'";
    con.query(sql, function (err, result) {
        if(err) {
            throw err;
        } else {
            if(result.length == 0){
                res.send("Invalid Credentials <a href='/'>Go back</a>");
            } else {
                sess.email = user.mail;
                sess.name = result[0].first_name+" "+result[0].last_name;
                res.redirect("/home");
            }
        }
    });
});

app.post("/password", function(req, res){
    sess = req.session;
    var opass = req.body.opass;
    var pass = req.body.pass;
    var sql = "update users set passwd = '"+String(pass)+"' where email = '"+sess.email+"' and passwd = '"+opass+"'";
    con.query(sql, function (err, result) {
        if(err || result.affectedRows == 0) {
            res.send("Password Couldn't be changed, <a href='password'>Try again</a>");
        } else {
            res.redirect("/home");
        }
    });   
});

app.post("/add", function(req, res){
    sess = req.session;
    dir = 'C:/Users/yasha/Desktop/IWT/project/back/public/images/'
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.image.path;
        var newpath;
        fs.readdir(dir, function(err, files){
            count = files.length;
            newpath = dir + String(count+1) + ".jpg";
            var boundary = "----WebKitFormBoundarylasXDrnFxhkNLztB";
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
            });
            var warranty = "on";
            if(!fields.warranty)
                warranty = "off";
            newpath = "/images/" + String(count+1) + ".jpg";
            var sql = "insert into ads values('"+fields.category+"','"+fields.desc+"','"+fields.age+"','"+warranty+"','"+fields.price+"','"+newpath+"','"+sess.email+"');";
            con.query(sql, function (err, result) {
                if(err) {
                    throw err;
                } else {
                    res.redirect("/home");
                }
            });
        });
    });
});

app.listen(port=8080, ip="0.0.0.0", function(){
    console.log("listening to port "+port);
    console.log("Server Running");
});
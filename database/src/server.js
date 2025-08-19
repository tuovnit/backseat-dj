const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require('body-parser');


const app = express();

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "CremeBrulee17!", //generic pwd 
    database: "loginsystem", //name of db system on local machine
});

app.post("/createaccount", (req, res)=> {
    const username = req.body.username;
    const password = req.body.password;

    db.query(
        `INSERT INTO users (username, password) VALUES (${username},${password});`,
        (err, result)=> {
            console.log(err);
        }
    );
});

app.post("/login", (req, res)=> {
	console.log('post request for login')
	const username = req.body.username;
	const password = req.body.password;

	console.log('username', username)
	console.log('password', password)

    db.query(
        `SELECT * FROM users WHERE username=${username} AND password=${password};`,
        (err, result)=> {
            if(err){
                res.send({err:err});
            }
            if(result){
                res.send(result);
            }else {
                res.send({message: "Wrong email or password"});
            }
        }
    );
});

app.listen(3000, () => {
    console.log("Running DB server");

});

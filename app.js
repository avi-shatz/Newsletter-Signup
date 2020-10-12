// jshint esversion:8
const express = require("express");
const https = require("https"); // native node module
const app = express();
require('dotenv').config(); // config .env file

// use body parser with express
app.use(express.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/signup.html");
});

app.post("/", (req, res) => {

  const url = `https://us2.api.mailchimp.com/3.0/lists/${process.env.LIST_ID}/members`;
  const fName = req.body.fristName;
  const lName = req.body.lastName;
  const email = req.body.email;

  const data = {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: fName,
      LNAME: lName
    }
  };

  const jsonData = JSON.stringify(data);


  const options = {
    method: "POST",
    auth: `key:${process.env.API_KEY}`,
    headers: "content-type: application/json"
  };

  const request = https.request(url, options, (response) => {

    response.on("data", (data) => {
      if (response.statusCode === 200) {
        res.sendFile(__dirname + "/public/success.html");
      } else if (JSON.parse(data).title === "Member Exists") {
        res.sendFile(__dirname + "/public/exists.html");
      } else {
        res.sendFile(__dirname + "/public/failure.html");
      }
    });
  });

  request.write(jsonData);
  request.end();

});

app.post("/failure", function(req, res) {
  res.redirect("/");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});

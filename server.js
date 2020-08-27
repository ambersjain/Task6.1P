const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const validator = require('validator');
const port = 8080;
const base = `${__dirname}/views`;
// To connect to API
const https = require("https");

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// //Database connection using mongoose
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/iCrowdTaskDB", { useNewUrlParser: true })
let db = mongoose.connection;

// Check for DB errors
db.on('error', function (err) {
  console.log(err);
})

// Check db connection
db.once('open', function () {
  console.log('Connected to MongoDB');
})

// Model
const User = require("./models/user");

// Need to use this to be able to use views folder
app.use(express.static('views'));

// Home route
app.get('/', (req, res) => {
  res.send(`${base}/index.html`);
});

// Registration Successful route
app.get('/regSuccess', (req, res) => {
  res.sendFile(`${base}/regSuccess.html`);
});

// Registration Failed route
app.get('/regFailed', (req, res) => {
  res.sendFile(`${base}/regFailed.html`);
});


// 404 route
app.get('/*', (req, res) => {
  res.sendFile(`${base}/404.html`);
});

// Submit route
app.post('/', (req, res) => {

  const user = new User.User(
    {
      country: req.body.country,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
      confirm_password: req.body.confirm_password,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      mobile_number: req.body.mobile_number,
    }
  );

  const email = req.body.email;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;

  const data = {
    members: [
      {
      email_address: email,
      status: "subscribed",
      merge_fields:{
        FNAME: first_name,
        LNAME: last_name
      }
    }
  ]
  }
  //mailchimp only accepts JSON, need to convert it to JSON
  var jsonData = JSON.stringify(data);

    // // MailChimp Stuff
    // 94aecf6a6bbdfdee24ec9a3fd3fa0fc6-us17
  // const apiKey = "94aecf6a6bbdfdee24ec9a3fd3fa0fc6-us17";
  // const list_id = "53ca52654e";
  const url = "https://us17.api.mailchimp.com/3.0/lists/53ca52654e"
  const options = {
    method:"POST",
    auth:"aa:15fa9f9ee79b0f8ad5757bc003430bbd-us17"
  }

  const request = https.request(url, options , (response)=>{

    response.on("data", (data)=> {
        console.log(JSON.parse(data))
    })

})
  request.write(jsonData);
  request.end();

  //Saving info to database
  if (req.body.password === req.body.confirm_password) {
    user.save((err) => {
      if ((err)) {
        console.log(err);
        res.redirect(`/regFailed`);
      } else {
        console.log("Registration Successful!");
        res.redirect(`/regSuccess`);
      }
    })
  }
  else {
    res.redirect(`/regFailed`);
    throw new Error("Passwords do not match")
  }



});

app.listen(port, function(request, response) {
  console.log(`listening on port ${port}`);
})

// app.listen(port, () => {
//   console.log(`listening on port ${port}`);
// })

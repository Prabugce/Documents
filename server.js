var express = require('express');
var app = express();
app.use(express.static("app")); // myApp will be the same folder name.

app.use(express.static(__dirname + '/assets1'));
app.use(express.static(__dirname +  "/Dynamic_content_HTML"));



// app.get("/", function (req, res,next) {
//  res.redirect("/s"); 
// });
app.listen(8080, "localhost"); 

console.log("MyProject Server is Listening on port 8080");
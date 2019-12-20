const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");

//Scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

//Requiring our models
const db = require("./models");

//Port 
const PORT = process.env.PORT || 3000;

//Starting Express App
const app = express();


// Morgan logs requests
app.use(logger("dev"));
// Parse requests as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));


// Connect to the Mongo DB
mongoose.connect(
    process.env.MONGODB_URI || "mongodb://user:password1@ds137498.mlab.com:37498/heroku_9bwh2sth", { useMongoClient: true });


//ROUTES

app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.caranddriver.com/news/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("div.full-item-content").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
            result.summary = $(this)
                .children("div.full-item-dek")
                .find("p")
                .text();
            result.byLine = $(this)
                .children("div.byline")
                .text();


            // Create a new Article using the `result` object built from scraping
            db.News.create(result)
                .then(function (dbNews) {
                    // View the added result in the console
                    console.log(dbNews);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete, press the 'back' button to see results");
    });
});

app.get("/news", function (req, res) {
    // Grab every news info
    db.News.find({})
        .then(function (dbNews) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbNews);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.get("/news/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.News.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbNews) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbNews);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.post("/news/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Notes.create(req.body)
        .then(function (dbNotes) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.News.findOneAndUpdate({ _id: req.params.id }, { note: dbNotes._id }, { new: true });
        })
        .then(function (dbNews) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbNews);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.listen(PORT, function () {
    console.log("App running on port" + PORT + "!");
});
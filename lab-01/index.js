const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to my backend server!");
});

app.get("/about", (req, res) => {
    res.json({
        name: "Your Name",
        section: "Your Section"
    });
});

app.get("/time", (req, res) => {
    res.json({
        currentTime: new Date()
    });
});

app.use((req, res) => {
    res.status(404).send("404 - Route not found");
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000/unknown");
});
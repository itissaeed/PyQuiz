const express = require("express");
const app = express();
const compression = require("compression");
require("dotenv").config();

// Add compression middleware
app.use(compression());

// Performance middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add cache control headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=31557600'); // one year
  next();
});

const dbConfig = require("./config/dbConfig");

const usersRoute = require("./routes/usersRoute");
const examsRoute = require("./routes/examsRoute");
const resportsRoute = require("./routes/reportsRoute");


app.use("/api/users", usersRoute);
app.use("/api/exams", examsRoute);
app.use("/api/reports", resportsRoute);
const port = process.env.PORT || 5000;

const path = require("path");
__dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client" , "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });   
} 


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

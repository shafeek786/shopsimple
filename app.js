const express = require("express");
const path = require("path");
const router = require("./routes/userRouter");
var adminRouter = require("./routes/adminRouter");
const mongoose = require("mongoose");
const hbs = require("hbs");
mongoose.connect("mongodb+srv://shafeek78:<sWWckXSLgKeLpRNS>@shopsimple-db.qtgk4qe.mongodb.net/?retryWrites=true&w=majority");

const app = express();
const logger = require("morgan");

app.use("/", router);
app.use("/admin", adminRouter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "")));
app.use(express.static("assets"));

app.use(logger("dev"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

//PARTIALS ROUTE SETTING
const partialsPath = path.join(__dirname + "/views/partials");
hbs.registerPartials(partialsPath);
hbs.registerHelper("ifeq", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper("ifnoteq", function (a, b, options) {
  if (a != b) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper("ifgrt", function (a, b, options) {
  if (a < b) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper("for", function (from, to, incr, block) {
  let accum = "";
  for (let i = from; i <= to; i += incr) {
    accum += block.fn(i);
  }
  return accum;
});

hbs.registerHelper("ifCond", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn ? options.fn(this) : options.fn;
  } else {
    return options.inverse ? options.inverse(this) : options.inverse;
  }
});

// Register a custom Handlebars helper for serial number calculation
hbs.registerHelper(
  "calculateSerialNumber",
  function (index, currentPage, itemsPerPage) {
    const currentPageInt = parseInt(currentPage);
    const itemsPerPageInt = parseInt(itemsPerPage);
    const serialNumber = (currentPageInt - 1) * itemsPerPageInt + index + 1;
    return serialNumber;
  }
);
// catch 404 and forward to error handler

app.use(function (req, res, next) {
  res.status(404).render("404");
});

app.use(function (err, req, res, next) {
  res.status(500);
  res.render("error", { error: err });
});
app.listen(3000, console.log("started"));

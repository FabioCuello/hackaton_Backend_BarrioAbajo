const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

//
app.use(bodyParser.urlencoded({
    extended: true
}));

// Crea una nueva base datos o si existe, se translada a ella
mongoose.connect("mongodb://localhost:27017/BarrioAbajo", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    images: String,
    date: String,
    place: String,
});

const registerSchema = new mongoose.Schema({
    rol: String,
    name: String,
    email: String,
    password: String,
    dateBorn: String,
    phoneNumber: Number,
    bankInfo: String,
    institution: String,
    genre: String
})
const Register = mongoose.model("Register", registerSchema);
const Event = mongoose.model("Event", eventSchema);

// --------------------------register------------------

app.route("/register")
    .post(function (req, res) {
        Register.find({
            email: req.body.email
        }, function (err, result) {
            if (err) {
                throw err
            } else {
                if (result.length == 0) {
                    const newRegister = new Register({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password,
                        dateBorn: req.body.dateBorn,
                        phoneNumber: req.body.phoneNumber,
                        bankInfo: req.body.bankInfo,
                        institution: req.body.institution,
                        genre: req.body.genre
                    })
                    newRegister.save(function (err) {
                        if (err) {
                            throw err
                        } else {
                            res.send("Registro exitoso")
                        }
                    })
                } else {
                    res.send("Usuario registrado previamente")
                }
            }
        })
    });




//---------------------------login---------------------

app.route("/login")
    .post(function (req, res) {
        Register.findOne({
            email: req.body.email
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                if (req.body.password == result.password) {
                    res.send(true)
                } else {
                    res.send(false)
                }
            }
        })
    });

// --------------------------Event------------------------
app.route("/event")
    .get(function (req, res) {
        Event.find({}, function (err, results) {
            if (err) {
                throw err
            } else {
                res.send(results)
            }
        })
    })

    .post(function (req, res) {
        const newEvent = new Event({
            title: req.body.title,
            description: req.body.description,
            images: req.body.images,
            date: req.body.date,
            place: req.body.place,
        })
        newEvent.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                res.send("Successfully added to DB event");
            }
        })
    });
// ---------------------------Specific event-------------------

app.route("/event/:Eventname")
    .get(function (req, res) {
        Event.findOne({
            title: req.params.Eventname
        }, function (err, result) {
            if (err) {
                throw err
            } else {
                res.send(result)
            }
        })
    });


app.listen(3000, function () {
    console.log("Server started on port 3000");
});
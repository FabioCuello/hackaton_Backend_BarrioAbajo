const mongoose = require("mongoose");
const express = require("express");
var cors = require('cors');
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
app.use(cors());

//
app.use(cors())
app.use(bodyParser.urlencoded({
    extended: true
}));

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});



// Crea una nueva base datos o si existe, se translada a ella
mongoose.connect("mongodb://localhost:27017/BarrioAbajo", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const commentSchema = new mongoose.Schema({
    AutorName: String,
    description: String
});

const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    images: String,
    date: String,
    place: String,
    comment: [commentSchema]
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
});
const Comment = mongoose.model("Comment", commentSchema)
const Register = mongoose.model("Register", registerSchema);
const Event = mongoose.model("Event", eventSchema);

// --------------------------register------------------

app.route("/register")

    .post(function (req, res) {
        console.log("fazd")
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
                            const token = jwt.sign({
                                newRegister
                            }, "TopSecret");
                            res.json({
                                success: true,
                                message: "registro exitoso",
                                token
                            })
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: "Usuario registrado previamente"
                    })
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
                if (result.length != 0) {
                    if (req.body.password == result.password) {
                        const token = jwt.sign({
                            result
                        }, "TopSecret");
                        res.json({
                            success: true,
                            message: "Login exitoso",
                            token
                        })
                    } else {
                        res.json({
                            success: false,
                            message: "Contraseña inválida"
                        })
                    }
                } else {
                    res.json({
                        success: false,
                        message: "Usuario no encontrado"
                    })
                };
            };
        });
    });

// --------------------------Event------------------------
app.route("/event")
    .get(function (req, res) {
        Event.find({}, function (err, results) {
            if (err) {
                throw err
            } else {
                res.json(results)
            }
        })
    })
    .post(ensureToken, function (req, res) {
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
                res.json({
                    success: true,
                    message: "Successfully added to DB event"
                });
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
                res.json({
                    success: true,
                    result
                });
            }
        })
    })
    .post(ensureToken, function (req, res) {
        const userName = req.headers['username'];
        const description = req.body.description;
        const newcomment = new Comment({
            AutorName: userName,
            description: description
        })
        Event.findOne({
            title: req.params.Eventname
        }, function (err, result) {
            if (err) {
                throw err
            } else {
                result.comment.push(newcomment)
                result.save();
                res.json({
                    success: true,
                    result: "Se agregó a la base de datos"
                })
            }
        });
    });
// --------------------Middelware----------
function ensureToken(req, res, next) {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, "TopSecret", function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Autentificación fallida"
                });
            } else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: "No existe el token"
        });
    }
}

app.listen(3001, function () {
    console.log("Server started on port 3000");
});
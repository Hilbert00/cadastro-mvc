require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");

const app = express();
const handlebars = exphbs.create({
    extname: "hbs",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
});

function verificarUsuario(req, res, next) {
    if (req.originalUrl === "/" || req.originalUrl === "/login" || req.originalUrl === "/cadastro") {
        res.locals.title = "Autenticação - Cadastro de Funcionários";

        if (req.session.msg) {
            res.locals.msg = req.session.msg;
            delete req.session.msg;
        }

        next();
    } else if (req?.session?.user) {
        res.locals.title = "Cadastro de Funcionários";
        res.locals.user = req.session.user;

        if (req.session.msg) {
            res.locals.msg = req.session.msg;
            delete req.session.msg;
        }

        next();
    } else res.redirect("/");
}

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.engine("hbs", handlebars.engine);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(verificarUsuario);

// Controllers
const usuarioController = require("./controllers/usuarioController.js");
const funcionarioController = require("./controllers/funcionarioController.js");

app.get("/", (_req, res) => res.render("indexView"));

app.get("/lista", funcionarioController.getFuncionarios);

app.get("/adicionar", (_req, res) => res.render("adicionarView"));

app.get("/editar/:id", funcionarioController.getFuncionario);

app.get("/funcionario/:id", funcionarioController.getFuncionario);

app.post("/login", usuarioController.login);

app.post("/cadastro", usuarioController.cadastro);

app.post("/logoff", usuarioController.logoff);

app.post("/adicionar", funcionarioController.addFuncionario);

app.post("/editar", funcionarioController.atualizarFuncionario);

app.post("/deletar", funcionarioController.deletarFuncionario);

app.listen(process.env.PORT, () => console.log("Rodando na porta: " + process.env.PORT));

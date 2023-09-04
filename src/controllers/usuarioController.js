const Usuario = require("../models/usuarioModel");

async function login(req, res) {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        req.session.msg = { txt: "Preencha todos os campos!", status: "danger" };
        return res.redirect("/");
    }

    const usuario = await Usuario.autenticar(nome, senha);
    if (usuario) req.session.user = usuario;
    else req.session.msg = { txt: "Login inválido!", status: "danger" };

    return res.redirect("/lista");
}

function cadastro(req, res) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        req.session.msg = { txt: "Preencha todos os campos!", status: "danger" };
        return res.redirect("/");
    }

    Usuario.cadastrar(nome, email, senha).then(async (data) => {
        const usuario = await Usuario.autenticar(nome, senha);
        req.session.user = usuario;

        return res.redirect("/lista");
    });
}

function logoff(req, res) {
    delete req.session.user;
    return res.redirect("/");
}

module.exports = { login, cadastro, logoff };

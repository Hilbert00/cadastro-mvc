const md5 = require("md5");
const Database = require("../models/databaseModel.js");

class Usuario {
    constructor(nome, email, senha) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }

    static async autenticar(nome, senha) {
        return await Database.findOne(process.env.DB_USER_COLLECTION, { nome, senha: md5(senha) });
    }

    static async cadastrar(nome, email, senha) {
        const usuario = new Usuario(nome, email, md5(senha));

        return await Database.insertOne(process.env.DB_USER_COLLECTION, usuario);
    }
}

module.exports = Usuario;

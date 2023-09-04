const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const { ObjectId } = require("mongodb");

const Funcionario = require("../models/funcionarioModel");
const Database = require("../models/databaseModel.js");

async function getFuncionarios(_req, res) {
    const funcionarios = await Database.findAll(process.env.DB_DATA_COLLECTION);

    return res.render("listaView", { funcionarios });
}

async function getFuncionario(req, res) {
    if (!req.params.id) {
        req.session.msg = { txt: "Funcionário não existe!", status: "danger" };
        return res.redirect("/lista");
    }

    try {
        const funcionario = await Database.findOne(process.env.DB_DATA_COLLECTION, {
            _id: new ObjectId(req.params.id),
        });

        if (!funcionario) {
            req.session.msg = { txt: "Funcionário não existe!", status: "danger" };
            return res.redirect("/lista");
        }

        if (req.originalUrl.split("/")[1] === "editar") return res.render("editarView", funcionario);
        return res.render("funcionarioView", funcionario);
    } catch (err) {
        req.session.msg = { txt: "Funcionário não existe!", status: "danger" };
        return res.redirect("/lista");
    }
}

function addFuncionario(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, (_err, fields, files) => {
        if (
            !fields.nome[0] ||
            !fields.pis[0] ||
            !fields.cpf[0] ||
            !fields.rg[0] ||
            !fields.email[0] ||
            !fields.telefone[0] ||
            !files.foto
        ) {
            req.session.msg = { txt: "Preencha todos os campos!", status: "danger" };
            return res.redirect("/adicionar");
        }

        const pictureData = files.foto[0];
        const oldPath = pictureData.filepath;
        const newPath = path.join(__dirname, "../../public/pictures", pictureData.newFilename + ".png");

        if (!fs.existsSync(path.join(__dirname, "../../public/pictures")))
            fs.mkdirSync(path.join(__dirname, "../../public/pictures"));

        fs.copyFileSync(oldPath, newPath);
        fs.rmSync(oldPath);

        const funcionario = new Funcionario(
            fields.nome[0],
            fields.pis[0],
            fields.cpf[0],
            fields.rg[0],
            fields.email[0],
            fields.telefone[0],
            pictureData.newFilename
        );

        Database.insertOne(process.env.DB_DATA_COLLECTION, funcionario).then(() => {
            req.session.msg = { txt: "Funcionário adicionado!", status: "success" };
            res.redirect("/lista");
        });
    });
}

function atualizarFuncionario(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (_err, fields, files) => {
        if (
            !fields.id[0] ||
            !fields.nome[0] ||
            !fields.pis[0] ||
            !fields.cpf[0] ||
            !fields.rg[0] ||
            !fields.email[0] ||
            !fields.telefone[0]
        ) {
            req.session.msg = { txt: "Um erro inesperado ocorreu!", status: "danger" };
            return res.redirect("/lista");
        }

        const funcionario = await Database.findOne(process.env.DB_DATA_COLLECTION, { _id: new ObjectId(fields.id[0]) });
        const novoFuncionario = new Funcionario(
            fields.nome[0],
            fields.pis[0],
            fields.cpf[0],
            fields.rg[0],
            fields.email[0],
            fields.telefone[0],
            ""
        );

        try {
            const pictureData = files.foto[0];
            const oldPath = pictureData.filepath;
            const newPath = path.join(__dirname, "../../public/pictures", pictureData.newFilename + ".png");

            fs.copyFileSync(oldPath, newPath);
            fs.rmSync(oldPath);

            if (fs.existsSync(path.join(__dirname, "../../public/pictures", funcionario.foto + ".png")))
                fs.rmSync(path.join(__dirname, "../../public/pictures", funcionario.foto + ".png"));

            novoFuncionario.foto = pictureData.newFilename;
        } catch (error) {
            delete novoFuncionario.foto;
        }

        Database.updateOne(
            process.env.DB_DATA_COLLECTION,
            { _id: new ObjectId(fields.id[0]) },
            {
                $set: {
                    nome: novoFuncionario.nome,
                    email: novoFuncionario.email,
                    telefone: novoFuncionario.telefone,
                    cpf: novoFuncionario.cpf,
                    pis: novoFuncionario.pis,
                    rg: novoFuncionario.rg,
                    foto: novoFuncionario.foto ? novoFuncionario.foto : funcionario.foto,
                },
            }
        ).then(() => {
            req.session.msg = { txt: "O funcionário foi atualizado!", status: "success" };
            res.redirect("/lista");
        });
    });
}

async function deletarFuncionario(req, res) {
    const funcionario = await Database.findOne(process.env.DB_DATA_COLLECTION, { _id: new ObjectId(req.body.id) });

    if (fs.existsSync(path.join(__dirname, "../../public/pictures", funcionario.foto + ".png")))
        fs.rmSync(path.join(__dirname, "../../public/pictures", funcionario.foto + ".png"));

    Database.deleteOne(process.env.DB_DATA_COLLECTION, { _id: new ObjectId(req.body.id) }).then(() =>
        res.redirect("/lista")
    );
}

module.exports = { getFuncionarios, getFuncionario, addFuncionario, atualizarFuncionario, deletarFuncionario };

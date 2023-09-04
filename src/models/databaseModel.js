const { MongoClient } = require("mongodb");

const Database = {
    singleton: null,

    connect: async function () {
        if (this.singleton) return this.singleton;

        const client = new MongoClient(process.env.DB_URL);
        await client.connect();

        const instance = client.db(process.env.DB_NAME);

        this.singleton = instance;
        return instance;
    },

    findOne: async function (collection, filter) {
        const db = await this.connect();

        return db.collection(collection).findOne(filter);
    },

    findAll: async function (collection) {
        const db = await this.connect();

        return db.collection(collection).find().toArray();
    },

    insertOne: async function (collection, object) {
        const db = await this.connect();

        return db.collection(collection).insertOne(object);
    },

    updateOne: async function (collection, filter, data) {
        const db = await this.connect();

        return db.collection(collection).updateOne(filter, data);
    },

    deleteOne: async function (collection, filter) {
        const db = await this.connect();

        return db.collection(collection).deleteOne(filter);
    },
};

module.exports = Database;

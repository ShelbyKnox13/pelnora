"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var node_postgres_1 = require("drizzle-orm/node-postgres");
var pg_1 = require("pg");
var schema = require("../shared/schema");
var pool = new pg_1.Pool({
    host: 'localhost',
    port: 5432,
    database: 'pelnora',
    user: 'postgres',
    password: 'admin',
});
// Test the connection
pool.connect(function (err, client, release) {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    console.log('Successfully connected to database');
    release();
});
exports.db = (0, node_postgres_1.drizzle)(pool, { schema: schema });

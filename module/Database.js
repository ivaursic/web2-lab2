const { query } = require('express');
const { Pool } = require('pg');
var pg_format = require('pg-format');
import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

    class Database
    {
        constructor()
        {
            this.client = new Pool(
            {
                host: 'localhost',
                port: 5432,
                user: 'postgres',
                password: 'bazepodataka',
                database: 'web2-lab1',

                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                database: 'web2_demo_db',
                password: process.env.DB_PASSWORD,
                port: 5432,
                ssl : true
            });

            this.client.connect();
        }

        async searchCompetitionsByName(name, vulnerabilityEnabled) {
            console.log('Pojam za pretragu u data:', name);

            let query;

            if(vulnerabilityEnabled){
                query = 'SELECT username FROM competition WHERE competition_name=\'' + name + '\'';
            }
            else{
                query = pg_format(`SELECT username FROM competition WHERE competition_name=%L;`, name);
            }
            
            try {
            const results = await this.client.query(query);
            //const results = await this.pool.query(query, vulnerabilityEnabled ? [] : [name]);
            return results.rows;
            } catch (error) {
            console.error(error);
            throw error;
            }
        }


    }

    module.exports = new Database();
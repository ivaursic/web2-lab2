const { query } = require('express');
const { Pool } = require('pg');
var pg_format = require('pg-format');
const dotenv = require('dotenv');
dotenv.config()

    class Database
    {
        constructor()
        {
            this.client = new Pool(
            {
                user: 'natjecanja_hp6c_user',
                host: 'dpg-ckqq1og1hnes73avuvpg-a',
                database: 'natjecanja_hp6c',
                password: '1fyYE2OCCwLKp5XNlTfQAlAgiZQI79UL',
                port: 5432,
                ssl: {
                    rejectUnauthorized: false,
                  },
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
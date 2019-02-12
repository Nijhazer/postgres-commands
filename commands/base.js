const commandLineArgs = require('command-line-args'),
    path = require('path'),
    util = require('../util');

const pgURI = process.env['POSTGRES_URI'],
    { Pool } = require('pg'),
    baseParamDefs = [];

class BaseCommand {
    constructor(options = {}) {
        for (let optionKey of Object.keys(options)) {
            this[optionKey] = options[optionKey];
        }
        console.log(`Invoking command: ${this.name}`);
    }

    setup() {
        const paramDefs = baseParamDefs.concat(this.paramDefs || []);
        this.params = commandLineArgs(paramDefs, {
            partial: true
        });
        for (let paramDef of paramDefs) {
            if (typeof this.params[paramDef.name] === "undefined") {
                throw new Error(`Param '${paramDef.name}' is required.`);
            }
        }
        this._dbPool = new Pool({
            connectionString: pgURI
        });
    }

    async loadInput() {
        const inputPath = path.join(__dirname, '..', 'data', `${this.name}.dat`);
        try {
            const input = await util.readFile(inputPath);
            this.input = input;
        } catch (e) {
            this.input = null;
        }
    }

    async loadCSVInput(headings) {
        await this.loadInput();
        this.input = await util.parseCSVData(this.input, headings);
    }

    async executeQuery(sql) {
        return new Promise((resolve, reject) => {
            this._dbPool.connect((err, client, release) => {
                if (err) {
                    return reject(err);
                }
                client.query(sql, (err, result) => {
                    release();
                    if (err) {
                        return reject(err);
                    }
                    return resolve(result);
                });
            });
        });
    }

    async finish(error) {
        return await this._dbPool.end();
    }
}

module.exports = BaseCommand;
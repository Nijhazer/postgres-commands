const commandLineArgs = require('command-line-args'),
    path = require('path'),
    util = require('../util'),
    { Pool } = require('pg'),
    { PerformanceObserver, performance } = require('perf_hooks'),
    ms = require('ms-util');

const pgURI = process.env['POSTGRES_URI'],
    baseParamDefs = [];

const performanceObserver = new PerformanceObserver((items) => {
    const entry = items.getEntries()[0];
    console.info(`${entry.name}: ${ms.toWords(entry.duration)}`);
    performance.clearMarks();
});

performanceObserver.observe({
    entryTypes: ['measure']
});

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
        performance.mark('loadCSVInput.loadInput.start');
        await this.loadInput();
        performance.mark('loadCSVInput.loadInput.finish');
        performance.measure('loadCSVInput', 'loadCSVInput.loadInput.start', 'loadCSVInput.loadInput.finish');
        performance.mark('loadCSVInput.parseCSVData.start');
        this.input = await util.parseCSVData(this.input, headings);
        performance.mark('loadCSVInput.parseCSVData.finish');
        performance.measure('loadCSVInput', 'loadCSVInput.parseCSVData.start', 'loadCSVInput.parseCSVData.finish');
    }

    async executeQuery(sql) {
        return new Promise((resolve, reject) => {
            this._dbPool.connect((err, client, release) => {
                if (err) {
                    return reject(err);
                }
                performance.mark('executeQuery.start');
                client.query(sql, (err, result) => {
                    performance.mark('executeQuery.finish');
                    performance.measure('executeQuery', 'executeQuery.start', 'executeQuery.finish');
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
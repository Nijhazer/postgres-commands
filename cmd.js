'use strict';

const {
    getCommand
} = require('./util');

const command = getCommand();

command.setup();

command.run().then(async function handleSuccessfulCompletion() {
    const response = await command.finish();
    process.exit(0);
}).catch(async function handleError(err) {
    const response = await command.finish(err);
    process.exit(1);
});
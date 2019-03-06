# Postgres Commands

This is a Node tool for running Postgres database queries and doing some kind of reporting with the output. Example usage:

`node cmd display-urls-for-ids > out.csv`

This will invoke the `run()` method of `commands/display-urls-for-ids.js`. Commands extend `commands/base.js#BaseCommand`, which provides the methods `loadCSVInput` and `executeQuery`-- used for, respectively, loading input from a CSV file, and executing SQL queries.

To load a CSV file, you need to put that CSV file into `data/` as `<name-of-command>.dat`. When calling `loadCSVInput`, provide a list of column names. You'll then have a list of input row objects available on `this.input`.

To run SQL queries, ensure that your Postgres connection string is available in the environment variable `POSTGRES_URI`.

Most of the commands available here are designed to log CSV output to console, so that it can be directed into an output file as in the above example.
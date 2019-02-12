const BaseCommand = require('./base');

const sql = `
SELECT COUNT(c.id)
FROM content c,
brands_site site
WHERE site.site_prefix = 'CAD'
AND c.site_id = site.id
AND c.status = 3;`;

class FindURLsInContent extends BaseCommand {
    async run() {
        const response = await this.executeQuery(sql);
        console.log(response);
    }
}

module.exports = FindURLsInContent;
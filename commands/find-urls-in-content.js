const BaseCommand = require('./base'),
    { JSDOM } = require('jsdom');

const sql = `
SELECT
c.id,
c.body
FROM content c,
brands_site site
WHERE site.site_prefix = 'CAD'
AND c.site_id = site.id
AND c.status = 3;`;

class FindURLsInContent extends BaseCommand {
    async run() {
        let hrefToContentIDMap = {};
        const response = await this.executeQuery(sql);
        for (let row of response.rows) {
            let dom;
            try {
                dom = new JSDOM(row.body);
            } catch (e) {
                continue;
            }
            let links = dom.window.document.querySelectorAll('a');
            for (let link of links) {
                if (!hrefToContentIDMap[link.href]) {
                    hrefToContentIDMap[link.href] = [];
                }
                hrefToContentIDMap[link.href].push(row.id);
            }
        }
        await this.loadCSVInput([
            'url'
        ]);
        for (let row of this.input) {
            if (hrefToContentIDMap[row['url']]) {
                // console.log(row['url'], hrefToContentIDMap[row['url']]);
            }
        }
    }
}

module.exports = FindURLsInContent;
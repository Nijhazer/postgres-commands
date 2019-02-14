const BaseCommand = require('./base');

const sql = `
SELECT
c.id as content_id,
cm.id as media_id,
cm.role,
cm.image_id
FROM content c,
brands_site site,
content_media cm
WHERE site.site_prefix = 'CAD'
AND c.site_id = site.id
AND c.status = 3
AND cm.content_id = c.id
AND cm.role in (2, 3, 12)
ORDER BY
c.id,
cm.image_id,
cm.role;`;

class FindImageDuplicates extends BaseCommand {
    async run() {
        const response = await this.executeQuery(sql);
        let previousRowKey;
        let previousContentID;
        let duplicateFlags;
        console.log(`"content_id","social","lead","index"`);
        for (let row of response.rows) {
            let rowKey = `${row.content_id}-${row.image_id}-${row.role}`;
            if (!previousRowKey) {
                previousContentID = row.content_id;
                previousRowKey = rowKey;
                duplicateFlags = {
                    lead: false,
                    index: false,
                    social: false,
                };
                continue;
            }
            if (rowKey === previousRowKey) {
                switch (row.role) {
                    case 2:
                        duplicateFlags.social = true;
                    case 3:
                        duplicateFlags.lead = true;
                    case 12:
                        duplicateFlags.index = true;
                }
            }
            previousRowKey = rowKey;
            if (row.content_id !== previousContentID) {
                if (duplicateFlags.social || duplicateFlags.lead || duplicateFlags.index) {
                    console.log(`"${previousContentID}","${duplicateFlags.social}","${duplicateFlags.lead}","${duplicateFlags.index}"`);
                }
                previousContentID = row.content_id;
                duplicateFlags = {
                    lead: false,
                    index: false,
                    social: false,
                };
            }
        }
        if (duplicateFlags.social || duplicateFlags.lead || duplicateFlags.index) {
            console.log(`"${previousContentID}","${duplicateFlags.social}","${duplicateFlags.lead}","${duplicateFlags.index}"`);
        }
    }
}

module.exports = FindImageDuplicates;
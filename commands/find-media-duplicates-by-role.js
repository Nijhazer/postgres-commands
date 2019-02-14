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
cm.role,
cm.image_id;`;

class FindMediaDuplicatesByRole extends BaseCommand {
    async run() {
        const response = await this.executeQuery(sql);
        let previousContentID;
        let counts;
        console.log(`"content_id","social_count","lead_count","index_count"`);
        for (let row of response.rows) {
            if (!previousContentID) {
                previousContentID = row.content_id;
                counts = {
                    lead: 0,
                    index: 0,
                    social: 0,
                };
            }
            if (row.content_id !== previousContentID) {
                if ((counts.social > 1) || (counts.lead > 1) || (counts.index > 1)) {
                    console.log(`"${previousContentID}","${counts.social}","${counts.lead}","${counts.index}"`);
                }
                counts = {
                    lead: 0,
                    index: 0,
                    social: 0,
                };
                previousContentID = row.content_id;
            }
            switch (row.role) {
                case 2:
                    counts.social += 1;
                    break;
                case 3:
                    counts.lead += 1;
                    break;
                case 12:
                    counts.index += 1;
                    break;
            }
        }
        if ((counts.social > 1) || (counts.lead > 1) || (counts.index > 1)) {
            console.log(`"${previousContentID}","${counts.social}","${counts.lead}","${counts.index}"`);
        }
    }
}

module.exports = FindMediaDuplicatesByRole;
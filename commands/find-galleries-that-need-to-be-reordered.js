const BaseCommand = require('./base');

const sql = `
SELECT
cm.content_id,
cm.id as media_id,
cm.role,
cm.order_ as order
FROM content_media cm,
(
SELECT
c.id
from content c,
brands_site site,
display_types dt
WHERE c.status = 3
AND site.site_prefix = 'CAD'
AND c.site_id = site.id
AND dt.title = 'Gallery'
AND c.display_type_id = dt.id
) x
WHERE cm.content_id = x.id
ORDER BY cm.content_id, cm.id;`;


class FindGalleriesThatNeedToBeReordered extends BaseCommand {
    async run() {
        const response = await this.executeQuery(sql);
        let previousContentID,
            hasSlides = false,
            hasZeroOrderSlide = false;
        console.log('"id"');
        for (let row of response.rows) {
            if (!previousContentID) {
                previousContentID = row.content_id;
            }
            if (row.content_id !== previousContentID) {
                if (hasSlides && !hasZeroOrderSlide) {
                    console.log(`"${previousContentID}"`);
                }
                hasSlides = false;
                hasZeroOrderSlide = false;
            }
            if (row.role === 1) {
                hasSlides = true;
                if (row.order === 0) {
                    hasZeroOrderSlide = true;
                }
            }
            previousContentID = row.content_id;
        }
        if (hasSlides && !hasZeroOrderSlide) {
            console.log(`"${previousContentID}"`);
        }
    }
}

module.exports = FindGalleriesThatNeedToBeReordered;
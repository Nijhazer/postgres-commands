const BaseCommand = require('./base');

const sql = `
select
x.id,
x.slug,
x.display_id,
x.legacy_id,
x.section_slug,
sub_sec.slug as subsection_slug,
x.display_type_title
from (
select
c.id,
c.slug,
c.display_id,
c.legacy_id,
c.subsection_id,
sec.slug as section_slug,
dt.title as display_type_title
from
content c,
display_types dt,
sections sec
where c.id = $1::uuid
and dt.id = c.display_type_id
and sec.id = c.section_id
) x
left outer join sections sub_sec
on sub_sec.id = x.subsection_id;`;

function buildFREURL(urlPrefix, content) {
    let url = `${urlPrefix}/${content.section_slug}/`;
    if (content.display_type_title === 'Gallery') {
        url += 'g';
    } else {
        url += 'a';
    }
    if (content.legacy_id) {
        url += `${content.legacy_id}/`;
    } else {
        url += `${content.display_id}/`;
    }
    if (content.subsection_slug) {
        url += `${content.subsection_slug}/`;
    }
    url += `${content.slug}/`;
    return url;
}

function buildEditURL(urlPrefix, content) {
    return `${urlPrefix}/en/content/edit/${content.id}`;
}

class DisplayURLsForIDs extends BaseCommand {
    async run() {
        await this.loadCSVInput([
            'id',
            'fre_prefix',
            'edit_prefix'
        ]);
        console.log(`"id","fre_url","edit_url"`);
        for (let i = 1, inputRow; i < this.input.length; i += 1) {
            inputRow = this.input[i];
            let response;
            try {
                response = await this.executeQuery(sql, [inputRow['id']]);
            } catch (e) {
                console.error(e);
                return;
            }
            for (let j = 0, row; j < response.rows.length; j += 1) {
                row = response.rows[j];
                console.log(`"${inputRow['id']}","${buildFREURL(inputRow['fre_prefix'], row)}","${buildEditURL(inputRow['edit_prefix'], row)}"`);
            }
        }
    }
}

module.exports = DisplayURLsForIDs;
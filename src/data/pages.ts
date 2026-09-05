// Definitions for the static content pages (about / privacy / terms),
// mirroring the old Jinja templates key by key.
export interface StaticSection {
    titleKey: string;
    bodyKey: string;
    itemKeys?: string[];
}

export interface StaticPageDef {
    key: string;
    titleKey: string;
    /** Key for the meta description (page_note in the old routes). */
    descriptionKey: string;
    /** Key for the sub-heading below the h1. */
    headingNoteKey: string;
    headingNoteStyle: 'lead' | 'muted';
    tagsKey: string;
    sections: StaticSection[];
}

export const STATIC_PAGES: StaticPageDef[] = [
    {
        key: 'about',
        titleKey: 'about/name',
        descriptionKey: 'about/note',
        headingNoteKey: 'about/intro',
        headingNoteStyle: 'lead',
        tagsKey: 'about/tags',
        sections: [
            {
                titleKey: 'about/what_we_offer/title',
                bodyKey: 'about/what_we_offer/desc',
                itemKeys: [
                    'about/what_we_offer/item_images',
                    'about/what_we_offer/item_printables',
                    'about/what_we_offer/item_text',
                    'about/what_we_offer/item_video',
                ],
            },
            { titleKey: 'about/privacy_first/title', bodyKey: 'about/privacy_first/desc' },
            { titleKey: 'about/free/title', bodyKey: 'about/free/desc' },
        ],
    },
    {
        key: 'privacy',
        titleKey: 'privacy/name',
        descriptionKey: 'privacy/note',
        headingNoteKey: 'privacy/effective_date',
        headingNoteStyle: 'muted',
        tagsKey: 'privacy/tags',
        sections: [
            { titleKey: 'privacy/overview/title', bodyKey: 'privacy/overview/desc' },
            {
                titleKey: 'privacy/information_collect/title',
                bodyKey: 'privacy/information_collect/desc',
                itemKeys: ['privacy/information_collect/item_analytics'],
            },
            { titleKey: 'privacy/no_upload/title', bodyKey: 'privacy/no_upload/desc' },
            { titleKey: 'privacy/cookies/title', bodyKey: 'privacy/cookies/desc' },
            { titleKey: 'privacy/third_party/title', bodyKey: 'privacy/third_party/desc' },
            { titleKey: 'privacy/contact/title', bodyKey: 'privacy/contact/desc' },
        ],
    },
    {
        key: 'terms',
        titleKey: 'terms/name',
        descriptionKey: 'terms/note',
        headingNoteKey: 'terms/effective_date',
        headingNoteStyle: 'muted',
        tagsKey: 'terms/tags',
        sections: [
            { titleKey: 'terms/acceptance/title', bodyKey: 'terms/acceptance/desc' },
            { titleKey: 'terms/use_of_service/title', bodyKey: 'terms/use_of_service/desc' },
            { titleKey: 'terms/intellectual_property/title', bodyKey: 'terms/intellectual_property/desc' },
            { titleKey: 'terms/disclaimer/title', bodyKey: 'terms/disclaimer/desc' },
            { titleKey: 'terms/changes/title', bodyKey: 'terms/changes/desc' },
            { titleKey: 'terms/contact/title', bodyKey: 'terms/contact/desc' },
        ],
    },
];

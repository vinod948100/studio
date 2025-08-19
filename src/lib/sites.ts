import type { SiteKey } from "./types";

export const SITES: Record<SiteKey, { name: string; sitemapUrl: string; reportPathPrefix: string; }> = {
    truckopedia: {
        name: 'Truckopedia',
        sitemapUrl: 'https://www.truckopedia.com/page-sitemap.xml',
        reportPathPrefix: 'truckopedia/',
    },
    eform2290: {
        name: 'eForm2290',
        sitemapUrl: 'https://www.eform2290.com/all-pages-sitemap.xml',
        reportPathPrefix: 'eform2290/',
    },
    emcs150: {
        name: 'EMCS150',
        sitemapUrl: 'https://www.emcs150.com/all-pages-sitemap.xml',
        reportPathPrefix: 'emcs150/',
    },
};

import dotenv from "dotenv";
import { AbstractAdapter } from "./adapters/abstract-adapter";
import chalk from 'chalk';
import Crawler from 'crawler';
import { Database } from "./utils/db";
import adapterList from './adapters/adapter.enum';

dotenv.config();

let adapters: AbstractAdapter[] = [];
adapterList.map(adapter => adapters.push(new adapter()));

async function validateLinks(url: string, adapters: AbstractAdapter[], crawler: any): Promise<boolean> {
    if (!url) return false;
    for (let i = 0; i < adapters.length; i++) {
        if (adapters[i].validateLink(url)) {
            if (url.indexOf(adapters[i].baseUrl) === -1) {
                url = (adapters[i].baseUrl + url).replace('//', '/').replace('https:/', 'https://');
            }
            console.log(chalk.green('[INFO] ') + 'Queue URL ' + url);
            crawler.queue(url);
            return true;
        } else {
            console.log(chalk.green('[INFO] ') + 'Don\'t Queue URL ' + url);
        }
    }
    return false;
}

async function queueLinks($: any, crawler: any, adapters: AbstractAdapter[]): Promise<void> {
    let uniqueLinks: string[] = [];
    $('a').each(async (index: number, element: any) => {
        let link = $(element).attr('href');
        if (uniqueLinks.indexOf(link) === -1) {
            uniqueLinks.push(link);
            await validateLinks(link, adapters, crawler);
        }
    });
}

function initiateCrawl(crawler: any, adapters: AbstractAdapter[]): void {
    for (let i = 0; i < adapters.length; i++) {
        console.log(chalk.green('[INFO] ') + 'Queue ' + adapters[i].baseUrl);
        console.log(chalk.green('[INFO] ') + 'Queue ' + adapters[i].seedUrl);
        crawler.queue(adapters[i].baseUrl);
        crawler.queue(adapters[i].seedUrl);
    }
}

function getAdapter(url: string): AbstractAdapter {
    if (!url) return null;
    for (let i = 0; i < adapters.length; i++) {
        const adapter = adapters[i].isType(url);
        if (adapter) {
            return adapter;
        }
    }
    return null;
}

async function start() {
    await Database.getInstance().connect();
    let crawler = new Crawler({
        maxConnections: 1,
        callback: async (error: Error, res: any, done: Function) => {
            if (error) {
                console.log(chalk.red(error));
            } else {
                await queueLinks(res.$, crawler, adapters);
                const adapter = getAdapter(res.request.uri.href);
                if (adapter && adapter.validateListing(res.request.uri.href)) {
                    try {
                        let property = await adapter.parseData(res);
                        await adapter.store(property);
                    } catch (e) {
                        console.log(chalk.red('[ERROR] ' + typeof adapter) + ' Property is invalid', e);
                    }
                }
            }
            done();
        }
    });

    initiateCrawl(crawler, adapters);
}

start().then(() => {
    console.log('Crawler started');
}).catch(error => {
    console.log(error);
});

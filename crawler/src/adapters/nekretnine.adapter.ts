import {AbstractAdapter, PropertyType, ServiceType} from "./abstract-adapter";

export class NekretnineAdapter extends AbstractAdapter {
    baseUrl: string = 'https://www.nekretnine.rs/';
    seedUrl: string[] = ['https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/lista/po-stranici/10/'];

    getArea(entry: any): number {
        let area = 0;
        entry.$('.base-inf')
            .first().children('.row')
            .first().children('.col-sm-6')
            .each((rowIndex: number, row: any) => {
                if (entry.$(row).children('.dl-horozontal').children('dt').text().toLowerCase().indexOf('kvadratura') !== -1
                    || entry.$(row).children('.dl-horozontal').children('dt').text().toLowerCase().indexOf('korisna površina do') !== -1) {
                    area = parseInt(entry.$(row).children('.dl-horozontal').children('dd').text().trim());
                }
            });
        return area;
    }

    getDescription(entry: any): string {
        return entry.$('.cms-content-inner').text().trim();
    }

    getFloor(entry: any): number {
        let floor = null;
        entry.$('.row.pb-3')
            .children('.col-sm-6')
            .each((rowIndex: number, row: any) => {
                if (entry.$(row).children('.dl-horozontal').children('dt').text().toLowerCase().indexOf('sprat') !== -1) {
                    floor = entry.$(row).children('.dl-horozontal').children('dd').text();
                    if (floor.toString() === 'pr' || isNaN(parseInt(floor))) {
                        floor = '0';
                    }
                }
            });
        return parseInt(floor);
    }

    getFloors(entry: any): number {
        let floors = null;
        entry.$('.row.pb-3')
            .children('.col-sm-6')
            .each((rowIndex: number, row: any) => {
                if (entry.$(row).children('.dl-horozontal').children('dt').text().toLowerCase().indexOf('ukupan brој spratova') !== -1) {
                    floors = entry.$(row).children('.dl-horozontal').children('dd').text();
                    if (floors.toString() === 'pr' || isNaN(parseInt(floors))) {
                        floors = '0';
                    }
                }
            });
        return parseInt(floors);
    }

    getImage(entry: any): string {
        return entry.$('#property-d-1').children('.item').first().children('img').attr('src');
    }

    getPrice(entry: any): number {
        let price = entry.$('.label-value-primary')
            .children('.mt-auto').text().replace(' ', '');
        return parseInt(price);
    }

    getRooms(entry: any): number {
        let rooms = null;
        entry.$('.row.pb-3')
            .children('.col-sm-6')
            .each((rowIndex: number, row: any) => {
                if (entry.$(row).children('.dl-horozontal').children('dt').text().toLowerCase().indexOf('ukupan broj soba') !== -1) {
                    rooms = entry.$(row).children('.dl-horozontal').children('dd').text();
                }
            });
        return rooms;
    }

    getTitle(entry: any): string {
        return entry.$('h1.deatil-title').text();
    }

    validateLink(url: string): boolean {
        return (url.indexOf('stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/') !== -1 || url.indexOf('stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/lista/') !== -1) && url.indexOf('?order') === -1;
    }

    validateListing(url: string): boolean {
        return url.indexOf(this.baseUrl) !== -1 && url.indexOf('/stambeni-objekti/stanovi/') !== -1 && url.indexOf('/izdavanje-prodaja/') === -1 && url.indexOf('/grad/') === -1 && url.indexOf('/po-stranici/') === -1;
    }

    getServiceType(entry: any): ServiceType {
        let serviceType = null;
        entry.$('.base-inf')
            .first().children('.row')
            .first().children('.col-sm-6')
            .each((rowIndex: number, row: any) => {
                if (entry.$(row).children('.dl-horozontal').children('dt').text().toLowerCase().indexOf('transakcija') !== -1) {
                    serviceType = entry.$(row).children('.dl-horozontal').children('dd').text().trim().toLowerCase() === 'prodaja' ? ServiceType.SALE : ServiceType.RENT;
                }
            });
        return serviceType;
    }

    getType(entry: any): PropertyType {
        let propertyType = null;
        entry.$('.row.pb-3')
            .children('.col-sm-6')
            .each((rowIndex: number, row: any) => {
                if (entry.$(row).children('.dl-horozontal').children('dt').text().toLowerCase().indexOf('svrha korišćenja') !== -1) {
                    propertyType = entry.$(row).children('.dl-horozontal').children('dd').text().toLowerCase() === 'stan' ? PropertyType.APARTMENT : PropertyType.HOUSE;
                }
            });
        return propertyType;
    }
}
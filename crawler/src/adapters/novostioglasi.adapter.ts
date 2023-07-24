import {AbstractAdapter, PropertyType, ServiceType} from "./abstract-adapter";

export class NovostioglasiAdapter extends AbstractAdapter {
  baseUrl: string = 'http://www.kvadratnekretnine.com/';
  seedUrl: string[] = ['http://www.kvadratnekretnine.com/sr/nekretnine/prodaja/'];

  isType(url: string): NovostioglasiAdapter {
    if (url.indexOf(this.baseUrl) !== -1) {
      return this;
    }
    return null;
  }

  getArea(entry: any): number {
    let area = 0;
    entry.$('.property-d-table .col-md-6')
      .first().children('table')
      .first().children('tbody')
      .first().children('tr')
      .each((rowIndex: number, row: any) => {
        if (entry.$(row).children('td').first().text().toLowerCase() === 'kvadratura') {
          area = parseFloat(entry.$(row).children('td').last().text());
        }
      });
    return area;
  }

  getDescription(entry: any): string {
    return entry.$('#description').text();
  }

  getFloor(entry: any): number {
    let floor = null;
    entry.$('.property-d-table .col-md-6')
      .last().children('table')
      .first().children('tbody')
      .first().children('tr')
      .each((rowIndex: number, row: any) => {
        if (entry.$(row).children('td').first().text().toLowerCase() === 'sprat') {
          floor = entry.$(row).children('td').last().text();
          if (floor.toString() === 'pr' || isNaN(parseInt(floor))) {
            floor = '0';
          }
        }
      });
    return parseInt(floor);
  }

  getFloors(entry: any): number {
    let floors = null;
    entry.$('.property-d-table .col-md-6')
      .last().children('table')
      .first().children('tbody')
      .first().children('tr')
      .each((rowIndex: number, row: any) => {
        if (entry.$(row).children('td').first().text().toLowerCase() === 'broj spratova') {
          floors = entry.$(row).children('td').last().text();
        }
      });
    return parseInt(floors);
  }

  getImage(entry: any): string {
    return entry.$('#property-d-1').children('.item').first().children('img').attr('src');
  }

  getPrice(entry: any): number {
    let price = null;
    entry.$('.property-d-table .col-md-6')
      .first().children('table')
      .first().children('tbody')
      .first().children('tr')
      .each((rowIndex: number, row: any) => {
        if (entry.$(row).children('td').first().text().toLowerCase() === 'ukupna cena') {
          price = parseFloat(entry.$(row).children('td').last().text().replace('.', ''));
        }
      });
    return price;
  }

  getRooms(entry: any): number {
    let rooms = null;
    entry.$('.property-d-table .col-md-6')
      .first().children('table')
      .first().children('tbody')
      .first().children('tr')
      .each((rowIndex: number, row: any) => {
        if (entry.$(row).children('td').first().text().toLowerCase() === 'broj soba') {
          rooms = parseFloat(entry.$(row).children('td').last().text());
        }
      });
    return rooms;
  }

  getTitle(entry: any): string {
    return entry.$('h1').text();
  }

  validateLink(url: string): boolean {
    return url.indexOf(this.baseUrl) !== -1 && (url.indexOf('sr/listing/') !== -1 || url.indexOf('sr/nekretnine/prodaja/') !== -1);
  }

  validateListing(url: string): boolean {
    return url.indexOf(this.baseUrl) !== -1 && url.indexOf('sr/listing/') !== -1;
  }

  getServiceType(entry: any): ServiceType {
    let serviceType = null;
    entry.$('.property-d-table .col-md-6')
      .last().children('table')
      .first().children('tbody')
      .first().children('tr')
      .each((rowIndex: number, row: any) => {
        if (entry.$(row).children('td').first().text().toLowerCase() === 'usluga') {
          serviceType = entry.$(row).children('td').last().text().toLowerCase() === 'prodaja' ? ServiceType.SALE : ServiceType.RENT;
        }
      });
    return serviceType;
  }

  getType(entry: any): PropertyType {
    let propertyType = null;
    entry.$('.property-d-table .col-md-6')
      .first().children('table')
      .first().children('tbody')
      .first().children('tr')
      .each((rowIndex: number, row: any) => {
        if (entry.$(row).children('td').first().text().toLowerCase() === 'tip') {
          propertyType = entry.$(row).children('td').last().text().toLowerCase() === 'stan' ? PropertyType.APARTMENT : PropertyType.HOUSE;
        }
      });
    return propertyType;
  }
}
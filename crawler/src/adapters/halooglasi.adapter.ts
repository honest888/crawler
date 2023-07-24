import {AbstractAdapter, PropertyType, ServiceType} from "./abstract-adapter";

export class HalooglasiAdapter extends AbstractAdapter {
  baseUrl: string = 'https://www.halooglasi.com';
  seedUrl: string[] = ['https://www.halooglasi.com/nekretnine/prodaja-stanova/beograd'];

  isType(url: string): HalooglasiAdapter {
    if (url.indexOf(this.baseUrl) !== -1) {
      return this;
    }
    return null;
  }

  getArea(entry: any): number {
    return parseFloat(entry.$('#plh12').text());
  }

  getDescription(entry: any): string {
    return entry.$('#plh50').text();
  }

  getFloor(entry: any): number {
    return parseInt(entry.$('#plh18').text());
  }

  getFloors(entry: any): number {
    return parseInt(entry.$('#plh19').text());
  }

  getImage(entry: any): string {
    return entry.$('.fotorama__stage__shaft fotorama__grab')
      .first().children('.fotorama__stage__frame')
      .first().children('img')
      .attr('src');
  }

  getPrice(entry: any): number {
    return parseFloat(entry.$('.offer-price-value').first().text());
  }

  getRooms(entry: any): number {
    return parseFloat(entry.$('#plh13').text());
  }

  getTitle(entry: any): string {
    console.log('title', entry.$('#plh1').text());
    return entry.$('#plh1').text();
  }

  validateLink(url: string): boolean {
    return url.indexOf('nekretnine/prodaja-stanova') !== -1;
  }

  validateListing(url: string): boolean {
    return url.indexOf('nekretnine/prodaja-stanova') !== -1;
  }

  getServiceType(entry: any): ServiceType {
    return ServiceType.SALE;
  }

  getType(entry: any): PropertyType {
    return entry.$('#plh11')
      .text().toLowerCase() === 'stan' ? PropertyType.APARTMENT : PropertyType.HOUSE;
  }
}
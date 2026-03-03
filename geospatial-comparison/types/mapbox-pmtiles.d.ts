declare module "mapbox-pmtiles/dist/mapbox-pmtiles.js" {
  export const SOURCE_TYPE: string;
  export class PmTilesSource {
    static SOURCE_TYPE: string;
    static getHeader(url: string): Promise<{
      minLon: number;
      minLat: number;
      maxLon: number;
      maxLat: number;
      minZoom: number;
      maxZoom: number;
    }>;
  }
}

import { HttpParams } from "@angular/common/http";

export class Constants {
    public static readonly COIN_API = "https://api.coingecko.com/api/v3";
    public static readonly NOMICS_API = "https://api.nomics.com/v1";

    public static readonly KEY1 = '2e6869bdd813e302a273c7acd47a8272';
    public static readonly KEY2 = 'dd0fb6d7085993e10e3a8053075802e8';

    public static readonly PARAMS_G = new HttpParams({
        fromObject: {
          key: Constants.KEY1,
          start: '2014-01-01T00:00:00Z',
          end: '2021-04-07T00:00:00Z'
        }
    })

    public static readonly PARAMS_V = new HttpParams({
        fromObject: {
          key: Constants.KEY2,
          start: '2014-01-01T00:00:00Z',
          end: '2021-04-07T00:00:00Z'
        }
    })

    public static readonly PARAMS_BTC = new HttpParams({
      fromObject: {
        vs_currency: 'usd',
        from: '1388552400',
        to: '1617768000'
      }
    })

}
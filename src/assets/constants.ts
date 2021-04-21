import { HttpParams } from "@angular/common/http";

export class Constants {

    public static readonly CORS_PROXY = 'https://stormy-earth-72272.herokuapp.com/'

    public static readonly COIN_API = "https://api.coingecko.com/api/v3";
    public static readonly NOMICS_API = Constants.CORS_PROXY + "https://api.nomics.com/v1";

    public static readonly KEY1 = '2e6869bdd813e302a273c7acd47a8272';
    public static readonly KEY2 = 'dd0fb6d7085993e10e3a8053075802e8';
    public static readonly KEY3 = '32c804afce33f622f1f820754f736009';
    public static readonly KEY4 = 'e2c2b9f41513ecbe6c6c8ac28fa74a08';
    public static readonly KEY5 = '76656826b98b98ef19af9e2b4e8cc429';


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

    public static readonly PARAMS_BTC2 = new HttpParams({
      fromObject: {
        vs_currency: 'usd',
        from: '1388552400',
        to: '1617768000'
      }
    })

    public static readonly PARAMS_SEXY1 = new HttpParams({
      fromObject: {
        key: Constants.KEY3,
        start: '2014-01-05T00:00:00Z',
        end: '2014-01-05T00:00:00Z'
      }
    })

    public static readonly PARAMS_SEXY2 = new HttpParams({
      fromObject: {
        key: Constants.KEY4,
        start: '2018-01-07T00:00:00Z',
        end: '2018-01-07T00:00:00Z',
      }
    })

}
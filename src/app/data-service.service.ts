import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Constants } from '../assets/constants'

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { 
  }

  private retrieveDataTest(): Promise<any> {
    
    let params_BTC = new HttpParams({
      fromObject: {
        vs_currency: 'usd',
        days: '2654',
        interval: 'daily'
      }
    })

    let global = this.http.get(Constants.NOMICS_API + '/market-cap/history', {params: Constants.PARAMS_G})
    let volume = this.http.get(Constants.NOMICS_API + '/volume/history', {params: Constants.PARAMS_V})
    let btc    = this.http.get(Constants.COIN_API + '/coins/bitcoin/market_chart', {params: params_BTC})

    return forkJoin([global, btc, volume]).toPromise()
  }

  public async getProcessedData(): Promise<Object> {

    const res = await this.retrieveDataTest()

    const btcDom = res[1].market_caps.map((e, i) => {
      const cap = e[1]/res[0][i].market_cap

      return cap > 1 ? 1.0 : cap
    })

    return {
      global: res[0],
      volume: res[2],
      btcPrice: this.formatDate(res[1].prices),
      btcDom: btcDom
    }
  }

  private formatDate(data: any) {
    const dates = [];
    data.forEach(element => {
      let d = new Date(element[0]);
      dates.push([d, element[1]]);
    });
    
    return dates
  }
}



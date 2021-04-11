import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Constants } from '../assets/constants'
import { IDataMarketGlobal } from 'src/assets/Interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { 
  }

  private retrieveDataTest(): Promise<any> {

    let global = this.http.get(Constants.NOMICS_API + '/market-cap/history', {params: Constants.PARAMS_G})
    let volume = this.http.get(Constants.NOMICS_API + '/volume/history', {params: Constants.PARAMS_V})
    let btc    = this.http.get(Constants.COIN_API + '/coins/bitcoin/market_chart/range', {params: Constants.PARAMS_BTC})

    return forkJoin([global, btc, volume]).toPromise()
  }

  public async getProcessedData(): Promise<Object> {

    const res = await this.retrieveDataTest()

    
    const global = this.formatDateString(res[0])
    const btcPrice = this.formatDateUnix(res[1].prices)
    const volume = res[2]
    const btcDom = []
    
    const globalMap = this.arrayToMap(global)
    const btcMC = this.arrayToMap(this.formatDateUnix(res[1].market_caps))
    

    btcMC.forEach((val: any, key: any) => {
      if (!globalMap.has(key))
        return

      const temp = val.value / globalMap.get(key).value * 100
      const cap  = temp > 100 ? 100 : temp
      
      btcDom.push([val.timestamp, cap])
    })

    return {
      global: global,
      volume: volume,
      btcPrice: btcPrice,
      btcDom: btcDom
    }
  }

  private formatDateUnix(data: any) {
    const dates = [];
    data.forEach(e => {
      let d = new Date(e[0]);
      dates.push([d, e[1]])
    });
    
    return dates
  }

  private formatDateString(data: IDataMarketGlobal[]) {
    const dates = [];
    data.forEach((e: IDataMarketGlobal) => {
      let d = new Date(e.timestamp);
      dates.push([d, e.market_cap])
    });
    
    return dates
  }

  private arrayToMap(arr) {
    const map = new Map()

    arr.forEach(e => {
      map.set(e[0].toString(), {
        timestamp: e[0],
        value :e[1]
      })
    });

    return map
  }
}



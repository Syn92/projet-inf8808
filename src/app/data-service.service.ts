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

  public async getProcessedDataViz1(): Promise<Object> {
    const path = '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    const coinList: any = await this.http.get(Constants.COIN_API + path, {params: Constants.PARAMS_BTC}).toPromise()    

    const top2014 = ["bitcoin", "litecoin", "ripple", "peercoin", "omni", "nxt", "namecoin", "bitshares", "quark", "megacoin"];
    const top2017 = ["bitcoin", "ethereum", "bitcoin-cash", "ripple", "litecoin", "cardano", "iota", "dash", "nem", "monero"];

    const coinsWithMarketCap = {
      '2014': {},
      '2017': {},
      '2021': {},
    };

    const dateA2014 = Math.round((new Date(2014, 0, 5, 0, 0, 0).getTime()/1000))
    const dateB2014 = Math.round((new Date(2014, 0, 5, 23, 59, 59).getTime()/1000))
    
    
    for (const id in top2014) {
      const path1 = `/coins/${top2014[id]}/market_chart/range?vs_currency=usd&from=${dateA2014}&to=${dateB2014}`
      const request: any = await this.http.get(Constants.COIN_API + path1, {params: Constants.PARAMS_BTC}).toPromise()
      coinsWithMarketCap['2014'][`${top2014[id]}`] = request.market_caps[0][1]
      coinsWithMarketCap['2014']['market_cap'] = request.market_caps[0][0]
    }

    const dateA2017 = Math.round((new Date(2017, 11, 17, 0, 0, 0).getTime()/1000))
    const dateB2017 = Math.round((new Date(2017, 11, 17, 23, 59, 59).getTime()/1000))

    for (const id in top2017) {
      const path1 = `/coins/${top2017[id]}/market_chart/range?vs_currency=usd&from=${dateA2017}&to=${dateB2017}`
      const request: any = await this.http.get(Constants.COIN_API + path1, {params: Constants.PARAMS_BTC}).toPromise()
      coinsWithMarketCap['2017'][`${top2017[id]}`] = request.market_caps[0][1]
      coinsWithMarketCap['2017']['market_cap'] = request.market_caps[0][0]
    }
    
    const dateA2021 = Math.round((new Date().getTime()/1000 - 86460*2))
    const dateB2021 = Math.round((new Date().getTime()/1000 - 86400))

    for (const coin in coinList) {
      const id = coinList[coin].id
      const path1 = `/coins/${id}/market_chart/range?vs_currency=usd&from=${dateA2021}&to=${dateB2021}`
      const request: any = await this.http.get(Constants.COIN_API + path1, {params: Constants.PARAMS_BTC}).toPromise()
      coinsWithMarketCap['2021'][`${id}`] = request.market_caps[0][1]
      coinsWithMarketCap['2021']['market_cap'] = request.market_caps[0][0]
    }
    
    return coinsWithMarketCap;
  }

  // private getAverageCap(marketCaps: number[]): any {
  //   let sum = 0
  //   for( var i = 0; i < marketCaps.length; ++i ) {
  //     sum += marketCaps[i][1]
  //   }
  //   return sum/marketCaps.length
  // }

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
    const volume = res[2].map(d => {
      const date = new Date(d.timestamp)
      const vol = parseInt(d.volume)

      return [date, vol]
    })
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
      dates.push([d, parseInt(e.market_cap)])
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



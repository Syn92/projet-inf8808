import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
    const global2014 = await this.http.get(Constants.NOMICS_API + '/market-cap/history', {params: Constants.PARAMS_SEXY1}).toPromise()
    const global2018 = await this.http.get(Constants.NOMICS_API + '/market-cap/history', {params: Constants.PARAMS_SEXY2}).toPromise()
    const today = new Date()
    today.setHours(0,0,0,0)
    const params = new HttpParams({
      fromObject: {
        key: Constants.KEY5,
        start: today.toISOString(),
        end: today.toISOString()
      }
    })
    
    const global2021 = await this.http.get(Constants.NOMICS_API + '/market-cap/history', {params: params}).toPromise()

    const path = '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    const coinList: any = await this.http.get(Constants.COIN_API + path, {params: Constants.PARAMS_BTC}).toPromise()    

    const top2014 = ["bitcoin", "litecoin", "ripple", "peercoin", "omni", "nxt", "namecoin", "bitshares", "quark", "megacoin"];
    const top2018 = ["bitcoin", "ethereum", "bitcoin-cash", "ripple", "litecoin", "cardano", "iota", "dash", "nem", "monero"];

    const coinsWithMarketCap = {
      '2014': {
        market_cap: 0,
        coins: []
      },
      '2018': {
        market_cap: 0,
        coins: []
      },
      '2021': {
        market_cap: 0,
        coins: []
      },
    };

    const dateA2014 = Math.round((new Date(2014, 0, 5, 0, 0, 0).getTime()/1000))
    const dateB2014 = Math.round((new Date(2014, 0, 5, 23, 59, 59).getTime()/1000))
    console.log("fetching1");
    let tempSum = 0;
    for (const id in top2014) {
      const path1 = `/coins/${top2014[id]}/market_chart/range?vs_currency=usd&from=${dateA2014}&to=${dateB2014}`
      const request: any = await this.http.get(Constants.COIN_API + path1, {params: Constants.PARAMS_BTC}).toPromise()
      coinsWithMarketCap['2014']['coins'].push({coin: top2014[id], parent: '2014', market_cap: request.market_caps[0][1]})
      tempSum += request.market_caps[0][1];     
    }

    coinsWithMarketCap['2014']['market_cap'] = Number(global2014[0].market_cap)
    coinsWithMarketCap['2014']['coins'].push({coin: "2014", parent: '', market_cap: ""})
    coinsWithMarketCap['2014']['coins'].push({
      coin: "others", parent: '2014', 
      market_cap: Math.abs(coinsWithMarketCap['2014']['market_cap'] - tempSum)
    })
    console.log("fetching2");

    const dateA2018 = Math.round((new Date(2018, 0, 7, 0, 0, 0).getTime()/1000))
    const dateB2018 = Math.round((new Date(2018, 0, 7, 23, 59, 59).getTime()/1000))
    tempSum = 0

    for (const id in top2018) {
      const path1 = `/coins/${top2018[id]}/market_chart/range?vs_currency=usd&from=${dateA2018}&to=${dateB2018}`
      const request: any = await this.http.get(Constants.COIN_API + path1, {params: Constants.PARAMS_BTC}).toPromise()
      coinsWithMarketCap['2018']['coins'].push({coin: top2018[id], parent: '2018', market_cap: request.market_caps[0][1]})
      tempSum += request.market_caps[0][1];
    }
    coinsWithMarketCap['2018']['market_cap'] = Number(global2018[0].market_cap)
    coinsWithMarketCap['2018']['coins'].push({coin: "2018", parent: '', market_cap: ""})
    coinsWithMarketCap['2018']['coins'].push({
      coin: "others", parent: '2018', 
      market_cap: coinsWithMarketCap['2018']['market_cap'] - tempSum
    })
    const dateA2021 = Math.round((new Date().getTime()/1000 - 86460*2))
    const dateB2021 = Math.round((new Date().getTime()/1000 - 86400))
    tempSum = 0
    console.log("fetching3");

    for (const coin in coinList) {
      const id = coinList[coin].id
      const path1 = `/coins/${id}/market_chart/range?vs_currency=usd&from=${dateA2021}&to=${dateB2021}`
      const request: any = await this.http.get(Constants.COIN_API + path1, {params: Constants.PARAMS_BTC}).toPromise()
      coinsWithMarketCap['2021']['coins'].push({coin: id, parent: '2021', market_cap: request.market_caps[0][1]})
      tempSum += request.market_caps[0][1];
    }

    coinsWithMarketCap['2021']['market_cap'] = Number(global2021[0].market_cap)
    coinsWithMarketCap['2021']['coins'].push({coin: "2021", parent: '', market_cap: ""})
    coinsWithMarketCap['2021']['coins'].push({
      coin: "others", parent: '2021', 
      market_cap: coinsWithMarketCap['2021']['market_cap'] - tempSum
    })
    
    return coinsWithMarketCap;
  }

  public async getProcessedDataViz2(): Promise<any> {
    const btc = await this.http.get(Constants.COIN_API + '/coins/bitcoin/market_chart/range', {params: Constants.PARAMS_BTC2}).toPromise()
    return this.formatDateUnixToDate((btc as any).prices)
  }

  private retrieveData(): Promise<any> {

    let global = this.http.get(Constants.NOMICS_API + '/market-cap/history', {params: Constants.PARAMS_G})
    let btc    = this.http.get(Constants.COIN_API + '/coins/bitcoin/market_chart/range', {params: Constants.PARAMS_BTC})
    let volume = this.http.get(Constants.NOMICS_API + '/volume/history', {params: Constants.PARAMS_V})
    let trend  = this.http.get('assets/data/bitcoin-trend.json').toPromise()

    return forkJoin([global, btc, volume, trend]).toPromise()
  }

  public async getProcessedData(): Promise<Object> {

    const res = await this.retrieveData()
    const global = this.formatDateString(res[0])
    const btcPrice = this.formatDateUnix(res[1].prices)
    const btcDom = []
    const volumeDetailed = res[2].map(d => {
      const date = new Date(d.timestamp)
      const vol = parseInt(d.volume)

      return [date, vol]
    })
    const volume = this.formatVolume(volumeDetailed)
    
    const globalMap = this.arrayToMap(global)
    const btcMC = this.arrayToMap(this.formatDateUnix(res[1].market_caps))
    const domArray: Number[] = [];

    btcMC.forEach((val: any, key: any) => {
      if (!globalMap.has(key)){
        return
      }

      const btc = val.value - (val.value % 1000000)
      const global = globalMap.get(key).value - (globalMap.get(key).value % 1000000)

      const temp = btc / global * 100
      const dom  = temp > 100 ? 100 : temp.toFixed(0)
      domArray.push(Number(dom));
      btcDom.push([val.timestamp, dom])
    })
    var btcDomSmoothed: Number[] = [];
    btcDomSmoothed =  this.EMACalc(domArray, 20)
    for (let i = 0; i < btcDom.length; i++) {
      btcDom[i][1] = btcDomSmoothed[i]
    }

    let trend = res[3].map(e => {
      return [new Date(e.Month), e.bitcoin]
    })
    
    return [
      {type: "global", values: global},
      {type: "volume", values: volume},
      {type: "btcPrice", values: btcPrice},
      {type: "btcDom", values: btcDom},
      {type: "trend", values: trend},
      
    ]
  }

  private EMACalc(mArray,mRange) {
    var k = 2/(mRange + 1);
    // first item is just the same as the first item in the input
    const emaArray = [mArray[0]];
    // for the rest of the items, they are computed with the previous one
    for (var i = 1; i < mArray.length; i++) {
      emaArray.push(mArray[i] * k + emaArray[i - 1] * (1 - k));
    }
    return emaArray;
  }
  
  private formatVolume(data) {
    var monthIndex = []
    const monthAvg = []

    // get the index of the last day of every month and of the last day in the dataset
    data.forEach((v: [Date, number], i: number) => {
      if ((v[0].getFullYear() == 2013))
        return
      
      if ((i == data.length - 1) || (v[0].getMonth() != data[i + 1][0].getMonth()))
      monthIndex.push(i)
    })
    
    // keep only every other month (Feb, Apr, Jun, Aug, Oct, Dec) of every year
    monthIndex = monthIndex.filter((v, i) => i % 2 === 1)

    // calculate average between two months (ex: between Jan and Feb, Mar and Apr, etc)
    monthIndex.forEach((v, i) => {
      if (i == 0) {
        monthAvg.push([new Date(data[v][0].getFullYear(), data[v][0].getMonth(),0), this.calculateAverage(data.slice(0, v + 1))])
      } else {
        monthAvg.push([new Date(data[v][0].getFullYear(), data[v][0].getMonth(),0), this.calculateAverage(data.slice(monthIndex[i - 1] + 1, v + 1))])
      }
    })

    return {
      average: monthAvg,
      detailed: data
    }
  }

  private calculateAverage(arr) {
    return arr.reduce((a, b) => a + b[1], 0) / arr.length
  }

  private formatDateUnix(data: any) {
    const dates = [];
    data.forEach(e => {
      let d = new Date(e[0]);
      dates.push([d, e[1]])
    });
    
    return dates
  }

  private formatDateUnixToDate(data: any) {
    const dates = [];
    data.forEach(e => {
      const d = new Date(e[0]);
      const formated = `${d.getFullYear()}-${(d.getMonth()+1)>=10?(d.getMonth()+1):"0"+(d.getMonth()+1)}-${d.getDate()>=10?d.getDate():"0"+d.getDate()}`;
      dates.push([formated, e[1]])
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



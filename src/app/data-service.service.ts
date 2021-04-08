import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API1 = "https://api.coingecko.com/api/v3";
const API2 = "https://api.nomics.com/v1";
@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { 
  }

  public async retrieveData(): Promise<Object> {
    

    const allData = {
      btc: {},
      global: {},
      volume: {},
      BtcDom: []
    }

    let params = new HttpParams({
      fromObject: {
        key: '2e6869bdd813e302a273c7acd47a8272',
        start: '2014-01-01T00:00:00Z',
        end: '2021-04-07T00:00:00Z'
      }
    })
    
    this.http.get(API2 + '/market-cap/history', {params: params}).subscribe((res) => {
      allData.global = res
    })
    this.http.get(API2 + '/volume/history', {params: params}).subscribe((res)=>{
      allData.volume = res
    });
    this.http.get(API1 + '/coins/bitcoin/market_chart?vs_currency=usd&days=2654&interval=daily').subscribe((res)=>{
      allData.btc = res;
      allData.btc['market_caps'].forEach((element, i) => {
        allData.BtcDom.push(element[1]/allData.global[i].market_cap)
      });
    });
    

    console.log(allData)

    return new Promise<Object>((resolve,reject)=>{
      
    })
  }
}


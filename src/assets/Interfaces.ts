export interface IDataMarketGlobal {
    timestamp: string,
    market_cap: string,
}
  
export interface IDataVolume {
    timestamp: string,
    volume: string,
    spot_volume: string,
    derivative_volume: string,
}

export interface IData {
    btcPrice: [],
    btcDom: number[],
    global: IDataMarketGlobal[],
    volume: IDataVolume
}
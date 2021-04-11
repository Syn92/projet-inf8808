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

export interface IMapValue {
    timestamp: Date,
    value
}

export interface IData {
    btcPrice: [],
    btcDom: [],
    global: [],
    volume: IDataVolume[]
}
import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';

const symbols = {
  bitcoin: 'BTC',
  litecoin: 'LTC',
  ripple: 'XRP',
  peercoin: 'PPC',
  omni: 'OMNI',
  nxt: 'NXT',
  namecoin: 'NMC',
  bitshares: 'BTS',
  quark: 'QRK',
  megacoin: 'MEC',
  ethereum: 'ETH',
  ['bitcoin-cash']: 'BCH',
  cardano: 'ADA',
  iota: 'MIOTA',
  dash: 'DASH',
  nem: 'NEM',
  monero: 'XMR',
  binancecoin: 'BNB',
  tether: 'USDT',
  polkadot: 'DOT',
  uniswap: 'UNI',
  dogecoin: 'DOGE',
  others: 'OTH'
}

@Component({
  selector: 'app-data-viz1',
  templateUrl: './data-viz1.component.html',
  styleUrls: ['./data-viz1.component.scss']
})
export class DataViz1Component implements OnInit {

  tooltip = undefined;

  displaySpinner = true;
  coinLists = {}

  marketCap2014 = 0
  marketCap2018 = 0
  marketCap2021 = 0

  constructor(private dataService: DataService, private http: HttpClient) {
  }

  async ngOnInit(): Promise<void> {

    this.getFolder().then(res => {
      this.coinLists = res;

    }).catch(async e => {
      console.log("dataviz1.json not found");
      this.coinLists = await this.dataService.getProcessedDataViz1();

    }).finally(() => {
      this.displaySpinner = false;
      this.sortMofo()
      this.findSymbol();
      this.findGrowth()
      console.log(this.coinLists);
      this.setupToolTip();
      this.displayGraph();

    });

  }

  private sortMofo(): void {
    for (const key in this.coinLists) {
      this.coinLists[key]['coins'] = this.coinLists[key]['coins'].sort((a,b) => (a.market_cap < b.market_cap) ? 1 : ((b.market_cap < a.market_cap) ? -1 : 0))
      for (const i in this.coinLists[key]['coins']) {
        this.coinLists[key]['coins'][i]['rank'] = Number(i)+1
      }
    }
  }

  private setupToolTip(): void {
    this.tooltip = d3.select(".tooltip")
    .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
  
  }

  private displayGraph(): void {
    this.createSVG('#graph1a', '2014', this.tooltip)
    this.createSVG('#graph1b', '2018', this.tooltip)
    this.createSVG('#graph1c', '2021', this.tooltip)

    this.marketCap2014 = this.coinLists['2014']['market_cap']
    this.marketCap2018 = this.coinLists['2018']['market_cap']
    this.marketCap2021 = this.coinLists['2021']['market_cap']
  }

  private createSVG(id: string, year: string, tooltip: any) {
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 500 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;
    
    var svg = d3.select(id)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
          
    var root = d3.stratify()
      .id(function(d:any) { return d.coin; })
      .parentId(function(d:any) { return d.parent; })(this.coinLists[year]['coins'])
    
    root.sum(function(d:any) { return d.market_cap })
    
    d3.treemap()
      .tile(d3.treemapSquarify.ratio(0.5))
      .size([width, height])
      .padding(4)
      (root)

    var colorScale = d3
      .scaleLinear<string>()
      .domain([-80, -2, 2, 80])
      .range(["DarkRed", "IndianRed", "LightGreen", "Chartreuse"])

    // const g = 
    // const tip = d3Tip.tip().attr('class', 'd3-tip').html(function (d) { return tooltip.getContents(d) })
    
    svg
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
        .attr('id', function(d:any) { return `Y${d.parent.data.coin}R${d.data.rank}`})
        .attr('class', function(d:any) {return `rank${d.data.rank}`})
        .attr('x', function (d:any) { return d.x0; })
        .attr('y', function (d:any) { return d.y0; })
        .attr('width', function (d:any) { return d.x1 - d.x0; })
        .attr('height', function (d:any) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .attr("fill", function (d:any) { return colorScale(d.data.growth)})
        .on("mouseover", function(d:any) {
          // console.log(this);
          
          // tooltip.style("visibility", "visible")
          // tooltip.html(
          //   `<p>${d.data.coin}</p>` +
          //   "<img src='https://github.com/holtzy/D3-graph-gallery/blob/master/img/section/ArcSmal.png?raw=true'></img>" +
          //   "<br>Fancy<br><span style='font-size: 40px;'>Isn't it?</span>");
        })
        .on("mouseout", function(d:any) {
          // tooltip.style("visibility", "hidden")
        })



    svg
      .selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
        .attr("x", function(d:any){ 
          return ((d.x0 + d.x1) / 2) - (85 * (d.x1 - d.x0) / width) - 3
        })
        .attr("y", function(d:any){ 
          return ((d.y0 + d.y1) / 2) + (40 * (d.x1 - d.x0) / width)
        })
        .text(function(d:any){ return d.data.symbol})
        .attr("font-size", function(d:any){ 
          return String((100 * (d.x1 - d.x0) / width)) + "px"
        }) 
        .attr("fill", "white")
        .on("mouseover", function(d:any) {
          tooltip.style("visibility", "visible")
        })
        .on("mouseout", function(d:any) {
          tooltip.style("visibility", "hidden")
        })
  }

  async getFolder(): Promise<string> {
    return this.http.get<any>(`assets/data/dataviz1.json`).toPromise();
  }

  private findGrowth(): void {
    for (const key in this.coinLists) {
      this.coinLists[key]['coins'].forEach(c => {
        if (key == '2018') {
          const foundCoin = this.coinLists['2014']['coins'].find(e => e.coin == c.coin)
          if (foundCoin) {
            const marketRatio2014 = foundCoin.market_cap/this.coinLists['2014']['market_cap']
            const marketRatio2018 = c.market_cap/this.coinLists['2018']['market_cap']

            c['growth'] = Number(((marketRatio2018 - marketRatio2014) * 100).toFixed(1))
          }
        }
        if (key == '2021') {
          const foundCoin = this.coinLists['2018']['coins'].find(e => e.coin == c.coin)
          if (foundCoin) {
            const marketRatio2018 = foundCoin.market_cap/this.coinLists['2018']['market_cap']
            const marketRatio2021 = c.market_cap/this.coinLists['2021']['market_cap']

            c['growth'] = Number(((marketRatio2021 - marketRatio2018) * 100).toFixed(1))
          }
        }
      });
    } 
  }

  private findSymbol(): void {
    for (const key in this.coinLists) {
      this.coinLists[key]['coins'].forEach(c => {
        const coinSymbol = symbols[c.coin] 
        c['symbol'] = coinSymbol
        c['growth'] = 0
      });
    }
  }

}

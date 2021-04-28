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

  tooltip1a;
  tooltip1b;
  tooltip1c;

  currentRect;

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

  private displayGraph(): void {
    this.createSVG('1a', '2014')
    this.createSVG('1b', '2018')
    this.createSVG('1c', '2021')

    this.marketCap2014 = this.coinLists['2014']['market_cap']
    this.marketCap2018 = this.coinLists['2018']['market_cap']
    this.marketCap2021 = this.coinLists['2021']['market_cap']
  }

  private createSVG(id: string, year: string) {
    this.display(id, year, this);
  }

  private display(id: string, year: string, comp: DataViz1Component): void {
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 500 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;
    
    var svg = d3.select(`#graph${id}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    if (id == '1a') {
      comp.tooltip1a = d3.select(`#graph${id}`).append('div')
      .attr('id', `tooltip${id}`)
      .style('position', 'absolute')
      .style('background-color', 'rgba(230, 230, 230)')
      .style('padding', 6)
      .style('display', 'none')
    }
    else if (id == '1b') {
      comp.tooltip1b = d3.select(`#graph${id}`).append('div')
      .attr('id', `tooltip${id}`)
      .style('position', 'absolute')
      .style('background-color', 'rgba(230, 230, 230)')
      .style('padding', 6)
      .style('display', 'none')
    } 
    else {
      comp.tooltip1c = d3.select(`#graph${id}`).append('div')
      .attr('id', `tooltip${id}`)
      .style('position', 'absolute')
      .style('background-color', 'rgba(230, 230, 230)')
      .style('padding', 6)
      .style('display', 'none')
    }

    var root = d3.stratify()
    .id(function(d:any) { return d.coin; })
    .parentId(function(d:any) { return d.parent; })(comp.coinLists[year]['coins'])
  
    root.sum(function(d:any) { return d.market_cap })
    
    d3.treemap()
      .tile(d3.treemapSquarify.ratio(0.5))
      .size([width, height])
      .padding(4)
      (root)

  var colorScale = d3
    .scaleLinear<string>()
    .domain([-50, -2, 0, 2, 25])
    .range(["DarkRed", "IndianRed", "DarkSeaGreen", "Chartreuse", "DarkGreen"])
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
        // .attr("stroke-width", 1)
        .attr("fill", function (d:any) { return colorScale(d.data.growth)})
        .on("mouseover", function(event: any, el: any) {
          comp.thiccRect(d3.select(this), comp)
          d3.select(`#tooltip${id}`).style('display', 'block')
        })
        .on("mouseout", function(d:any) {
          comp.unthiccRect(comp)
          d3.select(`#tooltip${id}`).style('display', 'none')
        })
        .on("mousemove", function(event: any, el:any) {          
          comp.updateToolTip(id, event, el.data, comp)
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
        .on("mouseover", function() {
          comp.thiccRect(undefined, comp)
          d3.select(`#tooltip${id}`).style('display', 'block')
        })
        .on("mouseout", function(d:any) {
          comp.unthiccRect(comp)
          d3.select(`#tooltip${id}`).style('display', 'none')
        })
        .on("mousemove", function(event: any, el:any) {          
          comp.updateToolTip(id, event, el.data, comp)
        })
  }

  public thiccRect(rect, comp: DataViz1Component): void {
    if (rect !== undefined)
      comp.currentRect = rect
    comp.currentRect.attr("stroke-width", 3)
    comp.currentRect.style("opacity", "0.7");
  }

  public unthiccRect(comp: DataViz1Component): void {
    comp.currentRect.attr("stroke-width", 1)
    comp.currentRect.style("opacity", "1");
  }
  
  public updateToolTip(id: string, mouseEvent, data, comp: DataViz1Component): void {
    let currentToolTip = comp.tooltip1a
    
    if (id === '1b') {
      currentToolTip = comp.tooltip1b
    }
    else if (id === "1c") {
      currentToolTip = comp.tooltip1c
    }

    console.log(data)

    currentToolTip.html
        (`<span id="title">
          <p>Name: ${data.coin}</p> 
          <p style="color:${data.growth >= 0 ? "green":"red"}">Growth: ${data.growth}%</p>
          <p>Rank: ${data.rank}</p> 
        </span>`)
      .style('display', 'block')
      .style('font-size', 11.5)
      .selectAll()
      .data(data).enter() // for each vehicle category, list out name and price of premium
      .append('div')
      .style('color', d => {
        // return comp.colors(d.key)
    })
    .style('font-size', 10)
    .html(d => {
      return `${d.key}: ${Math.floor(d.price)}`
    })

    currentToolTip
    .style("left",(mouseEvent.pageX + 20)+"px")
    .style("top",(mouseEvent.pageY + 20)+"px")
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

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
  others: 'Oth.'
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

  currentElement;

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
      this.findGrowth();
      this.changeName();
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

    this.createLegend();

    this.marketCap2014 = Math.ceil(this.coinLists['2014']['market_cap']/1000000000)
    this.marketCap2018 = Math.ceil(this.coinLists['2018']['market_cap']/1000000000)
    this.marketCap2021 = Math.ceil(this.coinLists['2021']['market_cap']/1000000000)
  }

  private createLegend(): void {
    const svg = d3.select('#legend1')
      .append("svg")
      .attr("width", '100%')
      .attr("height", '80px')
    const defs = svg.append("defs")
    const gradient = defs.append('linearGradient')
      .attr("id", "linear-gradient")

      gradient.selectAll("stop")
      .data([
        {offset: "0%", color: "DarkRed"},
        {offset: "25%", color: "IndianRed"},
        {offset: "50%", color: "DarkSeaGreen"},
        {offset: "60%", color: "Chartreuse"},
        {offset: "100%", color: "DarkGreen"}
      ])
      .enter().append("stop")
      .attr("offset", function(d) { return d.offset; })
      .attr("stop-color", function(d) { return d.color; });


    svg.append("rect")
    .attr("width", 1000)
    .attr("height", 20)
    .attr('x', 350)
    .attr('y', 35)
    .style("fill", "url(#linear-gradient)");  

    svg.append('text')
    .attr('x', 500)
    .attr('y', 25)
    .text(d => "Variation de la surface qu'occupe une cryptomonnaie par rapport à l'année clé précédente évaluée")
    .attr("font-size", 18)

    svg.append('text')
    .attr('x', 335)
    .attr('y', 70)
    .text(d => "-65%")
    .attr("font-size", 16)

    svg.append('text')
    .attr('x', 860)
    .attr('y', 70)
    .text(d => "0%")
    .attr("font-size", 16)

    svg.append('text')
    .attr('x', 1340)
    .attr('y', 70)
    .text(d => "16%")
    .attr("font-size", 16)
  }

  private createSVG(id: string, year: string) {
    this.display(id, year, this);
  }

  private display(id: string, year: string, comp: DataViz1Component): void {
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 500 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    
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
    .domain([-65, -2, 0, 2, 20])
    .range(["DarkRed", "IndianRed", "DarkSeaGreen", "Chartreuse", "DarkGreen"])
    svg
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
        .attr('id', function(d:any) {return `rank${d.data.coin}`})
        .attr('x', function (d:any) { return d.x0; })
        .attr('y', function (d:any) { return d.y0; })
        .attr('width', function (d:any) { return d.x1 - d.x0; })
        .attr('height', function (d:any) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .attr("fill", function (d:any) { return colorScale(d.data.growth)})
        .on("mouseover", function(event: any, el: any) {
          comp.thiccRect(d3.select(this), this, comp)
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
          comp.thiccRect(undefined, this, comp)
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

  public thiccRect(rect, element, comp: DataViz1Component): void {
    const listGraphs = ['1a', '1b', '1c']

    if (rect !== undefined)
      comp.currentElement = element

    listGraphs.forEach(id => {
      const svg = d3.select(`#graph${id}`)
      svg.selectAll(`#${comp.currentElement.id}`)
        .style("opacity", "0.7")
        .attr("stroke-width", 5)
        .style("stroke", "red")
    }) 
    
  }

  public unthiccRect(comp: DataViz1Component): void {
    const listGraphs = ['1a', '1b', '1c']

    listGraphs.forEach(id => {
      const svg = d3.select(`#graph${id}`)
      svg.selectAll(`#${comp.currentElement.id}`)
        .style("opacity", "1")
        .attr("stroke-width", 1)
        .style("stroke", "black")
    }) 

  }
  
  public updateToolTip(id: string, mouseEvent, data, comp: DataViz1Component): void {
    let currentToolTip = comp.tooltip1a
    
    if (id === '1b') {
      currentToolTip = comp.tooltip1b
    }
    else if (id === "1c") {
      currentToolTip = comp.tooltip1c
    }

    currentToolTip.html
        (`<span id="title">
          <p>Nom: ${data.coin}</p> 
          <p style="color:${data.growth >= 0 ? "green":"red"}">Croissance du ratio: ${data.growth}%</p>
          <p>Rang: ${data.rank}</p> 
          <p>Capitalisation: ${(data.market_cap/1000000000).toFixed(2)}$ Milliards</p> 
        </span>`)
      .style('display', 'block')
      .style('font-size', 11.5)
      .selectAll()
      .data(data).enter()
      .append('div')
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

  private changeName(): void {
    for (const key in this.coinLists) {
      this.coinLists[key].coins.forEach(e => {
        if (e.coin === 'others')
          e.coin = 'Autres cryptomonnaies'
      });
    }
  }
}

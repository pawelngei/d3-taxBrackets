
class TaxBrackets {
  constructor (taxSystem, config) {
    this.config = {
      outerWidth: config && config.outerWidth ? config.outerWidth : 1000,
      outerHeight: config && config.outerHeight ? config.outerHeight : 100,
      boxMargin: config && config.boxMargin ? config.boxMargin :
        { top: 0, right: 25, bottom: 0, left: 25},
      barMargin: config && config.barMargin ? config.barMargin : 2,
      animationTime: config && config.animationTime ? config.animationTime : 1000
    }
    this.config.innerWidth = this.config.outerWidth - this.config.boxMargin.left - this.config.boxMargin.right;
    this.config.innerHeight = this.config.outerHeight - this.config.boxMargin.top - this.config.boxMargin.bottom;
    this.taxSystem = taxSystem;

    let svg = d3.select('#taxBrackets')
        .attr('width', this.config.outerWidth)
        .attr('height', this.config.outerHeight);

    this.innerFrame = svg.append('g')
        .attr('transform', `translate(${this.config.boxMargin.left},${this.config.boxMargin.top})`);
  }
  _processData (salary) {
    // this is just a proof of concept, very ugly code
    let graphData = [],
        lastLimit = 0,
        segmentLength,
        taxBrackets = this.taxSystem;
    for (let i = 0; i < taxBrackets.length; i++) {
      if (salary > lastLimit) {
        let start, end, percent, taxLength;
        start = graphData[graphData.length - 1]? graphData[graphData.length -1].end : 0;
        end = salary < taxBrackets[i].limit ? salary : taxBrackets[i].limit;
        // TODO: Refactor
        if (end < 0) {end = salary};
        percent = taxBrackets[i].taxValue;
        taxLength = Math.floor((end - start) * percent / 100);
        graphData.push({start, end, percent, taxLength});
        lastLimit = taxBrackets[i].limit;
      }
    }
    return graphData;
  }
  _renderGraph (graphData) {
    // create graphConfig object and unpack
    let c = this.config;

    let xScale = d3.scale.linear().rangeRound([0, c.innerWidth])
        // be ready to change to logscale with big values
        .domain([0, graphData[graphData.length -1].end]);

    let salaryRects = this.innerFrame.selectAll('.salary')
          .data(graphData)
        salaryRects /* enter phase */
          .enter().append('rect')
          .attr('class', 'salary')
          .attr('x', 0)
          .attr('y', 50)
          .attr('width', 0)
          .attr('height', 25)
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start))
          .attr('width', d => xScale(d.end - d.start) - c.barMargin);
        salaryRects /* update phase */
          .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start))
          .attr('width', d => xScale(d.end - d.start) - c.barMargin);
        salaryRects /* exit phase */
          .exit().remove();
    let taxRects = this.innerFrame.selectAll('.tax').data(graphData)
        taxRects
          .enter().append('rect')
          .attr('class', 'tax')
          .attr('x', 0)
          .attr('y', 25)
          .attr('width', 0)
          .attr('height', 50)
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start))
          .attr('width', d=> xScale(d.taxLength));
        taxRects
          .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start))
          .attr('width', d=> xScale(d.taxLength));
        taxRects
          .exit().remove();
    let percentLegend = this.innerFrame.selectAll('.percent').data(graphData)
        percentLegend
          .enter().append('text')
          .attr('class', 'percent')
          .attr('x', 0)
          .attr('y', 20)
          .text(d => d.percent + '%')
          .style("text-anchor", "middle")
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start + (d.end - d.start)/2))
        percentLegend
          .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start + (d.end - d.start)/2))
        percentLegend
          .exit().remove()
    let bracketLegend = this.innerFrame.selectAll('.bracket-limit').data(graphData);
        bracketLegend
          .enter().append('text')
          .attr('class', 'bracket-limit')
          .attr('x', 0)
          .attr('y', 90)
          .text(d => d.end + ' PLN')
          .style("text-anchor", "end")
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.end))
        bracketLegend
          .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.end))
        bracketLegend
          .exit().remove()
  }
  initGraph (salary) {
    let graphData = this._processData(salary);
    this._renderGraph(graphData);
  }
}





class TaxBrackets {
  constructor (taxSystem, config) {
    this.config = {
      outerWidth: config && config.outerWidth ? config.outerWidth : 1000,
      outerHeight: config && config.outerHeight ? config.outerHeight : 100,
      boxMargin: config && config.boxMargin ? config.boxMargin :
        { top: 0, right: 25, bottom: 0, left: 25},
      barMargin: config && config.barMargin ? config.barMargin : 2
    }
    this.config.innerWidth = this.config.outerWidth - this.config.boxMargin.left - this.config.boxMargin.right;
    this.config.innerHeight = this.config.outerHeight - this.config.boxMargin.top - this.config.boxMargin.bottom;
    this.taxSystem = taxSystem;
  }
  processData (salary) {
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
  renderGraph (graphData) {
    // create graphConfig object and unpack
    let c = this.config;

    let xScale = d3.scale.linear().rangeRound([0, c.innerWidth])
        // be ready to change to logscale with big values
        .domain([0, graphData[graphData.length -1].end]);

    let svg = d3.select('#taxBrackets').append('svg')
        .attr('width', c.outerWidth)
        .attr('height', c.outerHeight);

    let innerFrame = svg.append('g')
        .attr('transform', `translate(${c.boxMargin.left},${c.boxMargin.top})`);

    let salaryRects = innerFrame.selectAll('.salary').data(graphData)
        salaryRects /* enter phase */
          .enter().append('rect');
        salaryRects /* update phase */
          .attr('class', 'salary')
          .attr('x', d => xScale(d.start))
          .attr('y', 50)
          .attr('width', d => xScale(d.end - d.start) - c.barMargin)
          .attr('height', 25);
        salaryRects /* exit phase */
          .exit().remove();
    let taxRects = innerFrame.selectAll('.tax').data(graphData)
        taxRects
          .enter().append('rect');
        taxRects
          .attr('class', 'tax')
          .attr('x', d => xScale(d.start))
          .attr('y', 25)
          .attr('width', d=> xScale(d.taxLength))
          .attr('height', 25);
        taxRects
          .exit().remove();
    let percentLegend = innerFrame.selectAll('.percent').data(graphData)
        percentLegend
          .enter().append('text')
        percentLegend
          .attr('class', 'percent')
          .attr('x', d => xScale(d.start + (d.end - d.start)/2))
          .attr('y', 20)
          .text(d => d.percent + '%')
          .style("text-anchor", "middle")
        percentLegend
          .exit().remove()
    let bracketLegend = innerFrame.selectAll('.bracket-limit').data(graphData);
        bracketLegend
          .enter().append('text');
        bracketLegend
          .attr('class', 'bracket-limit')
          .attr('x', d => xScale(d.end))
          .attr('y', 90)
          .text(d => d.end + ' PLN')
          .style("text-anchor", "end")
  }
  initGraph (salary) {
    let graphData = this.processData(salary);
    this.renderGraph(graphData);
  }
}




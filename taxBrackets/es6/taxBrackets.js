
class TaxBrackets {
  constructor (taxSystems, config) {
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

    this.taxSystems = taxSystems;
    this.innerFrames = [];

    let svg = d3.select('#taxBrackets')
        .attr('width', this.config.outerWidth)
        .attr('height', this.config.outerHeight * this.taxSystems.length);

    this.taxSystems.forEach( (taxSystem, index) => {
      let leftMargin = this.config.boxMargin.left,
          topMargin = this.config.boxMargin.top + this.config.outerHeight * index;
      let thisFrame = svg.append('g')
          .attr('transform', `translate(${leftMargin},${topMargin})`);
      this.innerFrames.push(thisFrame);
    })

  }
   _calculateDetailed (taxBrackets, salary) {
    // this is just a proof of concept, very ugly code
    let graphData = [],
        lastLimit = 0,
        segmentLength;
    taxBrackets.forEach( (bracket, index) => {
      if (salary > lastLimit) {
        let start, end, percent, taxLength;
        start = index === 0 ? 0 : graphData[graphData.length -1].end;
        end = salary < bracket.limit ? salary : bracket.limit;
        if (end < 0) {end = salary};
        percent = bracket.taxValue;
        taxLength = Math.floor((end - start) * percent / 100);
        graphData.push({start, end, percent, taxLength});
        lastLimit = bracket.limit;
      }
    })
    return graphData;
  }
  _calculateOverall (taxBrackets, salary) {
    let lastLimit = 0,
        start = 0,
        end = salary,
        percent,
        taxLength = 0;
    taxBrackets.forEach( (bracket, index) => {
      if (salary > lastLimit) {
        let bracketStart = index === 0 ? 0 : taxBrackets[index - 1].limit;
        let bracketEnd = salary < bracket.limit ? salary : bracket.limit;
        if (bracketEnd < 0) {bracketEnd = salary};
        taxLength += Math.floor((bracketEnd - bracketStart) * bracket.taxValue / 100);
        lastLimit = bracket.limit;
      }
    })
    percent = Math.round(taxLength / salary * 10000)/100;
    return [{start, end, percent, taxLength}];
  }
  _renderGraph (thisFrame, graphData) {
    // create graphConfig object and unpack
    let c = this.config;

    let xScale = d3.scale.linear().rangeRound([0, c.innerWidth])
        // be ready to change to logscale with big values
        .domain([0, graphData[graphData.length -1].end]);

    let salaryRects = thisFrame.selectAll('.salary')
          .data(graphData)
        salaryRects /* enter phase */
          .enter().append('rect')
          .attr('class', 'salary')
          .attr('x', d => xScale(d.start))
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
          .exit()
          .transition().duration(c.animationTime/2)
          .attr('width', 0)
          .remove();
    let taxRects = thisFrame.selectAll('.tax').data(graphData)
        taxRects
          .enter().append('rect')
          .attr('class', 'tax')
          .attr('x', d => xScale(d.start))
          .attr('y', 25)
          .attr('width', 0)
          .attr('height', 50)
        .transition().duration(c.animationTime)
          .attr('width', d=> xScale(d.taxLength));
        taxRects
          .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start))
          .attr('width', d=> xScale(d.taxLength));
        taxRects
          .exit()
          .transition().duration(c.animationTime/2)
          .attr('width', 0)
          .remove();
    let percentLegend = thisFrame.selectAll('.percent').data(graphData)
        percentLegend
          .enter().append('text')
          .attr('class', 'percent')
          .attr('x', d => xScale(d.start))
          .attr('y', 20)
          .text(d => d.percent + '%')
          .style("text-anchor", "middle")
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start + (d.end - d.start)/2))
        percentLegend
          .transition().duration(c.animationTime)
          .text(d => d.percent + '%')
          .attr('x', d => xScale(d.start + (d.end - d.start)/2))
        percentLegend
          .exit()
          .transition().duration(c.animationTime/2)
          .attr('x', 0)
          .remove();
    let bracketLegend = thisFrame.selectAll('.bracket-limit').data(graphData);
        bracketLegend
          .enter().append('text')
          .attr('class', 'bracket-limit')
          .attr('x', d => xScale(d.start))
          .attr('y', 90)
          .text(d => d.end + ' PLN')
          .style("text-anchor", "end")
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.end))
        bracketLegend
          .transition().duration(c.animationTime)
          .text(d => d.end + ' PLN')
          .attr('x', d => xScale(d.end))
        bracketLegend
          .exit()
          .transition().duration(c.animationTime/2)
          .attr('x', 0)
          .remove();
  }
  initGraph (salary) {
    this.salary = salary;
    this.showOverall()
  }
  showOverall () {
    this.innerFrames.forEach( (_, index) => {
      let graphData = this._calculateOverall(
        this.taxSystems[index].brackets, this.salary
      );
      this._renderGraph(this.innerFrames[index], graphData)
    })
  }
  showDetailed () {
    this.innerFrames.forEach( (_, index) => {
      let graphData = this._calculateDetailed(
        this.taxSystems[index].brackets, this.salary
      );
      this._renderGraph(this.innerFrames[index], graphData)
    })
  }
}





class TaxBrackets {
  constructor (selector, taxSystems, config) {
    this.config = {
      outerWidth: config && config.outerWidth ? config.outerWidth : 1000,
      outerHeight: config && config.outerHeight ? config.outerHeight : 125,
      boxMargin: config && config.boxMargin ? config.boxMargin :
        { top: 25, right: 25, bottom: 0, left: 25},
      barMargin: config && config.barMargin ? config.barMargin : 3,
      animationTime: config && config.animationTime ? config.animationTime : 1000,
      defaultView: 'overall'
    }
    this.config.innerWidth = this.config.outerWidth - this.config.boxMargin.left - this.config.boxMargin.right;
    this.config.innerHeight = this.config.outerHeight - this.config.boxMargin.top - this.config.boxMargin.bottom;
    this.viewFuncDict = {
      'overall': this.showOverall,
      'detailed': this.showDetailed
    }
    this.lastViewMode = this.config.defaultView;

    this.taxSystems = taxSystems;
    this.innerFrames = [];

    let svg = d3.select(selector)
        .attr('width', this.config.outerWidth)
        .attr('height', this.config.outerHeight * this.taxSystems.length)
        .on('mouseup', this.toggleMode.bind(this));

    this.taxSystems.forEach( (taxSystem, index) => {
      let leftMargin = this.config.boxMargin.left,
          topMargin = this.config.boxMargin.top + this.config.outerHeight * index;
      let thisFrame = svg.append('g')
          .attr('transform', `translate(${leftMargin},${topMargin})`);
      thisFrame.append('text')
          .attr('class', 'system-name')
          .attr('x', 0)
          .attr('y', 0)
          .text(taxSystem.name)
          .style("text-anchor", "start")
      this.innerFrames.push(thisFrame);
    })

    this.tooltip = d3.tip()
          .attr('class', 'd3-tooltip')
          .html((content) => {
            return content
          });
    svg.call(this.tooltip);
  }
  _calculateGraphData (taxBrackets, salary) {
    let bracketList = [],
        lastLimit = 0,
        totalTax = 0,
        netSalary = 0,
        totalPercent = 0;
    taxBrackets.forEach( (bracket, i) => {
      if (salary > lastLimit) {
        let start, end, percent, bracketLength, taxLength, netLength;
        start = i === 0 ? 0 : bracketList[bracketList.length - 1].end;
        end = salary < bracket.limit ? salary : bracket.limit;
        if (end < 0) {end = salary};
        percent = bracket.taxValue;
        bracketLength = end - start;
        taxLength = Math.round(bracketLength * percent) / 100; /* 2 sign digits*/
        netLength = bracketLength - taxLength;
        bracketList.push(
          {start, end, percent, bracketLength, taxLength, netLength}
        );
        lastLimit = bracket.limit;
      }
    });
    bracketList.forEach( (bracket, i) => {
      totalTax += bracket.taxLength;
      netSalary += bracket.netLength;
    })
    totalPercent = Math.round(totalTax / salary * 10000) / 100; /*2 significant d*/
    return {
      totalTax,
      netSalary,
      totalPercent,
      bracketList
    }
  }
  _calculateDetailed (taxBrackets, salary) {
    // add some sensible caching of the results
    return this._calculateGraphData(taxBrackets, salary).bracketList;
  }
  _calculateOverall (taxBrackets, salary) {
    // again, caching of results
    let gd = this._calculateGraphData(taxBrackets, salary);
    return [{
      start: 0,
      end: salary,
      percent: gd.totalPercent,
      taxLength: gd.totalTax,
      bracketLength: salary,
      netLength: salary - gd.totalTax
    }];
  }
  _renderGraph (thisFrame, graphData) {
    // create graphConfig object and unpack
    let c = this.config;

    let xScale = d3.scale.linear().rangeRound([0, c.innerWidth])
        // be ready to change to logscale with big values
        .domain([0, graphData[graphData.length -1].end]);

    let measureTextLength = function (lengthKey) {
      return function (d) {
        let textLength = this.getComputedTextLength()
        if (d[lengthKey] === 0 || textLength > xScale(d[lengthKey])) {
          return 'hidden'
        }
        return 'visible'
      }
    }

    let salaryRects = thisFrame.selectAll('.salary')
          .data(graphData)
        salaryRects /* enter phase */
          .enter().append('rect')
          .attr('class', 'salary')
          .attr('x', d => xScale(d.start))
          .attr('y', 50)
          .attr('width', 0)
          .attr('height', 25)
          .on('mouseover', (d) => this.tooltip.show(d.bracketLength))
          .on('mouseout', this.tooltip.hide)
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start))
          .attr('width', d => xScale(d.end-d.start)-c.barMargin);
        salaryRects /* update phase */
          .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start))
          .attr('width', d => xScale(d.end-d.start)-c.barMargin);
        salaryRects /* exit phase */
          .exit()
          .transition().duration(c.animationTime/2)
          .attr('width', 0)
          .remove();
    let salaryLegend = thisFrame.selectAll('.salary-legend')
          .data(graphData)
        salaryLegend
          .enter().append('text')
          .attr('class', 'salary-legend')
          .attr('x', d => xScale(d.start+d.bracketLength/2))
          .attr('y', 67)
          .text(d => Math.round(d.bracketLength*100)/100)
          .style('text-anchor', 'middle')
          .style('visibility', measureTextLength('bracketLength'))
        salaryLegend
          .transition().duration(c.animationTime)
          .text(d => Math.round(d.bracketLength*100)/100)
          .attr('x', d => xScale(d.start+d.bracketLength/2))
          .style('visibility', measureTextLength('bracketLength'))
        salaryLegend
          .exit()
          .transition().duration(c.animationTime/2)
          .remove()
    let netRects = thisFrame.selectAll('.net')
          .data(graphData)
        netRects /* enter phase */
          .enter().append('rect')
          .attr('class', 'net')
          .attr('x', d => xScale(d.start+d.taxLength))
          .attr('y', 25)
          .attr('width', 0)
          .attr('height', 25)
          .on('mouseover', (d) => this.tooltip.show(d.netLength))
          .on('mouseout', this.tooltip.hide)
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start+d.taxLength))
          .attr('width', d => xScale(d.end-(d.taxLength+d.start))-c.barMargin);
        netRects /* update phase */
          .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start+d.taxLength))
          .attr('width', d => xScale(d.end-(d.taxLength+d.start))-c.barMargin);
        netRects /* exit phase */
          .exit()
          .transition().duration(c.animationTime/2)
          .attr('width', 0)
          .remove();
    let netLegend = thisFrame.selectAll('.net-legend')
          .data(graphData)
        netLegend
          .enter().append('text')
          .attr('class', 'net-legend')
          .attr('x', d => xScale(d.start+d.taxLength+d.netLength/2))
          .attr('y', 43)
          .text(d => Math.round(d.netLength*100)/100)
          .style('text-anchor', 'middle')
          .style('visibility', measureTextLength('netLength'))
        netLegend
          .transition().duration(c.animationTime)
          .text(d => Math.round(d.netLength*100)/100)
          .attr('x', d => xScale(d.start+d.taxLength+d.netLength/2))
          .style('visibility', measureTextLength('netLength'))
        netLegend
          .exit()
          .transition().duration(c.animationTime/2)
          .remove()
    let taxRects = thisFrame.selectAll('.tax').data(graphData)
        taxRects
          .enter().append('rect')
          .attr('class', 'tax')
          .attr('x', d => xScale(d.start))
          .attr('y', 25)
          .attr('width', 0)
          .attr('height', 25)
          .on('mouseover', (d) => this.tooltip.show(d.taxLength))
          .on('mouseout', this.tooltip.hide)
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
    let taxLegend = thisFrame.selectAll('.tax-legend')
          .data(graphData)
        taxLegend
          .enter().append('text')
          .attr('class', 'tax-legend')
          .attr('x', d => xScale(d.start+d.taxLength/2))
          .attr('y', 43)
          .text(d => Math.round(d.taxLength*100)/100)
          .style('text-anchor', 'middle')
          .style('visibility', measureTextLength('taxLength'))
        taxLegend
          .transition().duration(c.animationTime)
          .text(d => Math.round(d.taxLength*100)/100)
          .attr('x', d => xScale(d.start+d.taxLength/2))
          .style('visibility', measureTextLength('taxLength'))
        taxLegend
          .exit()
          .transition().duration(c.animationTime/2)
          .remove()
    let percentLegend = thisFrame.selectAll('.percent').data(graphData)
        percentLegend
          .enter().append('text')
          .attr('class', 'percent')
          .attr('x', d => xScale(d.start))
          .attr('y', 20)
          .text(d => d.percent + '%')
          .style("text-anchor", "middle")
          .style('visibility', measureTextLength('bracketLength'))
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.start + (d.end - d.start)/2))
        percentLegend
          .transition().duration(c.animationTime)
          .text(d => d.percent + '%')
          .attr('x', d => xScale(d.start + (d.end - d.start)/2))
          .style('visibility', measureTextLength('bracketLength'))
        percentLegend
          .exit()
          .transition().duration(c.animationTime/2)
          .attr('x', 0)
          .remove();
    let limitRects = thisFrame.selectAll('.limit-rect').data(graphData)
        limitRects
          .enter().append('rect')
          .attr('class', 'limit-rect')
          .attr('x', 0)
          .attr('y', 23)
          .attr('width', 0)
          .attr('height', 54)
          .style('fill', 'rgba(0,0,0,0)')
          .on('mouseover', (d) => this.tooltip.show(d.end))
          .on('mouseout', this.tooltip.hide)
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.end) - c.barMargin)
          .attr('width', c.barMargin)
        limitRects
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.end) - c.barMargin)
          .attr('width', c.barMargin)
        limitRects
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
          .style('visibility', measureTextLength('bracketLength'))
        .transition().duration(c.animationTime)
          .attr('x', d => xScale(d.end))
        bracketLegend
          .transition().duration(c.animationTime)
          .text(d => d.end + ' PLN')
          .attr('x', d => xScale(d.end))
          .style('visibility', measureTextLength('bracketLength'))
        bracketLegend
          .exit()
          .transition().duration(c.animationTime/2)
          .attr('x', 0)
          .remove();
  }
  initGraph (salary) {
    this.salary = +salary;
    // that's one horrible hack with this
    // for some reason the dict[key] has empty this
    this.viewFuncDict[this.lastViewMode].bind(this)();
  }
  showOverall () {
    this.lastViewMode = 'overall';
    this.innerFrames.forEach( (_, index) => {
      let graphData = this._calculateOverall(
        this.taxSystems[index].brackets, this.salary
      );
      this._renderGraph(this.innerFrames[index], graphData)
    })
  }
  showDetailed () {
    this.lastViewMode = 'detailed';
    this.innerFrames.forEach( (_, index) => {
      let graphData = this._calculateDetailed(
        this.taxSystems[index].brackets, this.salary
      );
      this._renderGraph(this.innerFrames[index], graphData)
    })
  }
  toggleMode () {
    if (this.lastViewMode === 'overall') {
      this.lastViewMode = 'detailed';
    } else {
      this.lastViewMode = 'overall';
    }
    this.viewFuncDict[this.lastViewMode].bind(this)();
  }
}

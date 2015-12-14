let taxData = [
  {
    limit: 1000,
    taxValue: 0,
    constant: 0
  },
  {
    limit: 5000,
    taxValue: 22,
    constant: 0
  },
  {
    limit: 10000,
    taxValue: 33,
    constant: 0
  },
  {
    limit: 20833,
    taxValue: 44,
    constant: 0
  },
  {
    limit: 41667,
    taxValue: 55,
    constant: 0
  },
  {
    limit: -1, /* inf */
    taxValue: 75,
    constant: 0
  }
];

let processData = function processData (taxBrackets, salary) {
  // this is just a proof of concept, very ugly code
  let graphData = [],
      lastLimit = 0,
      segmentLength;
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

let renderGraph = function renderGraph (graphData) {
  // create graphConfig object and unpack
  let outerWidth = 1000,
      outerHeight = 100,
      boxMargin = { top: 0, right: 25, bottom: 0, left: 25},
      innerWidth = outerWidth - boxMargin.left - boxMargin.right,
      innerHeight = outerHeight - boxMargin.top - boxMargin.bottom,
      barMargin = 2; /* px, change to xScale */

  let xScale = d3.scale.linear().rangeRound([0, innerWidth])
      // be ready to change to logscale with big values
      .domain([0, graphData[graphData.length -1].end]);

  let svg = d3.select('#taxBrackets').append('svg')
      .attr('width', outerWidth)
      .attr('height', outerHeight);

  let innerFrame = svg.append('g')
      .attr('transform', `translate(${boxMargin.left},${boxMargin.top})`);

  let salaryRects = innerFrame.selectAll('.salary').data(graphData)
      salaryRects /* enter phase */
        .enter().append('rect');
      salaryRects /* update phase */
        .attr('class', 'salary')
        .attr('x', d => xScale(d.start))
        .attr('y', 50)
        .attr('width', d => xScale(d.end - d.start) - barMargin)
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

let initGraph = function initGraph (salary) {
  let graphData = processData(taxData, salary);
  renderGraph(graphData);
}

initGraph(16000);

$('#salary').on('keyup', function (event) {
  if (event.keyCode !== 13) {
    return;
  }
  let value = $('#salary').val();
  initGraph(value);
})


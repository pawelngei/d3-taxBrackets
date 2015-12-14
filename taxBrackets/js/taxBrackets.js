'use strict';

var taxData = [{
  limit: 1000,
  taxValue: 0,
  constant: 0
}, {
  limit: 5000,
  taxValue: 22,
  constant: 0
}, {
  limit: 10000,
  taxValue: 33,
  constant: 0
}, {
  limit: 20833,
  taxValue: 44,
  constant: 0
}, {
  limit: 41667,
  taxValue: 55,
  constant: 0
}, {
  limit: -1, /* inf */
  taxValue: 75,
  constant: 0
}];

var salary = 50000;

var processData = function processData(taxBrackets, salary) {
  // this is just a proof of concept, very ugly code
  var graphData = [],
      lastLimit = 0,
      segmentLength = undefined;
  for (var i = 0; i < taxBrackets.length; i++) {
    if (salary > lastLimit) {
      var start = undefined,
          end = undefined,
          percent = undefined,
          taxLength = undefined;
      start = graphData[graphData.length - 1] ? graphData[graphData.length - 1].end : 0;
      end = salary < taxBrackets[i].limit ? salary : taxBrackets[i].limit;
      // TODO: Refactor
      if (end < 0) {
        end = salary;
      };
      percent = taxBrackets[i].taxValue;
      taxLength = Math.floor((end - start) * percent / 100);
      graphData.push({ start: start, end: end, percent: percent, taxLength: taxLength });
      lastLimit = taxBrackets[i].limit;
    }
  }
  return graphData;
};

var renderGraph = function renderGraph(graphData) {
  // create graphConfig object and unpack
  var outerWidth = 1000,
      outerHeight = 200,
      boxMargin = { top: 0, right: 25, bottom: 0, left: 25 },
      innerWidth = outerWidth - boxMargin.left - boxMargin.right,
      innerHeight = outerHeight - boxMargin.top - boxMargin.bottom,
      barMargin = 2; /* px, change to xScale */

  var xScale = d3.scale.linear().rangeRound([0, innerWidth])
  // be ready to change to logscale with big values
  .domain([0, graphData[graphData.length - 1].end]);

  var svg = d3.select('#taxBrackets').append('svg').attr('width', outerWidth).attr('height', outerHeight);

  var innerFrame = svg.append('g').attr('transform', 'translate(' + boxMargin.left + ',' + boxMargin.top + ')');

  var salaryRects = innerFrame.selectAll('.salary').data(graphData);
  salaryRects /* enter phase */
  .enter().append('rect');
  salaryRects /* update phase */
  .attr('class', 'salary').attr('x', function (d) {
    return xScale(d.start);
  }).attr('y', 50).attr('width', function (d) {
    return xScale(d.end - d.start) - 1;
  }).attr('height', 25);
  salaryRects /* exit phase */
  .exit().remove();
  var taxRects = innerFrame.selectAll('.tax').data(graphData);
  taxRects.enter().append('rect');
  taxRects.attr('class', 'tax').attr('x', function (d) {
    return xScale(d.start);
  }).attr('y', 25).attr('width', function (d) {
    return xScale(d.taxLength);
  }).attr('height', 25);
  taxRects.exit().remove();
  var bracketLegend = innerFrame.selectAll('.percent').data(graphData);
  bracketLegend.enter().append('text');
  bracketLegend.attr('class', 'percent').attr('x', function (d) {
    return xScale(d.start + (d.end - d.start) / 2);
  }).attr('y', 20).text(function (d) {
    return d.percent + '%';
  }).style("text-anchor", "middle");
  bracketLegend.exit().remove();
};

var graphData = processData(taxData, salary);
renderGraph(graphData);
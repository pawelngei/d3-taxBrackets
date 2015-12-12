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

var salary = 25000,
    exampleTax = 5000;

var outerWidth = 1000,
    outerHeight = 200,
    margin = { top: 0, right: 25, bottom: 0, left: 25 },
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom;

var xScale = d3.scale.linear().range([0, innerWidth]).domain([0, salary]);

var svg = d3.select('#taxBrackets').append('svg').attr('width', outerWidth).attr('height', outerHeight);

var frame = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

frame.append('rect').attr('x', 0).attr('y', 150).attr('width', xScale(salary)).attr('height', 25).attr('class', 'salary');

frame.append('rect').attr('x', 0).attr('y', 125).attr('width', xScale(exampleTax)).attr('height', 25).attr('class', 'tax');
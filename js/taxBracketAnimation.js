// example d3 file

'use strict';

var data = [4, 8, 15, 16, 23, 43];

d3.select('.chart').selectAll('div').data(data).enter().append('div').style('width', function (datapoint) {
  return datapoint * 10 + 'px';
}).text(function (datapoint) {
  return datapoint;
});
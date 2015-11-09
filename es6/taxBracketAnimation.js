// example d3 file

let data = [4, 8, 15, 16, 23, 43];

d3.select('.chart')
  .selectAll('div')
    .data(data)
  .enter().append('div')
    .style('width', datapoint => datapoint * 10 + 'px')
    .text(datapoint => datapoint);

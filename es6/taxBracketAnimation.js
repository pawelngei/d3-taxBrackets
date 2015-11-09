// example d3 file

let data = [4, 8, 15, 16, 23, 43];

let scaleX = d3.scale.linear() /* returns a function */
  .domain([0, d3.max(data)])
  .range([0, 420]);

d3.select('.chart')
  .selectAll('div')
    .data(data)
  .enter().append('div')
    .style('width', datapoint => scaleX(datapoint) + 'px')
    .text(datapoint => datapoint);

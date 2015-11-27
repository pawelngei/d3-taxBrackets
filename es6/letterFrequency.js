let width = 960,
    height = 500;

let y = d3.scale.linear()
    .range([height, 0]);

let chart = d3.select('.chart')
    .attr('width', width)
    .attr('height', height);

d3.csv('data/letterFrequency.csv', type, function (error, data) {
  y.domain([0, d3.max(data, d => d.frequency)]);

  let barWidth = width / data.length;

  let bar = chart.selectAll('g')
      .data(data)
      .enter().append('g')
      .attr('transform', (d,i) => 'translate(' + i * barWidth + ',0)');

  bar.append('rect')
      .attr('y', d => y(d.frequency))
      .attr('height', d => height - y(d.frequency))
      .attr('width', barWidth -1);

  bar.append('text')
      .attr('x', barWidth / 2)
      .attr('y', d => y(d.frequency) + 3)
      .attr('dy', '.75em')
      .text(d => d.frequency);
});

function type(d) {
  d.frequency = +d.frequency;
  return d;
}

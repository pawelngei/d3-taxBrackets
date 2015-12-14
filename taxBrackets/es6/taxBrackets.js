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

let salary = 25000,
    exampleTax = 5000;

let outerWidth = 1000,
    outerHeight = 200,
    margin = { top: 0, right: 25, bottom: 0, left: 25},
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom;

let xScale = d3.scale.linear().range([0, innerWidth])
      .domain([0,salary]);

let svg = d3.select('#taxBrackets').append('svg')
    .attr('width', outerWidth)
    .attr('height', outerHeight);

let frame = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);



frame.append('rect')
    .attr('x', 0)
    .attr('y', 150)
    .attr('width', xScale(salary))
    .attr('height', 25)
    .attr('class', 'salary');

frame.append('rect')
    .attr('x', 0)
    .attr('y', 125)
    .attr('width', xScale(exampleTax))
    .attr('height', 25)
    .attr('class', 'tax');

let processData = function processData (taxBrackets, salary) {
  // this is just a proof of concept, very ugly code
  let graphData = [],
      lastLimit = 0,
      segmentLength;
  for (let i = 0; i < taxBrackets.length; i++) {
    if (salary > lastLimit) {
      let start, end, percent, taxEnd;
      start = graphData[graphData.length - 1]? graphData[graphData.length -1].end : 0;
      end = salary < taxBrackets[i].limit ? salary : taxBrackets[i].limit;
      percent = taxBrackets[i].taxValue;
      taxEnd = Math.floor((end - start) * percent / 100);
      graphData.push({start, end, percent, taxEnd});
      lastLimit = taxBrackets[i].limit;
    }
  }
  return graphData;
}

processData(taxData, salary);

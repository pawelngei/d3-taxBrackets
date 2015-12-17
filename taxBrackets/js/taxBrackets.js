'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TaxBrackets = (function () {
  function TaxBrackets(taxSystem, config) {
    _classCallCheck(this, TaxBrackets);

    this.config = {
      outerWidth: config && config.outerWidth ? config.outerWidth : 1000,
      outerHeight: config && config.outerHeight ? config.outerHeight : 100,
      boxMargin: config && config.boxMargin ? config.boxMargin : { top: 0, right: 25, bottom: 0, left: 25 },
      barMargin: config && config.barMargin ? config.barMargin : 2,
      animationTime: config && config.animationTime ? config.animationTime : 1000
    };
    this.config.innerWidth = this.config.outerWidth - this.config.boxMargin.left - this.config.boxMargin.right;
    this.config.innerHeight = this.config.outerHeight - this.config.boxMargin.top - this.config.boxMargin.bottom;

    this.taxSystem = taxSystem;

    var svg = d3.select('#taxBrackets').attr('width', this.config.outerWidth).attr('height', this.config.outerHeight);

    this.innerFrame = svg.append('g').attr('transform', 'translate(' + this.config.boxMargin.left + ',' + this.config.boxMargin.top + ')');
  }

  _createClass(TaxBrackets, [{
    key: '_calculateDetailed',
    value: function _calculateDetailed(salary) {
      // this is just a proof of concept, very ugly code
      var graphData = [],
          lastLimit = 0,
          segmentLength = undefined,
          taxBrackets = this.taxSystem.brackets;
      taxBrackets.forEach(function (bracket, index) {
        if (salary > lastLimit) {
          var start = undefined,
              end = undefined,
              percent = undefined,
              taxLength = undefined;
          start = index === 0 ? 0 : graphData[graphData.length - 1].end;
          end = salary < bracket.limit ? salary : bracket.limit;
          if (end < 0) {
            end = salary;
          };
          percent = bracket.taxValue;
          taxLength = Math.floor((end - start) * percent / 100);
          graphData.push({ start: start, end: end, percent: percent, taxLength: taxLength });
          lastLimit = bracket.limit;
        }
      });
      return graphData;
    }
  }, {
    key: '_calculateOverall',
    value: function _calculateOverall(salary) {
      var lastLimit = 0,
          taxBrackets = this.taxSystem.brackets,
          start = 0,
          end = salary,
          percent = undefined,
          taxLength = 0;
      taxBrackets.forEach(function (bracket, index) {
        if (salary > lastLimit) {
          var bracketStart = index === 0 ? 0 : taxBrackets[index - 1].limit;
          var bracketEnd = salary < bracket.limit ? salary : bracket.limit;
          if (bracketEnd < 0) {
            bracketEnd = salary;
          };
          taxLength += Math.floor((bracketEnd - bracketStart) * bracket.taxValue / 100);
          lastLimit = bracket.limit;
        }
      });
      percent = Math.round(taxLength / salary * 10000) / 100;
      return [{ start: start, end: end, percent: percent, taxLength: taxLength }];
    }
  }, {
    key: '_renderGraph',
    value: function _renderGraph(graphData) {
      // create graphConfig object and unpack
      var c = this.config;

      var xScale = d3.scale.linear().rangeRound([0, c.innerWidth])
      // be ready to change to logscale with big values
      .domain([0, graphData[graphData.length - 1].end]);

      var salaryRects = this.innerFrame.selectAll('.salary').data(graphData);
      salaryRects /* enter phase */
      .enter().append('rect').attr('class', 'salary').attr('x', function (d) {
        return xScale(d.start);
      }).attr('y', 50).attr('width', 0).attr('height', 25).transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.start);
      }).attr('width', function (d) {
        return xScale(d.end - d.start) - c.barMargin;
      });
      salaryRects /* update phase */
      .transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.start);
      }).attr('width', function (d) {
        return xScale(d.end - d.start) - c.barMargin;
      });
      salaryRects /* exit phase */
      .exit().transition().duration(c.animationTime / 2).attr('width', 0).remove();
      var taxRects = this.innerFrame.selectAll('.tax').data(graphData);
      taxRects.enter().append('rect').attr('class', 'tax').attr('x', function (d) {
        return xScale(d.start);
      }).attr('y', 25).attr('width', 0).attr('height', 50).transition().duration(c.animationTime).attr('width', function (d) {
        return xScale(d.taxLength);
      });
      taxRects.transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.start);
      }).attr('width', function (d) {
        return xScale(d.taxLength);
      });
      taxRects.exit().transition().duration(c.animationTime / 2).attr('width', 0).remove();
      var percentLegend = this.innerFrame.selectAll('.percent').data(graphData);
      percentLegend.enter().append('text').attr('class', 'percent').attr('x', function (d) {
        return xScale(d.start);
      }).attr('y', 20).text(function (d) {
        return d.percent + '%';
      }).style("text-anchor", "middle").transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.start + (d.end - d.start) / 2);
      });
      percentLegend.transition().duration(c.animationTime).text(function (d) {
        return d.percent + '%';
      }).attr('x', function (d) {
        return xScale(d.start + (d.end - d.start) / 2);
      });
      percentLegend.exit().transition().duration(c.animationTime / 2).attr('x', 0).remove();
      var bracketLegend = this.innerFrame.selectAll('.bracket-limit').data(graphData);
      bracketLegend.enter().append('text').attr('class', 'bracket-limit').attr('x', function (d) {
        return xScale(d.start);
      }).attr('y', 90).text(function (d) {
        return d.end + ' PLN';
      }).style("text-anchor", "end").transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.end);
      });
      bracketLegend.transition().duration(c.animationTime).text(function (d) {
        return d.end + ' PLN';
      }).attr('x', function (d) {
        return xScale(d.end);
      });
      bracketLegend.exit().transition().duration(c.animationTime / 2).attr('x', 0).remove();
    }
  }, {
    key: 'initGraph',
    value: function initGraph(salary) {
      this.salary = salary;
      // let graphData = this. _calculateDetailed(salary);
      var graphData = this._calculateOverall(salary);
      this._renderGraph(graphData);
    }
  }, {
    key: 'showOverall',
    value: function showOverall() {
      var graphData = this._calculateOverall(this.salary);
      this._renderGraph(graphData);
    }
  }, {
    key: 'showDetailed',
    value: function showDetailed() {
      var graphData = this._calculateDetailed(this.salary);
      this._renderGraph(graphData);
    }
  }]);

  return TaxBrackets;
})();
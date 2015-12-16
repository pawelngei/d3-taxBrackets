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
    key: '_processData',
    value: function _processData(salary) {
      // this is just a proof of concept, very ugly code
      var graphData = [],
          lastLimit = 0,
          segmentLength = undefined,
          taxBrackets = this.taxSystem;
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
      .enter().append('rect').attr('class', 'salary').attr('x', 0).attr('y', 50).attr('width', 0).attr('height', 25).transition().duration(c.animationTime).attr('x', function (d) {
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
      .exit().remove();
      var taxRects = this.innerFrame.selectAll('.tax').data(graphData);
      taxRects.enter().append('rect').attr('class', 'tax').attr('x', 0).attr('y', 25).attr('width', 0).attr('height', 50).transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.start);
      }).attr('width', function (d) {
        return xScale(d.taxLength);
      });
      taxRects.transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.start);
      }).attr('width', function (d) {
        return xScale(d.taxLength);
      });
      taxRects.exit().remove();
      var percentLegend = this.innerFrame.selectAll('.percent').data(graphData);
      percentLegend.enter().append('text').attr('class', 'percent').attr('x', 0).attr('y', 20).text(function (d) {
        return d.percent + '%';
      }).style("text-anchor", "middle").transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.start + (d.end - d.start) / 2);
      });
      percentLegend.transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.start + (d.end - d.start) / 2);
      });
      percentLegend.exit().remove();
      var bracketLegend = this.innerFrame.selectAll('.bracket-limit').data(graphData);
      bracketLegend.enter().append('text').attr('class', 'bracket-limit').attr('x', 0).attr('y', 90).text(function (d) {
        return d.end + ' PLN';
      }).style("text-anchor", "end").transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.end);
      });
      bracketLegend.transition().duration(c.animationTime).attr('x', function (d) {
        return xScale(d.end);
      });
      bracketLegend.exit().remove();
    }
  }, {
    key: 'initGraph',
    value: function initGraph(salary) {
      var graphData = this._processData(salary);
      this._renderGraph(graphData);
    }
  }]);

  return TaxBrackets;
})();
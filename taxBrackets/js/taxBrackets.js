"use strict";

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
  limit: 20000,
  taxValue: 44,
  constant: 0
}];

var salary = 25000,
    exampleTax = 5000;

var outerWidth = 1000,
    outerHeight = 200,
    margin = { top: 0, right: 0, bottom: 0, left: 0 };
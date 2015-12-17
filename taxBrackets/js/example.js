'use strict';

var taxRazem = {
  name: 'Razem',
  constantFee: 0,
  brackets: [{
    limit: 1000,
    taxValue: 0
  }, {
    limit: 5000,
    taxValue: 22
  }, {
    limit: 10000,
    taxValue: 33
  }, {
    limit: 20833,
    taxValue: 44
  }, {
    limit: 41667,
    taxValue: 55
  }, {
    limit: -1, /* inf */
    taxValue: 75
  }]
};

var taxCurrent = {
  name: 'obecny',
  constantFee: 0,
  brackets: [{
    limit: 257.58,
    taxValue: 0
  }, {
    limit: 7127.33,
    taxValue: 18
  }, {
    limit: -1,
    taxValue: 32
  }]
};

var taxNowoczesna = {
  name: 'Nowoczesna',
  constantFee: 0,
  brackets: [{
    limit: 257.58,
    taxValue: 0
  }, {
    limit: -1,
    taxValue: 16,
    constant: 0
  }]
};

var tbInstance = new TaxBrackets([taxCurrent, taxRazem, taxNowoczesna]);
tbInstance.initGraph(16000);

$('#salary').on('keyup', function (event) {
  var value = $('#salary').val();
  tbInstance.initGraph(value);
});

$('#overall').on('click', function (event) {
  tbInstance.showOverall();
});

$('#detailed').on('click', function (event) {
  tbInstance.showDetailed();
});
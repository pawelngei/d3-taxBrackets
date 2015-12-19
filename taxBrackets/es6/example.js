let taxRazem = {
  name: 'Razem',
  constantFee: 0,
  brackets: [
    {
      limit: 1000,
      taxValue: 0,
    },
    {
      limit: 5000,
      taxValue: 22,
    },
    {
      limit: 10000,
      taxValue: 33,
    },
    {
      limit: 20833,
      taxValue: 44,
    },
    {
      limit: 41667,
      taxValue: 55,
    },
    {
      limit: -1, /* inf */
      taxValue: 75,
    }
  ]
};

let taxCurrent = {
  name: 'obecny',
  constantFee: 0,
  brackets: [
    {
      limit: 257.58,
      taxValue: 0
    },
    {
      limit: 7127.33,
      taxValue: 18
    },
    {
      limit: -1,
      taxValue: 32
    }
  ]
}

let taxNowoczesna = {
  name: 'Nowoczesna',
  constantFee: 0,
  brackets: [
    {
      limit: 257.58,
      taxValue: 0
    },
    {
      limit: -1,
      taxValue: 16,
    }
  ]
}

let tbInstance = new TaxBrackets([taxCurrent, taxRazem, taxNowoczesna]);
tbInstance.initGraph($('#salary').val());

$('#salary').on('keyup', event => {
  let value = $('#salary').val();
  tbInstance.initGraph(value);
})

$('#overall').on('click', event => {
  tbInstance.showOverall();
})

$('#detailed').on('click', event => {
  tbInstance.showDetailed();
})

# d3 taxBrackets: multiple tax systems visualization

Now in version 0.1

My first go at a d3 library written in ES6, has yet to comply to all d3 module standards.

To initialize install all the requirements:

`npm install`

To create a taxBracket instance:

`var tbInstance = new TaxBrackets(listOfTaxSystems)`

To update with a new salary: `tbInstance.initGraph(salary)`

You can choose display mode with `.showOverall()` or `showDetailed()`.

Sample tax system looks like this:

```
var taxNowoczesna = {
  name: 'Nowoczesna',
  constantFee: 0, // no constant fee, like health insurance
  brackets: [
    {
      limit: 257.58, // upper tax bracket limit
      taxValue: 0 // tax-free
    },
    {
      limit: -1, // no limit
      taxValue: 16, // in percent
    }
  ]
}
```






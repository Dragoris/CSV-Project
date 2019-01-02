$(document).ready(function () {
 
  function handleFileSelect(evt) {
    var file = evt.target.files[0];
 
    Papa.parse(file, {
      headers: true,
      complete: function(results) {
        console.log(results)
        buildTable(results);

        analizeData(results);

      }
    });
  }

  function analizeData(results) {
    var output = {
      'images': {
        // count: number,
        // link: url,
        // totalProfit: number,
      // },
      },
      'orders': {
        // count: number,
        // link: string + order number,
        // totalProfit : number
      },
      'albums': {
        //totalProfit: number,
      }

    }
//     0: "OrderID"
// 1: "Date"
// 2: "Quantity"
// 3: "Currency"
// 4: "Base Price"
// 5: "Price Charged"
// 6: "Profit"
// 7: "Charges"
// 8: "Tax"
// 9: "Shipping Cost"
// 10: "Type"
// 11: "Name"
// 12: "Payment Status"
// 13: "Payment Date"
// 14: "Payment Info"
// 15: "Payment Currency"
// 16: "Payment Exchange Rate"
// 17: "Link"
// 18: "Filename"
// 19: "ImageID"
// 20: "AlbumID"
// 21: "Category Hierarchy"
// 22: "Gallery Title"





    $.each(results.data, function(i, row) {
      var headerCount = 23
      //skip header and ignore rows for shipping costs
      if (row.length == headerCount && i !== 0) {
        var link = row[17];
        var profit = Number(row[6]);

        var imgId = row[19];
        var orderId = row[0];
        var albumId = row[20];

        //if you already have this imgId increment the count and add in profit
        if (output['images'][imgId]) {
            output['images'][imgId]['count'] = output['images'][imgId]['count'] + 1
            output['images'][imgId]['totalProfit'] = output['images'][imgId]['totalProfit'] + profit
        }
        //otherwise set default values as for the img
        else{
          output['images'][imgId] = {
            'count': 1,
            'link': link + '/S',
            'totalProfit': profit
          }
        }
        //same thing for orders and albums
        if (output['orders'][orderId]) {
            output['orders'][orderId]['count'] = output['orders'][orderId]['count'] + 1
            output['orders'][orderId]['totalProfit'] = output['orders'][orderId]['totalProfit'] + profit
        }
        else{
          output['orders'][orderId] = {
            'count': 1,
            // 'link': link + '/S',
            'totalProfit': profit
          }
        }

        if (output['albums'][albumId]) {
            output['albums'][albumId]['totalProfit'] = output['albums'][albumId]['totalProfit'] + profit
        }
        else{
          output['albums'][albumId] = {
            'totalProfit': profit
          }
        }   
      }
      

    })
  
    console.log(output)

  }

  function buildTable(results) {
    var table = '<table>';

    $.each(results.data, function(i, row) {
      var close = ''
      if (i == 0) {
        table += '<thead><tr>'
        close = '</tr></thead>'
      }

      table += '<tr>'
      $.each(row, function(i, data) {
        table += '<td>' +data + '</td>'
      })

      table += '</tr>'
      table += close
    })

    table += '</table>'

    $('#csv_table').html(table)

     //initalize tablesorter options
    var options = {
      widgets : ["zebra", "columns"],
      theme:'dropbox',
      cssIcon: 'tablesorter-icon',
      initialized : function(table){
        $(table).find('thead .tablesorter-header-inner').append('<i class="tablesorter-icon"></i>');
      }
    };

    $('#csv_table').tablesorter(options);
  }
 
  $(document).ready(function(){
    $("#csv-file").change(handleFileSelect);
  });

})
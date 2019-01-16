$(document).ready(function () {
 
  function handleFileSelect(evt) {
    var file = evt.target.files[0];
 
    Papa.parse(file, {
      headers: true,
      complete: function(results) {
        console.log(results)
        // buildTable(results);

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
        if (row[10] === 'Sale') {
          var link = row[17];
          var profit = Number(row[6]);

          var orderId = row[0];
          var dateId = row[1];
          var imgId = row[19];
          var albumId = row[20];
          var parentFolder = row [21]; // This is the 'Folder' the Gallery lives inside. Listed in the CSV as "Category Hierarchy"
          var galleryTitle = row[22];
          

          //if you already have this imgId increment the count and add in profit
          if (output['images'][imgId]) {
              output['images'][imgId]['Time Sold'] = output['images'][imgId]['Time Sold'] + 1
              output['images'][imgId]['Total Image Profit'] = output['images'][imgId]['Total Image Profit'] + profit
          }
          //otherwise set default values as for the img
          else{
            output['images'][imgId] = {
              'SM Image Id': imgId,
              'Time Sold': 1, 
              'Link to image': link, // Need to make clickable, new tab, 
              'Total Image Profit': profit,
              'Parent Folder': parentFolder, // This seems to be working - 
            }
          }
          //same thing for orders and albums
          if (output['orders'][orderId]) {
              output['orders'][orderId]['count'] = output['orders'][orderId]['count'] + 1 
              output['orders'][orderId]['totalProfit'] = output['orders'][orderId]['totalProfit'] + profit
          }
          else{
            output['orders'][orderId] = {
              'SM Order ID': orderId,
              'Order Date' : dateId, // Added the Date!! 
            //'count': 1, // We'll never have two of the same order number. This might be worth hiding.
              'Order Link': "https://secure.smugmug.com/cart/order?OrderID=" + orderId, //Adding a link to the orders - Need to make them clickable, new tab
              'Order Total Profit': profit
            }
          }

          if (output['albums'][albumId]) {
              output['albums'][albumId]['Total Album Profit'] = output['albums'][albumId]['Total Album Profit'] + profit
          }
          else{
            output['albums'][albumId] = {
              'SM Album ID': albumId,
              'Gallery Title': galleryTitle,
              'Total Album Profit': profit,
              'Album Link (Admin)': "https://secure.smugmug.com/admin/info/album/?AlbumID=" + albumId, //Need to make them clickable, new tab 
            }
          }   
        }
      }
      

    })
  
    // console.log(unparse)

    var unparse = []

    $.each(output, function(i, table) {
      var group = [];

      $.each(table, function(i, row) {
        group.push(row)
      })

      unparse.push(group)
    })

    console.log(unparse)

    $.each(unparse, function(i, group){
      var csv = Papa.unparse(group);
      var results = Papa.parse(csv);

      buildTable(results, i)
    })

  }

  function buildTable(csv, id) {
    var table = '';

    $.each(csv.data, function(i, row) {
      var close = ''
      if (i == 0) {
        table += '<thead><tr>'
        close = '</tr></thead>'
      }

      table += '<tr>'
      $.each(row, function(index, data) {
        if (index == 2 && i != 0) {
          table += '<td><a href="' +data + '" target="_blank">'+data+'</a></td>'
        }
        else if (index == 3 && i != 0) {
          table += '<td>$' +Number(data).toFixed(2) + '</td>'

        }
        else{
          table += '<td>' +data + '</td>'

        }
      })

      table += '</tr>'
      table += close
    })

    table += ''

    $('#csv_table_' + id).html(table)

     //initalize tablesorter options
    var options = {
      widgets : ["zebra", "columns"],
      theme:'dropbox',
      cssIcon: 'tablesorter-icon',
      initialized : function(table){
        $(table).find('thead .tablesorter-header-inner').append('<i class="tablesorter-icon"></i>');
      }
    };

    $('#csv_table_' + id).tablesorter(options);
  }
 
  $(document).ready(function(){
    $("#csv-file").change(handleFileSelect);
  });

})
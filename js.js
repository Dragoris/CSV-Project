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
          var profit = Number(row[6])

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
              'Link to image': '<a href="' +link + '" target="_blank">'+link+'</a>', 
              'Total Image Profit': profit,
              'Parent Folder': parentFolder, 
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
              'Order Date' : dateId, 
              'Order Link': '<a href="https://secure.smugmug.com/cart/order?OrderID=' + orderId +'" target="_blank">https://secure.smugmug.com/cart/order?OrderID=' + orderId + '</a>', 
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
              'Album Link (Admin)': '<a href="https://secure.smugmug.com/admin/info/album/?AlbumID=' + albumId + '" target="_blank">https://secure.smugmug.com/admin/info/album/?AlbumID=' + albumId + '</a>', 
            }
          }   
        }
      }
      

    })
    //will hold an array or CSV data for each table we want to build
    var unparse = []

    //go over each property in our output obj and reformat the data into an array of objects
    $.each(output, function(i, table) {
      var group = [];

      $.each(table, function(i, row) {
        group.push(row)
      })

      unparse.push(group)
    })

    console.log(unparse)

    //convert each array of objects into a csv string and the parse that string
    //feed the results into our table building function
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
        //ADDING MORE COLUMNS WILL REQUIRE US TO UPDATE THIS LOGIC
        //id == 2 means we are building the albums table, which has its profit colums at
        //index 2 instead of 3, like the other tables
        if (id == 2) {
          //find the profit and exclude the header for the column
          if (index == 2 && i != 0) {
            //format the profit into currancy
            table += '<td>' +Number(data).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) + '</td>'
          }
          //print all other rows normally
          else{
            table += '<td>' +data + '</td>'

          }
        }
        //img and order tables both have profit at index 3
        else{
          if (index == 3 && i != 0) {
            //format the profit into currancy
            table += '<td>' +Number(data).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) + '</td>'
          }
          else{
            table += '<td>' +data + '</td>'

          }
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
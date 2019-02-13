$(document).ready(function () {

  function handleFileSelect(evt) {
    var file = evt.target.files[0];

    Papa.parse(file, {
      headers: true,
      complete: function(results) {
        console.log(results)

        analizeData(results);

        //hides placeholder, shows our table and downloads
        $('#table_tabs, #download_wrapper').removeClass('d-none');
        $('#table_placeholder').addClass('d-none')

      }
    });
  }

  function analizeData(results) {
    output = {
      'images': {},
      'orders': {},
      'albums': {}
    }
// 0: "OrderID"
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


    //these variables used to calculate the coupon discount
    var discount = 0;
    var currentImgs = [];
    var currentAlbums = [];
    var currentOrders = [];

    //*** start looping over a single csv row
    $.each(results.data, function(i, row) {

      var headerCount = 23;
      var link = row[17];
      var profit = Number(row[6]);
      var cuponOverage = Number(row[7]);
      var type = row[10];
      var orderId = row[0];
      var dateId = row[1];
      var imgId = row[19];
      var albumId = row[20];
      var parentFolder = row [21];
      var galleryTitle = row[22];

      //skip header and ignore rows for shipping costs
      if (row.length === headerCount && i !== 0) {

        if (type === 'Sale') {

          var imgObj = {
            'SM Image Id': imgId,
            'Link to image': link,
            'Total Image Profit': profit,
            'Parent Folder': parentFolder, // IF the gallery lives inside a 'Folder' it will be shown here. If not, it's blank
          }

          var albumObj = {
            'SM Album ID': albumId,
            'Gallery Title': galleryTitle,
            'Total Album Profit': profit,
            'Album Link (Admin)': 'https://secure.smugmug.com/admin/info/album/?AlbumID=' + albumId ,
          }

          var orderObj = {
            'SM Order ID': orderId,
            'Order Date' : dateId,
            'Order Link': 'https://secure.smugmug.com/cart/order?OrderID=' + orderId,
            'Order Total Profit': profit
          }

          currentImgs.push(imgObj);
          currentAlbums.push(albumObj);
          currentOrders.push(orderObj);
        }
        //this is a coupon. It has a varing 'type' name and has a value for profit
        else if (type !== 'Sale' && profit) {
          discount += profit
        }

      }

      else if (row.length === 21 && type === 'Coupon Overage') {
        discount += cuponOverage
      }

      //this is a shipping cost. Marks the end of an order
      else if (row.length === 13) {

        //calculate discount for images and albums
        var imgDiscount = 0;
        var albumDiscount = 0;

        if (discount) {
          //if we have a discount we divide that across all images and albums evenly
          imgDiscount = (Number(discount) / currentImgs.length)
          albumDiscount = (Number(discount) / currentAlbums.length)
        }


        $.each(currentImgs, function (i, img) {
          var imgId = img['SM Image Id'];
          var profit = img['Total Image Profit'];
          var link = img['Link to image'];
          var parentFolder = img['Parent Folder'];

          //if you already have this imgId increment the count and add in profit
          if (output['images'][imgId]) {
              output['images'][imgId]['Times Sold'] = output['images'][imgId]['Times Sold'] + 1
              output['images'][imgId]['Total Image Profit'] = output['images'][imgId]['Total Image Profit'] + profit + imgDiscount
          }
          //otherwise set default values as for the img
          else{
            output['images'][imgId] = {
              'SM Image Id': imgId,
              'Times Sold': 1,
              'Link to image': link,
              'Total Image Profit': profit + imgDiscount,
              'Parent Folder': parentFolder, // IF the gallery lives inside a 'Folder' it will be shown here. If not, it's blank
            }
          }
        })



        //same thing for orders and albums
        $.each(currentAlbums, function(i, album) {
          var albumId = album['SM Album ID'];
          var profit = album['Total Album Profit'];
          var link = album['Album Link (Admin)'];
          var galleryTitle = album['Gallery Title'];

          if (output['albums'][albumId]) {
            output['albums'][albumId]['count'] = output['albums'][albumId]['count'] + 1
            output['albums'][albumId]['Total Album Profit'] = output['albums'][albumId]['Total Album Profit'] + profit + albumDiscount
          }
          else{
            output['albums'][albumId] = {
              'SM Album ID': albumId,
              'count': 1,
              'Album Link (Admin)': link,
              'Total Album Profit': profit + albumDiscount,
              'Gallery Title': galleryTitle,

            }
          }
        })
        //adding up all profit for an order
        var totalOrderProfit = 0;
        $.each(currentOrders, function(i, order) {
          var orderProfit = order['Order Total Profit'];

          totalOrderProfit += orderProfit
        })

        totalOrderProfit += discount
        var orderId = currentOrders[0]['SM Order ID'];
        var dateId = currentOrders[0]['Order Date'];

        if (output['orders'][orderId]) {
            output['orders'][orderId]['Order Total Profit'] = output['orders'][orderId]['Order Total Profit'] + totalOrderProfit
        }
        else{
          output['orders'][orderId] = {
            'SM Order ID': orderId,
            'Order Date' : dateId,
            'Order Link': 'https://secure.smugmug.com/cart/order?OrderID=' + orderId,
            'Order Total Profit': totalOrderProfit
          }
        }


        //reset values after an order
        discount = 0;
        currentImgs = [];
        currentAlbums = [];
        currentOrders = [];

      }

    })
    //*** end csv row loop

    //output is the result of looping over all rows of the csv
    console.log(output)

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

    //convert each array of objects into a csv string and the parse that string
    //feed the results into our table building function
    //clearing all download links before re-rendering them
    $('#file_holder').empty();
    $.each(unparse, function(i, group){
      var csv = Papa.unparse(group);
      var results = Papa.parse(csv);

      buildCSVLink(csv, i);
      buildTable(results, i);
    })

  }

  function buildCSVLink(csv, id) {
      var fileName;
      var color;
      if (id === 0) {
        fileName = 'images.csv'
        color = '#009933'
      }
      else if (id === 1) {
        fileName = 'orders.csv'
        color = '#0033cc'
      }
      else if (id === 2) {
        fileName = 'albums.csv'
        color = '#ff9900'
      }

      var icon = '<div class="csv-icon"><a href="data:text/csv;charset=utf-8,' + encodeURI(csv)+'" target="_blank" download="'+fileName+'"><i class="fas fa-3x fa-file-csv" style="color:'+color+'; width:100%"></i>'+fileName+'</div></a>'
      $('#file_holder').append(icon)

    }


  function buildTable(csv, id) {
    var table = '';

    $.each(csv.data, function(i, row) {
      var close = ''
      if (i == 0) {
        table += '<thead>'
        close = '</thead>'
      }

      table += '<tr>'
      $.each(row, function(index, data) {
        //'index' indicates which column of the table we are looking at
        // i != 0 tells us to skip the header info from the first row
        if (index == 2 && i != 0) {
            var link = '<a href="'+data+'" target="_blank">'+data+'</a>'
            table += '<td>' +link+ '</td>'
        }
        else if (index == 3 && i != 0) {
          //format the profit into currancy
          var profit = Number(data).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          table += '<td>' + profit + '</td>'
        }
        else{
          table += '<td>' + data + '</td>'
        }

      })

      table += '</tr>'
      table += close
    })

    //apply built html to the table with the id passed in
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

    //activating ability to sort by click on headers
    $('#csv_table_' + id).tablesorter(options);
  }

  $(document).ready(function(){
    $("#csv-file").change(handleFileSelect);
  });

//****CAROUSEL***//
  $('.carousel').carousel({
    interval: 3000
  })

})


function addImg(){
  var total = 0

  $.each(output.images, function(i, img){
    total += img['Total Image Profit']
  })
  console.log(total)
}

function addAlbum(){
  var total = 0

  $.each(output.albums, function(i, album){
    total += album['Total Album Profit']
  })
  console.log(total)
}

function addOrder(){
  var total = 0

  $.each(output.orders, function(i, order){
    total += order['Order Total Profit']
  })
  console.log(total)
}

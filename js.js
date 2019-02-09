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
    output = {
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



    var discount = 0;
    var currentImgs = [];
    var currentAlbums = [];
    var currentOrders = [];
    var uniqueAlbums = new Set();
    var uniqueImgs = new Set();

    $.each(results.data, function(i, row) {
      if (row[0] === '4935917') {
        console.log(row)
      }
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

          currentImgs.push(imgObj)
          currentAlbums.push(albumObj)
          currentOrders.push(orderObj)

          uniqueImgs.add(imgId)
          uniqueAlbums.add(albumId)
        }
        //this is a coupon
        else if (type !== 'Sale' && row[6]) {
          discount += profit
        }
        
      }
      else if (row.length === 21 && type === 'Coupon Overage') {
        discount += cuponOverage
      }

      //this is a shipping cost. Marks the end of an order
      else if (row.length === 13) {

        var imgDiscount = 0;
        var albumDiscount = 0;

        if (discount) {
          imgDiscount = (Number(discount) / uniqueImgs.size)
          albumDiscount = (Number(discount) / uniqueAlbums.size)
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
        var totalOrderProfit = 0;

        $.each(currentOrders, function(i, order) {
          var orderProfit = order['Order Total Profit'];
          // if (orderId === '5400453') {
          //   console.log(discount, orderProfit)
          // } 
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

      var icon = '<div class="csv-icon"><a href="data:text/csv;charset=utf-8,' + encodeURI(csv)+'" target="_blank" download="'+fileName+'"><i class="fas fa-2x fa-file-csv" style="color:'+color+'; width:100%"></i>'+fileName+'</div></a>'
      $('#file_holder').append(icon)

    }

    //convert each array of objects into a csv string and the parse that string
    //feed the results into our table building function

    $('#file_holder').empty();
    $.each(unparse, function(i, group){
      var csv = Papa.unparse(group);
      var results = Papa.parse(csv);

      buildCSVLink(csv, i)
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
        //'index' indicates which column of the table we are looking at
        // i != 0 tells us to skip the header info from the first row 
        if (index == 2 && i != 0) {
            var link = '<a href="'+data+'" target="_blank">'+data+'</a>'
            table += '<td>' +link+ '</td>'
        }
        else if (index == 3 && i != 0) {
          //format the profit into currancy
          var money = Number(data).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          table += '<td>' +money + '</td>'
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
  function addImg(){
    var total = 0

    $.each(output.images, function(i, img){
      total += img['Total Image Profit']
    })
    console.log(total)
  }

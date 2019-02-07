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



    var discount = 0;
    var currentImgs = [];
    var currentAlbums = [];
    var uniqueAlbums = new Set();
    var uniqueImgs = new Set();

    $.each(results.data, function(i, row) {
      var headerCount = 23
      //skip header and ignore rows for shipping costs
<<<<<<< HEAD
      if (row.length == headerCount && i !== 0) {
        if (row[10] === 'Sale') {
          var link = row[17];
          var profit = Number(row[6])

          var orderId = row[0];
          var dateId = row[1];
          var imgId = row[19];
          var albumId = row[20];
          var parentFolder = row [21]; // This is the 'Folder' the Gallery lives inside. Listed in the CSV as "Category Hierarchy" - Sometimes a there is no parent folder.
          var galleryTitle = row[22];

=======
      if (row.length === headerCount && i !== 0) {
        var link = row[17];
        var profit = Number(row[6]);
        var charges = Number(row[7]);
        var type = row[10];
        var orderId = row[0];
        var dateId = row[1];
        var imgId = row[19];
        var albumId = row[20];
        var parentFolder = row [21]; // This is the 'Folder' the Gallery lives inside. Listed in the CSV as "Category Hierarchy" - Sometimes a there is no parent folder. 
        var galleryTitle = row[22];
          
        if (type === 'Sale') {

          var imgObj = {
            'SM Image Id': imgId,
            'Link to image': '<a href="' +link + '" target="_blank">'+link+'</a>', 
            'Total Image Profit': profit,
            'Parent Folder': parentFolder, // IF the gallery lives inside a 'Folder' it will be shown here. If not, it's blank 
          }

          var albumObj = {
            'SM Album ID': albumId,
            'Gallery Title': galleryTitle,
            'Total Album Profit': profit,
            'Album Link (Admin)': '<a href="https://secure.smugmug.com/admin/info/album/?AlbumID=' + albumId + '" target="_blank">https://secure.smugmug.com/admin/info/album/?AlbumID=' + albumId + '</a>', 
          }

        //orders profit already factors in cupons, can calculate now
        if (output['orders'][orderId]) {
            output['orders'][orderId]['Order Total Profit'] = output['orders'][orderId]['Order Total Profit'] + profit
        }
        else{
          output['orders'][orderId] = {
            'SM Order ID': orderId,
            'Order Date' : dateId, 
            'Order Link': '<a href="https://secure.smugmug.com/cart/order?OrderID=' + orderId +'" target="_blank">https://secure.smugmug.com/cart/order?OrderID=' + orderId + '</a>', 
            'Order Total Profit': profit
          }
        }



          currentImgs.push(imgObj)
          currentAlbums.push(albumObj)

          uniqueImgs.add(imgId)
          uniqueAlbums.add(albumId)
        }
        //this is a coupon
        else if (type !== 'Sale' && row[6]) {
          discount = profit
        }




        
      }
      //this is a cupon overage
      // else if (row.length === 21) {
      //   //add row[7] to profit to factor in cupon discounts
      //   imgProfit += charges
      //   albumProfit += charges

      // }
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
>>>>>>> f1596b451e1acbcccbde8271ec841b6b0ee7bdfa

          //if you already have this imgId increment the count and add in profit
          if (output['images'][imgId]) {
              output['images'][imgId]['Times Sold'] = output['images'][imgId]['Times Sold'] + 1
              output['images'][imgId]['Total Image Profit'] = output['images'][imgId]['Total Image Profit'] + profit + imgDiscount
          }
          //otherwise set default values as for the img
          else{
            output['images'][imgId] = {
              'SM Image Id': imgId,
<<<<<<< HEAD
              'Times Sold': 1,
              'Link to image': '<a href="' +link + '" target="_blank">'+link+'</a>',
              'Total Image Profit': profit,
              'Parent Folder': parentFolder, // IF the gallery lives inside a 'Folder' it will be shown here. If not, it's blank
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
=======
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
>>>>>>> f1596b451e1acbcccbde8271ec841b6b0ee7bdfa

          if (output['albums'][albumId]) {
            output['albums'][albumId]['count'] = output['albums'][albumId]['count'] + 1
            output['albums'][albumId]['Total Album Profit'] = output['albums'][albumId]['Total Album Profit'] + profit + albumDiscount
          }
          else{
            output['albums'][albumId] = {
              'count': 1,
              'SM Album ID': albumId,
              'Gallery Title': galleryTitle,
<<<<<<< HEAD
              'Total Album Profit': profit,
              'Album Link (Admin)': '<a href="https://secure.smugmug.com/admin/info/album/?AlbumID=' + albumId + '" target="_blank">https://secure.smugmug.com/admin/info/album/?AlbumID=' + albumId + '</a>',
            }
          }
        }
      }


=======
              'Total Album Profit': profit + albumDiscount,
              'Album Link (Admin)': link, 
            }
          }
        })

        
        //reset values after an order
        discount = 0;
        currentImgs = [];
        currentAlbums = [];
             
      }
      
>>>>>>> f1596b451e1acbcccbde8271ec841b6b0ee7bdfa
    })
          // console.log(output)

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
        var money = Number(data).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        // if (id == 2) {
        //   //find the profit and exclude the header for the column
        //   if (index == 3 && i != 0) {
        //     //format the profit into currancy
        //     table += '<td>' +money + '</td>'
        //   }
        //   //print all other rows normally
        //   else{
        //     table += '<td>' +data + '</td>'

        //   }
        // }
        // //img and order tables both have profit at index 3
        // else{
          if (index == 3 && i != 0) {
            //format the profit into currancy
            table += '<td>' +money + '</td>'
          }
          else{
            table += '<td>' +data + '</td>'

          }
<<<<<<< HEAD
        }

=======
        // }
        
>>>>>>> f1596b451e1acbcccbde8271ec841b6b0ee7bdfa
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

<<<<<<< HEAD
})
=======


})
  function addImg(){
    var total = 0

    $.each(output.images, function(i, img){
      total += img['Total Image Profit']
    })
    console.log(total)
  }
>>>>>>> f1596b451e1acbcccbde8271ec841b6b0ee7bdfa

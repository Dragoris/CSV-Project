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
      }
      // 'orders': {
        // link: string + order number,
        // orderSize: number (item coun in order),
        // totalProfit : number
      // },
      //albums:{
        //totalProfit: number
      // }

    }
    var columns ;

    $.each(results.data, function(i, row) {
      var headerCount = 23
      if (i == 0) {
        columns = row
      }
      else {
        if (row.length == headerCount) {
          $.each(row, function(i, data) {
            var imgId = row[19]
            var link = row[17]
            var obj = {
              'count': null,
              'link': null
            }

            if (i == 17) {
               if (output['images'][imgId]) {
                  output['images'][imgId]['link'] = link + '/S'
               }
              else {
                output['images'][imgId] = {
                  'count': 1,
                  'link': link + '/S'
                }
              }
            }
            if (i == 19) {
              if (output['images'][imgId]) {
                output['images'][imgId]['count'] = output['images'][imgId]['count'] + 1
              }
              else{
                output['images'][imgId] = {
                  'count': 1
                }
              }
              
            }
            
          })
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
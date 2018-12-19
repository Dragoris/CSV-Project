$(document).ready(function () {
 
  function handleFileSelect(evt) {
    var file = evt.target.files[0];
 
    Papa.parse(file, {
      headers: true,
      complete: function(results) {
        console.log(results)
        buildTable(results);

        analizeData(results, [19, 20]);

      }
    });
  }

  function analizeData(results, columns) {
    var data = {}
    columns.forEach(function(column) {
      data[column] = {}


      $.each(results.data, function(i, row) {
        var headerCount = 23
        if (i == 0) {
          headerCount = row.length
        }
        else {
          if (row.length == headerCount) {
            $.each(row, function(i, data) {
              if (i == column) {
                if (data[column][data] ) {
                  data[column][data] += 1
                }
                else{
                  data[column][data] = 1

                }
              }
            })
          }
        }
      })
    })

    console.log(data)
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
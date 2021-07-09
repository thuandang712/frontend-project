init();
autoRefresh();

function init() {
    createTable()
    createTableHeadAndBody();
    createTableHeadAttribute()
    createTableRowAndData();
}

function autoRefresh() { // every 1 min
    setInterval( () => {
        $('#tableContainer').empty();
        init();
    }, 60000);
}

// Create table
function createTable() {
    var table = $('<table></table>')
    table.attr('id', 'table_id')
    var tableCaption = $('<caption></caption>')
    tableCaption.attr('id', 'caption')
    table.append(tableCaption)
    $('#tableContainer').append(table)
}

// Create table head and body
function createTableHeadAndBody() {
    var thead = $('<thead></thead>')
    thead.attr('id', 'tableHead')
    var tbody = $('<tbody></tbody>')
    tbody.attr('id', 'tableBody')
    $('#table_id').append(thead)
    $('#table_id').append(tbody)
}

// Create table head attribute
function createTableHeadAttribute() {
    var tr_head = $('<tr></tr>')
    tr_head.addClass('row')
    $('#tableHead').append(tr_head)
    var arrayAttribute = [`#`, `Name`, `Price`, `Change`, `Volume (24h)`, `Market cap`];
    arrayAttribute.forEach( (atr) => {
        $('thead tr:first-child').append('<th>' + atr + '</th>') // get table head's first tr child and append each atr in the array
    });
}

// Create table rows and append data
function createTableRowAndData() {
    $.get('https://api.coincap.io/v2/assets', getData);
}

// manipulate data from API and add event listener to name
function getData(assets) { 
    for (var i = 0; i < assets.data.length; i++) {
        var currentAsset = assets.data[i];

        // set parameters
        const oneM = 1000000;
        const oneB = 1000000000;
        var currentPrice = parseFloat(currentAsset.priceUsd).toFixed(2) // returns a string
        var percentChange = parseFloat(currentAsset.changePercent24Hr).toFixed(2) // returns a string
        var volume = parseFloat(currentAsset.volumeUsd24Hr); // returns a number
        var marketCap = (parseFloat(currentAsset.marketCapUsd) / oneB).toFixed(2); // in billion

        // create table rows
        var tableRow = $('<tr></tr>')
        tableRow.addClass('row')
        
        // another way
        // $('tbody').append($('<tr>').addClass('row').attr('id', `${current.name}`))

        // append data to table row
        $(tableRow).append($('<td>').addClass('rank').text(`${currentAsset.rank}`))
        $(tableRow).append($('<td>').addClass('name').attr('id',`${currentAsset.id}`).text(`${currentAsset.name} ${currentAsset.symbol}`))
        //$(tableRow).append($('<td>').addClass('symbol').text(`${currentAsset.symbol}`))
        $(tableRow).append($('<td>').addClass('price').text(`$${currentPrice}`))
        $(tableRow).append($('<td>').addClass('percentChange').text(`${percentChange}%`))

        // manipulate M and B
        if (volume < oneB) {
            volume = ( volume / oneM ).toFixed(2);
            $(tableRow).append($('<td>').addClass('volume').text(`$${volume}M`)) // show volume in M
        } else {
            volume = ( volume / oneB ).toFixed(2);
            $(tableRow).append($('<td>').addClass('volume').text(`$${volume}B`)) // show volume in B
        }
        
        $(tableRow).append($('<td>').addClass('marketCap').text(`$${marketCap}B`))

        // append table row to table body
        $('#table_id').append(tableRow)
    }

    addEventListenerToName()
    addEventListenerToSearchBar()
    
    // add time handler
    timeConverter(assets.timestamp)
}

// add event listener to search bar so that when user starts typing text the table will be filtered
function addEventListenerToSearchBar() {
    $('#user_input').keyup(searchTable)
}

// call back function search table
function searchTable() {
    var input = document.getElementById('user_input')
    var filter = input.value.toUpperCase();
    var table = document.getElementById("table_id");
    var tr = table.getElementsByTagName("tr");
    for (var k = 0; k < tr.length; k++) {
      var td = tr[k].getElementsByTagName("td")[1]; // the name array
      if (td) {
        var txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) { // use indexOf method to check if the text input can be found in the name array
          tr[k].style.display = ""; // display if found
        } else {
          tr[k].style.display = "none"; // hide if not found
        }
      }       
    }
}

// Add event listener to each name
function addEventListenerToName() {
    var nameArr = document.getElementsByClassName('name') // returns an array-like with class of 'name'
    for (var j = 0; j < nameArr.length; j++) {
        nameArr[j].addEventListener('click', goToAssetProfile)
    }
    //????????????????????? // somehow jquery is not working on this // ?????????????????????????
    // var nameArr = $('.name')
    // nameArr.each( (i) => {
    //     $(this).click( () => {
    //        console.log('working'+ i)
    //    })
    // })
}

// handle click event on name
function goToAssetProfile(e) {
    createHomeButton()
    addEventListenerToHomeButton()
    hide();
    $.get(`https://api.coincap.io/v2/assets/${e.target.id}`, (data) => { // data is an obj of objs
        // console.log(data)
        let obj = data.data
        for (var key in obj) {
            var div = $('<div></div>')
            div.addClass('assetProfile')
            div.text(`${key}: ${obj[key]}`)
            $('#assetContainer').append(div)
        }
    })
}

// convert UNIX time to hh:mm:ss format
function timeConverter(UNIX_time) { // UNIX_time is already in milisecond
    // time manipulation
    var fullDate = new Date(UNIX_time) 
    var year = fullDate.getFullYear();
    var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][fullDate.getMonth()];
    var date = fullDate.getDate();
    var hours = fullDate.getHours();
    var minutes = '0' + fullDate.getMinutes();
    var seconds = '0' + fullDate.getSeconds();
    var formatted_time = `${date} ${month} ${year} ${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
    //return formatted_time;
    //target caption id
    $('#caption').text(`Last updated ${formatted_time}`)
}

// create home button
function createHomeButton() {
    var button = $("<button></button>")
    button.attr('id', 'homeBtn')
    button.text("Back")
    $("#assetContainer").append(button)
}

// add event listener to home button
function addEventListenerToHomeButton() {
    $('#homeBtn').click(show)
}

function show() {
    $('h1').show()
    $('h2').show()
    $('#user_input').show()
    $('#tableContainer').show()
    $('#assetContainer').hide()
    $('#assetContainer').empty()
}

function hide() {
    $('#assetContainer').show()
    $('#tableContainer').hide()
    $('h1').hide()
    $('h2').hide()
    $('#user_input').hide()
}
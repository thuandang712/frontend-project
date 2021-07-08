
init();
autoRefresh();


function init() {
    createTable()
    createTableHeadAndBody();
    createTableHeadAttribute()
    createTableRowAndData();
}

// timeConverter(assets.timestamp)

function autoRefresh() { //every 1 min
    setInterval( () => {
        $('#tableContainer').empty();
        init();
    }, 60000);
}

// Create table
function createTable() {
    var table = $('<table></table>')
    table.attr('id', 'table_id')
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
    $('#assetContainer').show()
    $('#tableContainer').hide()

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
    var date = new Date(UNIX_time) 
    var hours = date.getHours();
    var minutes = '0' + date.getMinutes();
    var seconds = '0' + date.getSeconds();
    var formatted_time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formatted_time;
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
    $('#homeBtn').click( () => {
        $('#tableContainer').show()
        $('#assetContainer').hide()
        $('#assetContainer').empty()
    })
}
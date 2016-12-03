var names = []; // global array holding all names of businesses

// helper function to empty and repopulate the table with results
function loadTable(data) {
	$(".businesses tr:not(:first)").remove();
    $(".result-msg").remove();
	var trHTML = '';
	$.each(data, function (i, item) {
        trHTML += '<tr><td>' + item.business + '</td><td>' + item.address + '</td><td>' +
        			item.rating + '</td><td>' + item.date + '</td><td><input type="button" class="btn-rating" value="Get Rating"></td></tr>';
    });
	$(".businesses").append(trHTML);
}

// helper function to load all business names into an array
// used for autocomplete
function getNames(pageNum) {
	$.getJSON("https://www.cs.kent.ac.uk/people/staff/lb514/hygiene/hygiene.php",
	{
		op: "retrieve",
		page: pageNum
	},
	function(data) {
		$.each(data, function (i, item) {
			names.push(item.business);
	   	});
	});
}

$(document).ready(function() {
	// load autocomplete on search field
	$("#search-text").autocomplete({ source: names });

	// retrieve the first page of results and populate the table
	$.getJSON("https://www.cs.kent.ac.uk/people/staff/lb514/hygiene/hygiene.php",
	{
		op: "demo",
	},
	function(data) {
		loadTable(data);
	});

	// retrieve the total number of pages and create a row of buttons for them
	$.getJSON("https://www.cs.kent.ac.uk/people/staff/lb514/hygiene/hygiene.php",
	{
		op: "pages",
	},
	function(data) {
		var btHTML = '';
		$.each(data, function (i, item) {
            for (var j = 1; j <= item; j++) {
            	btHTML += "<input type='button' class='btn-page' value='" + j + "'>";
            	getNames(j);
            }
       	});
		$(".paginator").append(btHTML);
	});

	// paginator buttons listener that populates the table
	// with the page of results for the clicked button
	$(".paginator").on('click', '.btn-page', function() {
		$.getJSON("https://www.cs.kent.ac.uk/people/staff/lb514/hygiene/hygiene.php",
		{
			op: "retrieve",
			page: $(this).val()
		},
	 	function(data) {
			loadTable(data);
		});
	});

	// search submit button listener that passes the specified string as parameter
	// to the script and populates the table with the results
	$("#btn-submit-search").click(function(e) {
		e.preventDefault();
		var value = $('#search-text').val();
	    $.getJSON("https://www.cs.kent.ac.uk/people/staff/lb514/hygiene/hygiene.php",
	    {
	    	op: 'searchname',
	        name: value
	    },
	    function(data) {
	    	loadTable(data);
	    	$(".businesses").before("<p class='result-msg'>Results for businesses with names containing '" + value + "':</p>");
		});
		$('#search-text').val("");
	});

	// Listener for the rating button that passes the business name as a
	// parameter to the script and looks for matches by postcode in the results
	$("body").on("click", ".btn-rating", function() {
		var businessName = $(this).closest('tr').find("td:nth-child(1)").text();
		var businessPostcode = $(this).closest('tr').find("td:nth-child(2)").text().slice(-7);
		$.getJSON("https://www.cs.kent.ac.uk/people/staff/lb514/hygiene/rating.php",
	    {
	        name: businessName
	    },
	    function(data) {
	    	var found = false;
    		$.each(data, function (i, item) {
    			if(item.address.indexOf(businessPostcode) != -1) {
    				alert(item.rating);
    				found = true;
    			}
	    	});
	    	if(!found) {
	    		alert("Rating for that business is not currently available.");
	    	}
		});
	});
});
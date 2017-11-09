// initialize firebase
var config = {
    apiKey: "AIzaSyBVrLMdbFF2eJcsvaRot7T1yqYuXdy-SEI",
    authDomain: "beercast-149f8.firebaseapp.com",
    databaseURL: "https://beercast-149f8.firebaseio.com",
    projectId: "beercast-149f8",
    storageBucket: "beercast-149f8.appspot.com",
    messagingSenderId: "599636463743"
};

firebase.initializeApp(config);

var database = firebase.database().ref("/");

// creates a "location" child in the main database
var loc = database.child("location");

// initialize global variables
var userCity;
var userState;
var beerType;
var dayOfWeek;

// code for creating a drop down form selector for the states
var statesArray = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];

for (var i = 0; i < statesArray.length; i++) {
	var stateOption = $("<option>");
	stateOption.attr("value", statesArray[i]);
	stateOption.html(statesArray[i]);
	$("#inlineFormCustomSelect").append(stateOption);
}

// function to dynamically add a 3-day weather forecast to the DOM based on city and state input
function createForecast() {
	$("#weatherArea").empty(); // empties weatherArea div so that we don't get duplicates
	$("#beerArea").empty();

	var queryURL = "https://api.wunderground.com/api/404b6bf115d36806/forecast/q/" + userState + "/" + userCity + ".json";

	// ajax call the to the Weather Underground API
	$.ajax ({
		url: queryURL,
		method: "GET"
	}).done(function(response) {
		
		if (response.response.error){
			$("#errorText").html(response.response.error.description);
			return;
		}
		
		var response = response.forecast.txt_forecast.forecastday;
		
		// creates a display card for each day's forecast that contains the day, weather image, temperature, and weather description
		for (var i = 0; i < 6; i++) {
			var weatherCard = $("<div>");
			weatherCard.addClass("card weatherCard text-center");
			weatherCard.attr("style", "background-color: rgba(245, 245, 245, 0.4);");

			var cardImg = $("<img>");
			cardImg.addClass("card-img-top weatherImg");
			cardImg.attr("src", response[i].icon_url);
			cardImg.attr("alt", "Weather icon");

			var cardBody = $("<div>");
			cardBody.addClass("card-body");

			var cardTitle = $("<h4>");
			cardTitle.addClass("card-title");
			cardTitle.html(response[i].title);

			var cardDesc = $("<p>");
			cardDesc.addClass("card-text");
			cardDesc.html(response[i].fcttext);

			var beerRecsBtn = $("<button>");
			beerRecsBtn.addClass("btn btn-primary beer-recs-btn");
			beerRecsBtn.attr("weatherType", response[i].icon);
			beerRecsBtn.attr("dayOfWeek", response[i].title);
			beerRecsBtn.html("Beer Me");
			console.log(beerRecsBtn.attr("weatherType"));

			weatherCard.append(cardImg);
			weatherCard.append(cardBody);
			cardBody.append(cardTitle);
			cardBody.append(cardDesc);
			cardBody.append(beerRecsBtn);
			$("#weatherArea").append(weatherCard);
		}
		var weatherDivText = "<p class='text-center' id='weatherDivText'>Three-day weather forecast for " + userCity + ", " + userState + " </p>";
		$("#weatherArea").prepend(weatherDivText);
	});
}

// function to pull beer types from the Punk API based on weather type and then dynamically create the beer cards to display on tne DOM
function createBeerRecs() {
	$("#beerArea").empty(); // empties beerArea div to prevent duplicates

	var queryURL = "https://api.punkapi.com/v2/beers?beer_name=" + beerType;

	// ajax call to the Punk API
	$.ajax ({
		url: queryURL,
		method: "GET"
	}).done(function(response) {
		var response = response;
		console.log(response);

		// creates a display card for each recommended beer that contains an image, the beer name, and the beer description
		for (var i = 0; i < response.length; i++) {
			var beerCard = $("<div>");
			beerCard.addClass("card beerCard text-center");
			beerCard.attr("style", "background-color: rgba(67, 63, 64, 0.5);");

			var cardRow = $("<div>");
			cardRow.addClass("row");

			var cardColImg = $("<div>");
			cardColImg.addClass("col-md-3");

			var cardImg = $("<img>");
			cardImg.addClass("card-img-top beerImg text-center");
			cardImg.attr("src", response[i].image_url);
			cardImg.attr("alt", response[i].name + "image");

			var cardBody = $("<div>");
			cardBody.addClass("col-md-9 card-body");

			var cardTitle = $("<h4>");
			cardTitle.addClass("beer-title");
			cardTitle.html(response[i].name);

			var cardDesc = $("<p>");
			cardDesc.addClass("beer-text");
			cardDesc.html(response[i].description);

			beerCard.append(cardRow);
			cardRow.append(cardColImg);
			cardColImg.append(cardImg);
			cardRow.append(cardBody);
			cardBody.append(cardTitle);
			cardBody.append(cardDesc);
			$("#beerArea").append(beerCard);
		}
		var beerDivText = "<p class='text-center' id='beerDivText'>Recommended beers for " + dayOfWeek + "</p>";
		$("#beerArea").prepend(beerDivText);
	});
}

// when button is clicked, createForecast function is called and data is pushed to firebase
$("#submit-btn").on("click", function(event) {
	event.preventDefault();

	// clears the error message if a previous input generated an invalid city and state
	$("#errorText").empty();

	//grabs user input
	userCity = $("#userInput").val().trim();
	userState = $("#inlineFormCustomSelect").val();
	console.log(userState);

	//create location object
	var newLocation = {
		city: userCity,
		state: userState
	}

	loc.push(newLocation);
	console.log(newLocation);

	// clears the input box
	$("#userInput").val("");
	$("#inlineFormCustomSelect").val("default");

	// calls function that dynamically generates the weather forecast
	createForecast();

	// automatically scrolls to the forecast once it's generated
	$("html, body").animate({
		scrollTop: $("#weatherArea").offset().top
	}, 1000);
});

// when "Beer Me" button is clicked, the weather type for that day is grabbed and the createBeerRecs function is called
$("body").on("click", ".beer-recs-btn", function(event) {
	event.preventDefault();

	// stores the clicked day to use as input in beerDivText
	dayOfWeek = $(this).attr("dayOfWeek");
	console.log(dayOfWeek);

	// grabs the weather type for the day clicked
	var weatherType = $(this).attr("weatherType");
	console.log(weatherType);

	// logic for pairing weather type to beer style
	if (weatherType == "cloudy" || weatherType == "mostlycloudy" || weatherType == "partlycloudy" || weatherType == "nt_cloudy" || weatherType == "nt_mostlycloudy" || weatherType == "nt_partlycloudy") {
		beerType = "lager";
	} else if (weatherType == "fog" || weatherType == "hazy" || weatherType == "nt_fog" || weatherType == "nt_hazy") {
		beerType = "pilsner";
	} else if (weatherType == "chancerain" || weatherType == "rain" || weatherType == "nt_chancerain" || weatherType == "nt_rain") {
		beerType = "belgian";
	} else if (weatherType == "chancesleet" || weatherType == "sleet" || weatherType == "nt_chancesleet" || weatherType == "nt_sleet") {
		beerType = "porter";
	} else if (weatherType == "chanceflurries" || weatherType == "chancesnow" || weatherType == "flurries" || weatherType == "snow" || weatherType == "nt_chanceflurries" || weatherType == "nt_chancesnow" || weatherType == "nt_flurries" || weatherType == "nt_snow") {
		beerType = "stout";
	} else if (weatherType == "clear" || weatherType == "mostlysunny" || weatherType == "partlysunny" || weatherType == "sunny" || weatherType == "nt_clear" || weatherType == "nt_mostlysunny" || weatherType == "nt_partlysunny" || weatherType == "nt_sunny") {
		beerType = "ipa";
	} else if (weatherType == "chancetstorms" || weatherType == "tstorms" || weatherType == "nt_chancetstorms" || weatherType == "nt_tstorms") {
		beerType = "ale";
	}

	createBeerRecs();

	// automatically scrolls to the recommended beers once they're generated
	$("html, body").animate({
		scrollTop: $("#beerArea").offset().top
	}, 1000);
});


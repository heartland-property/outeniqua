function docReady(fn) {
	// see if DOM is already available
	if (document.readyState === "complete" || document.readyState === "interactive") {
		// call on next available tick
		setTimeout(fn, 1);
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}

const docReadyEvent = new Event('docreadyEvent');

let totalNumberOfAddons = 3;
/*let totalNumberOfMyPlaceAddons = 4;*/
let numberOfFloors = 6;

var addonsSelected = [],
	additionalAddonsSelected = [],
	floorOptionSelected = "",
	selectedListAddons = [];

var dontListenFloorChanged = false;

let totalUnitCostDiv = $(".total_unit_cost"),
	totalCostHiddenInput = $("#totalCostHiddenInput"),
	unitIDInput = $("#unitIDInput");

var allAddonNumbers = [];
/*var allMyPlaceAddonNumbers = [];*/
var addonListTotals = [];

var unityGame,
	totalUnitCost = 0,
	unitCostValues = {addOn: 0},
	selectedUnitNo = "",
	selectedUnitID = "",
	unitImage = "",
	gameLoaded = false,
	selectedUnitXraiIframeLink = "",
	oldselectedUnitXraiIframeLink = "",
	formFirstName = "",
	formLlastName = "";

let defaultListAddonButtonColor;
let defaultListAddonButtonTextColor;

var ignoreSolarClick = false;

var distanceFromTopBefore;
var distanceFromTopAfter;
var distanceFromTopDifference;
/*var myplaceAddonExternal = false;*/
var originalFloorPrice = 0;

var clickedFromFloorPlan = false;

$(document).ready(function () {
	document.dispatchEvent(docReadyEvent);
	for ( i = 1; i < totalNumberOfAddons + 1; i++ ) {
		allAddonNumbers.push(i);
	}
	
	/*for ( i = 1; i < totalNumberOfMyPlaceAddons + 1; i++ ) {
		allMyPlaceAddonNumbers.push(i);
	}*/
	
	//Disable all upgrade toggles
	allAddonNumbers.forEach(function ( addonNumber ) {
		$("#upgrade-" + addonNumber + "-cb").prop("disabled", true);
	});
	
	//Disable all MyPlace upgrade toggles
	/*allMyPlaceAddonNumbers.forEach(function ( addonNumber ) {
		$("#myplace-addon-" + addonNumber + "-cb").prop("disabled", true);
	});*/
	
	$("#incanda-cb").prop("disabled", true);
	$("#elk-cb").prop("disabled", true);
	/*$("#myPlace-cb").prop("disabled", true);*/
	/*$("#meridian-cb").prop("disabled", true);*/
	$("#bond-price-cb").prop("disabled", true);
	$("#viewGameNowBtn").hide();
	$("#viewGameNowBtn").on("click", function () {
		startGame();
	});
	
	if ( document.getElementById("unit-info-wrapper") !== null ) {
		$("#unit-info-wrapper").css("display", "none");
	}
	
});

$(".add-on-card").each( function ( index, elem ) {
	$(elem).on("click", function ( e ) {
		if ( e.target !== this ) {
			return;
		}
		var cbID = elem.id.replace("card", "cb");
		$("#" + cbID).click();
	});
});



/*$("#myPlace-cb").on("change", function () {
	if ( $(this).prop("checked") ) {
		//Enable all child MyPlace radios
		/*allMyPlaceAddonNumbers.forEach(function ( addonNumber ) {
			$("#myplace-addon-" + addonNumber + "-cb").prop("disabled", false);
		});*//*
	} else {
		//Disable and deselect all child MyPlace radios
		allMyPlaceAddonNumbers.forEach(function ( addonNumber ) {
			//If the toggle is selected, click it. This will uncheck it and remove the price from the total

			if ( $("#myplace-addon-" + addonNumber + "-cb").prop("checked") ) {
				myplaceAddonExternal = true;
				$("#myplace-addon-" + addonNumber + "-cb").click();
			}

			/*$("#myplace-addon-" + addonNumber + "-cb").prop("disabled", true);*//*
		});
	}
});*/

/*$("input[data-class='myplace-addon']").on("change", function () {
	myPlaceAddonSelected($(this));
});*/

$("#hero_rent_btn").on("click", function () {
	$("#w-tabs-2-data-w-tab-1").click()
});

$("a[data-upgrade-overlay-button='true']").on("click", function () {
	$("#upgrade-" + $(this).attr("data-upgrade-number") + "-cb").click();
});

$("a[data-unit-floor-plan-button='true']").click(function () {
	//console.log("input[data-unit-button='unitButton" + $(this).attr("data-unit-number") + "']");
	clickedFromFloorPlan = true;
	$("input[data-unit-button='unitButton" + $(this).attr("data-unit-number") + "']").click();
});

$("input[data-reservation-ref-input-field='true']").keyup(function () {
	
	switch ( $(this).attr("name") ) {
		case "First-Name":
			formFirstName = $(this).val();
			break;
		case "Last-Name":
			formLlastName = $(this).val();
			break;
	}
	
	buildPaymentRef($(this));
});

$("#finance-upgrades-cb").on("click", function () {
	if ( $(this).prop("checked") ) {
		$('.finance-upgrades-through-bond').each(function(i, obj) {
			$(obj).val("Yes");
		});
	} else {
		$('.finance-upgrades-through-bond').each(function(i, obj) {
			$(obj).val("No");
		});
	}
});

function buildPaymentRef ( field ) {
	//Build the payment reference number
	var refPrefix = "BW";
	var paymentReference = "";
	var firstName = formFirstName.replaceAll(" ", "").slice(0,1).toUpperCase();
	var lastName = formLlastName.replaceAll(" ", "").slice(0,10).toUpperCase();
	
	paymentReference = refPrefix + "-" + selectedUnitNo + "-" + firstName + lastName;
	
	$(".referenceNumberHiddenInput").each(function (i, obj) {
		$(obj).val(paymentReference);
	});
	$("#paymentReferenceDiv").html("Reference: " + paymentReference);
}

function isMobile () {
	
	var hasTouchScreen = false;
	
	if ("maxTouchPoints" in navigator) {
		hasTouchScreen = navigator.maxTouchPoints > 0;
	} else if ("msMaxTouchPoints" in navigator) {
		hasTouchScreen = navigator.msMaxTouchPoints > 0;
	} else {
		var mQ = window.matchMedia && matchMedia("(pointer:coarse)");
		if (mQ && mQ.media === "(pointer:coarse)") {
			hasTouchScreen = !!mQ.matches;
		} else if ('orientation' in window) {
			hasTouchScreen = true; // deprecated, but good fallback
		} else {
			// Only as a last resort, fall back to user agent sniffing
			var UA = navigator.userAgent;
			hasTouchScreen = (
				/\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
				/\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
			);
		}
	}
	
	return hasTouchScreen;
	
}

$("a[data-unit-floor-select-button='true']").mouseup(function () {
	if ( $("a[data-configurator-floor-number='" + $(this).attr("data-selection-floor-number") + "']").hasClass('w--current') == false ) {
		$("a[data-configurator-floor-number='" + $(this).attr("data-floor-number") + "']").click();
		event.preventDefault();
	}
	if ( $("a[data-selection-floor-number='" + $(this).attr("data-selection-floor-number") + "']").hasClass('w--current') == false ) {
		$("a[data-selection-floor-number='" + $(this).attr("data-floor-number") + "']").click();
		event.preventDefault();
	}
});

$("a[data-unit-selection-floor-select-button='true']").mouseup(function () {
	if ( $("a[data-configurator-floor-number='" + $(this).attr("data-selection-floor-number") + "']").hasClass('w--current') == false ) {
		$("a[data-configurator-floor-number='" + $(this).attr("data-selection-floor-number") + "']").click();
		event.preventDefault();
	}
});

$("input[data-floor-select-option='true']").change(function () {
	if ( !dontListenFloorChanged ) {
		floorOptionSelected = $(this).data("floor-select-slug");
	}
	floorTypeChanged($(this), false);
});

$("a[data-unit-configurator-floor-select-button='true']").mouseup(function ( e ) {
	if ( $("a[data-selection-floor-number='" + $(this).attr("data-configurator-floor-number") + "']").hasClass('w--current') == false ) {
		$("a[data-selection-floor-number='" + $(this).attr("data-configurator-floor-number") + "']").click();
		event.preventDefault();
	}
});

window.addEventListener("message", function ( e ) {
	
	//Jump to #virtual-tour
	//$( "#virtual-tour" ).scroll();
	/*$('html, body').stop().animate({
		'scrollTop': $( "#virtual-tour" ).offset().top
	});*/
	
	switch ( e.data ) {
		case "LuxOn":
			distanceFromTopBefore = document.documentElement.scrollTop;
			console.log("Before: ", distanceFromTopBefore);
			
			//Addon 1 was clicked in the game, but the addon is not turned on by the game. We turn the addon on with this line:
			document.getElementById("xrai-iframe").contentWindow.postMessage("LuxOn", "*");
			//Now I click the addon 1 button on the site if it hasn't already been activated
			if ( $("#upgrade-2-cb").prop("checked") == false ) {
				$("#upgrade-2-cb").click();
			}
			
			//Jump to game frame
			/*setTimeout(function () {
				distanceFromTopAfter = document.documentElement.scrollTop;
				distanceFromTopDifference = distanceFromTopAfter - distanceFromTopBefore;
				
				console.log("After: ", distanceFromTopAfter);
				
				console.log("Scroll to ", distanceFromTopAfter + distanceFromTopDifference);
				window.scrollTo(0, distanceFromTopAfter + distanceFromTopDifference);
				//document.getElementById('virtual-tour').scrollIntoView(true);
			}, 1000);*/
			
			break;
		case "LuxOff":
			document.getElementById("xrai-iframe").contentWindow.postMessage("LuxOff", "*");
			if ( $("#upgrade-2-cb").prop("checked") ) {
				$("#upgrade-2-cb").click();
			}
			
			//Jump to game frame
			/*setTimeout(function () {
				document.getElementById('virtual-tour').scrollIntoView(true);
			}, 400);*/
			
			break;
		case "loaded":
			setTimeout(function () {
				addonsSelected.forEach(function ( addonName ) {
					switch ( addonName ) {
						case "upgrade-2":
							document.getElementById("xrai-iframe").contentWindow.postMessage("LuxOn", "*");
							break;
					}
				});
				//hardcoded for this site. If concrete flooring option is selected, send floor
				if ( $("input[data-xrai-iframe-call='floor:On']").prop("checked") ) {
					document.getElementById("xrai-iframe").contentWindow.postMessage("floor:On", "*");
				} else if ($("input[data-xrai-iframe-call='floor:Off']").prop("checked") ) {
					document.getElementById("xrai-iframe").contentWindow.postMessage("floor:Off", "*");
				}
			}, 1000);
			
			break;
	}
});

/*window.FurniturePressed = function () {
	console.log("Furniture pressed inside game");
}

window.Upgrade = function () {
	console.log("Upgrade pressed inside game");
}*/

//Weird bug workaround... For some reason cache is storing the check state of checkboxes and after reloading, they're still checked...
$(document).ready(function () {
	
	$("input[data-addon-list-select-button='true']").each(function ( index, elem ) {
		$(elem).prop( "checked", false );
		$(elem).prop( "disabled", true );
	});
	//While we're here. Get the default background color for the addon list buttons. Then set them all to grey.
	defaultListAddonButtonColor = $("div[data-addon-list-select-button-wrapper='true']").css("background-color");
	defaultListAddonButtonTextColor = $("div[data-addon-list-select-button-text='true']").css("color");
	
	$("div[data-addon-list-select-button-wrapper='true']").each(function ( index, elem ) {
		$(elem).css("background-color", "#999");
	});
	
	$("div[data-addon-list-select-button-text='true'], span[data-addon-list-select-button-text='true']").each(function ( index, elem ) {
		$(elem).css("color", "#CCC");
	});
	
});

$("input[data-addon-list-check='true']").on("change", function () {
	
	var selectedListAddon = $(this);
	
	if ( $(this).is(":checked") ) {
		//Selected
		if ( addonListTotals[$(this).data("section")] === undefined ) {
			//Array key does not exist. Create it.
			addonListTotals[$(this).data("section")] = 0;
		}
		if ( selectedListAddons[$(this).data("section")] === undefined ) {
			selectedListAddons[$(this).data("section")] = [];
		}
		
		selectedListAddons[$(this).data('section')].push($(this).data('name'));
		
		addonListTotals[$(this).data("section")] += $(this).data("price");
		
		if ( $(this).data("addon-list-dependancy") !== "" ) {
			//This addon needs a parent to be selected first. If it hasn't been selected. Manually check it.
			if ( $("input[data-addon-list-slug='" + $(this).data('addon-list-dependancy') + "']").is(":checked") == false ) {
				$("input[data-addon-list-slug='" + $(this).data('addon-list-dependancy') + "']").click();
			}
		}
	} else {
		//De-selected
		if ( addonListTotals[$(this).data("section")] === undefined ) {
			//Array key does not exist. Create it.
			addonListTotals[$(this).data("section")] = 0;
		}
		if ( selectedListAddons[$(this).data("section")] === undefined ) {
			selectedListAddons[$(this).data("section")] = [];
		}
		
		let e = selectedListAddons[$(this).data('section')].indexOf($(this).data('name'));
		if ( e > -1 ) {
			selectedListAddons[$(this).data('section')].splice(e, 1);
		}
		
		$("input[data-addon-list-dependancy='" + $(this).data('addon-list-slug') + "']").each(function ( index, elem ) {
			if ( $(elem).is(":checked") ) {
				$(elem).click();
			}
		});
		addonListTotals[$(this).data("section")] -= $(this).data("price");
	}
	
	if ( selectedListAddons[selectedListAddon.data("section")].length > 0 ) {
		$("#cart-" + $(this).data('section-addon-slug') + "-wrap").css("display", "flex");
	} else {
		$("#cart-" + $(this).data('section-addon-slug') + "-wrap").css("display", "none");
	}
	
	$("div[data-addon-list-section='" + $(this).data("section-addon-slug") + "']").attr("data-section-price", addonListTotals[$(this).data("section")]);
	$("div[data-addon-list-section='" + $(this).data("section-addon-slug") + "']").html("R " + numberWithSpaces(addonListTotals[$(this).data("section")]));
	$("#cart-" + $(this).data("section-addon-slug") + "-price").html("R " + numberWithSpaces(addonListTotals[$(this).data("section")]));
	
	$("." + $(this).data("section-addon-slug") + "-hiddenInput").each(function (i, obj) {
		var selectedAddonsForSection = "";
		var seperator = "";
		if ( selectedListAddons[selectedListAddon.data("section")].length > 0 ) {
			selectedListAddons[selectedListAddon.data("section")].forEach(function (item, index, arr) {
				selectedAddonsForSection += seperator + item;
				seperator = ", ";
			});
		} else {
			selectedAddonsForSection = "None";
		}
		
		$(this).val(selectedAddonsForSection);
		
	});
	
	if ( ignoreSolarClick == false ) {
		if ( $(this).data("addon-list-group") != "" ) {
			$("input[data-addon-list-group='" + $(this).data("addon-list-group") + "']").each(function ( index, elem ) {
				if ( elem != selectedListAddon[0] ) {
					if ( $(elem).is(":checked") ) {
						ignoreSolarClick = true;
						elem.click();
						ignoreSolarClick = false;
					}
				}
			});
		}
	}
	
	unitCostValues["addon-list-" + $(this).data("section-addon-slug")] = addonListTotals[$(this).data("section")];
	updateTotalPrice();
});

$("#kitchen-upgrade-input").on("change", function () {
	
	if ( $(this).is(":checked") ) {
		//Selected
		$("#kitchen-upgrade-display-section-price").html("R " + numberWithSpaces($(this).attr("data-price")));
		$("#cart-kitchen-price").html("R " + numberWithSpaces($(this).attr("data-price")));
		$("#cart-kitchen-wrap").css("display", "flex");
		
		$(".kitchen-upgrade-hiddenInput").each(function (i, obj) {
			$(this).val("Yes");
		});
		
		unitCostValues["kitchen-upgrade-price"] = parseFloat($(this).attr("data-price"));
	} else {
		//De-selected
		$("#kitchen-upgrade-display-section-price").html("R " + numberWithSpaces(0.00));
		$("#cart-kitchen-price").html("R " + numberWithSpaces(0.00));
		$("#cart-kitchen-wrap").css("display", "none");
		
		$(".kitchen-upgrade-hiddenInput").each(function (i, obj) {
			$(this).val("No");
		});
		
		unitCostValues["kitchen-upgrade-price"] = 0;
	}
	
	updateTotalPrice();
});

$("input[data-total-contribute='true']").click(function () {
	switch ($(this).data("class")) {
		case "unit":
			
			if ( document.getElementById("unit-info-wrapper") !== null ) {
				$("#unit-info-wrapper").css("display", "flex");
			}
			
			if ( !clickedFromFloorPlan && isMobile() ) {
				//Jump to config-image
				if ( document.getElementById('config-image') !== null ) {
					$('html, body').animate({
						scrollTop: $("#config-image").offset().top
					}, 1000);
				}
			}
			
			oldselectedUnitXraiIframeLink = selectedUnitXraiIframeLink;
			selectedUnitXraiIframeLink = $(this).attr('data-xrai-iframe-link');
			
			//Select Floor 1 by default when unit changes
			
			dontListenFloorChanged = true;
			for ( var i = 1; i < numberOfFloors + 1; i++ ) {
				if ( floorOptionSelected != "floor-" + i ) {
					$("input[data-floor-select-slug='floor-" + i + "']").click();
				}
			}
			dontListenFloorChanged = false;
			
			//data-addon-list-select-button-wrapper="true"
			
			//kitchen-upgrade-input: data-price
			//kitchen-upgrade-image-url
			//kitchen-upgrade-display-price
			//kitchen-upgrade-display-section-price
			
			$("#kitchen-upgrade-input").attr("data-price", $(this).data("kitchen-upgrade-price"));
			$("#kitchen-upgrade-display-price").html("R " + numberWithSpaces($(this).data("kitchen-upgrade-price")));
			$("#kitchen-upgrade-image").attr("src", $(this).data("kitchen-upgrade-image-url")).attr("srcset", $(this).data("kitchen-upgrade-image-url")).fadeIn(0);
			if ( $("#kitchen-upgrade-input").is(":checked") ) {
				$("#kitchen-upgrade-input").click();
				$("#kitchen-upgrade-input").click();
			}
			
			//#kitchenUpgradePdfDownloadWrapper
			$("#kitchenUpgradePdfDownloadLink").attr("target", "_blank");
			$("#kitchenUpgradePdfDownloadWrapper").css("display", "block");
			$("#kitchenUpgradePdfDownloadLink").attr("href", $(this).attr('data-kitchen-upgrade-pdf-href'));
			
			$("input[data-addon-list-select-button='true']").each(function ( index, elem ) {
				$(elem).removeAttr("disabled");
			});
			
			$("div[data-addon-list-select-button-wrapper='true']").each(function ( index, elem ) {
				$(elem).attr("style", "");
			});
			
			$("div[data-addon-list-select-button-text='true'], span[data-addon-list-select-button-text='true']").each(function ( index, elem ) {
				$(elem).css("color", defaultListAddonButtonTextColor);
			});
			
			$(".select-unit-wrap").each(function ( index, elem ) {
				$(elem).css("display", "none");
			});
			
			$(".add-button-wrap").each(function ( index, elem ) {
				$(elem).css("display", "block");
			});
			
			//addon-more-info
			$("#addon-more-info").css("display", "block");
			
			
			$("#cart-unit-label").html($(this).data("unit-display-name"));
			$("#cart-unit-main-label").html($(this).data("unit-display-name"));
			
			//Floor price update
			for ( var i = 1; i < numberOfFloors + 1; i++ ) {
				$("input[data-floor-select-slug='floor-" + i + "']").attr("data-floor-select-price", $(this).data('unit-floor-' + i + '-price'));
				$("#floor-" + i + "-price-label").html(numberWithSpaces("R " + $(this).data('unit-floor-' + i + '-price')));
			}
			
			$("#addon-1-display-price").html($(this).data("unit-upgrade-1-display-price"));
			$("#addon-2-display-price").html($(this).data("unit-upgrade-2-display-price"));
			$("#addon-3-display-price").html($(this).data("unit-upgrade-3-display-price"));
			
			$("#addon-1-display-price-alt").html($(this).data("unit-upgrade-1-display-price"));
			$("#addon-2-display-price-alt").html($(this).data("unit-upgrade-2-display-price"));
			$("#addon-3-display-price-alt").html($(this).data("unit-upgrade-3-display-price"));
			
			
			if ( floorOptionSelected == "" ) {
				$("input[data-floor-select-slug='floor-1']").click();
			} else {
				$("input[data-floor-select-slug='" + floorOptionSelected + "']").click();
			}
			
			let flythroughVideoUrlmp4 = "https://assets-global.website-files.com/61110f294933f9d0faf6d77f/" + $(this).attr("data-unit-flythrough-url") + "-transcode.mp4";
			let flythroughVideoUrlwebm = "https://assets-global.website-files.com/61110f294933f9d0faf6d77f/" + $(this).attr("data-unit-flythrough-url") + "-transcode.webm";
			
			//data-unit-flythrough-url = {UT:BG Video ID}
			//*flythrough_poster_wrapper - set data-poster-url to https://assets-global.website-files.com/61110f294933f9d0faf6d77f/{UT:BG Video ID}-poster-00001.jpg
			//*flythrough_poster_wrapper - set data-video-urls to https://assets-global.website-files.com/61110f294933f9d0faf6d77f/{UT:BG Video ID}-transcode.mp4, https://assets-global.website-files.com/61110f294933f9d0faf6d77f/{UT:BG Video ID}-transcode.webm
			
			//*flythrough_video - Add video sources above
			//*flythrough_video - Set style to background-image:url('https://assets-global.website-files.com/61110f294933f9d0faf6d77f/{UT:BG Video ID}-poster-00001.jpg')
			
			//flythrough_poster_wrapper_fallback - Set src to https://assets-global.website-files.com/61110f294933f9d0faf6d77f/{UT:BG Video ID}-poster-00001.jpg
			
			$("#flythrough_poster_wrapper").attr("data-poster-url", "https://assets-global.website-files.com/61110f294933f9d0faf6d77f/" + $(this).attr("data-unit-flythrough-url") + "-poster-00001.jpg");
			$("#flythrough_poster_wrapper").attr("data-video-urls", "https://assets-global.website-files.com/61110f294933f9d0faf6d77f/" + $(this).attr("data-unit-flythrough-url") + "-transcode.mp4, https://assets-global.website-files.com/61110f294933f9d0faf6d77f/" + $(this).attr("data-unit-flythrough-url") + "-transcode.webm");
			
			var mp4source = document.createElement('source');
			mp4source.src = flythroughVideoUrlmp4;
			mp4source.type = "video/mp4";
			
			var webmsource = document.createElement('source');
			webmsource.src = flythroughVideoUrlwebm;
			webmsource.type = "video/webm";
			
			$("#flythrough_video").css("background-image", "url('https://assets-global.website-files.com/61110f294933f9d0faf6d77f/" + $(this).attr("data-unit-flythrough-url") + "-poster-00001.jpg");
			if ( document.getElementById("flythrough_poster_wrapper_fallback") !== null ) {
				document.getElementById("flythrough_poster_wrapper_fallback").src("https://assets-global.website-files.com/61110f294933f9d0faf6d77f/" + $(this).attr("data-unit-flythrough-url") + "-poster-00001.jpg");
			}
			
			if ( document.getElementById("flythrough_video") !== null ) {
				$("#flythrough_video").html("");
				document.getElementById("flythrough_video").pause();
				document.getElementById("flythrough_video").appendChild(mp4source);
				document.getElementById("flythrough_video").appendChild(webmsource);
				document.getElementById("flythrough_video").load();
				document.getElementById("flythrough_video").play();
			}
			
			/*$("input[data-floor-select-name='Floor 1']").attr("data-floor-select-price", $(this).data('unit-floor-1-price'));
			$("#floor-1-price-label").html(numberWithSpaces("R " + $(this).data('unit-floor-1-price')));
			$("input[data-floor-select-name='Floor 2']").attr("data-floor-select-price", $(this).data('unit-floor-2-price'));
			$("#floor-2-price-label").html(numberWithSpaces("R " + $(this).data('unit-floor-2-price')));
			$("input[data-floor-select-name='Floor 3']").attr("data-floor-select-price", $(this).data('unit-floor-3-price'));
			$("#floor-3-price-label").html(numberWithSpaces("R " + $(this).data('unit-floor-3-price')));*/
			
			//Find which floor is currently select. If none, select if Default is Y
			
			
			
			$(".furniture-info").css("display", "none");
			
			$("#appliance-info-wrapper").fadeIn(250);
			
			$("input[data-filter-unit-type-name='" + $(this).attr('data-unit-type-name') + "']").click();
			
			if ( selectedUnitXraiIframeLink != oldselectedUnitXraiIframeLink ) {
				$("#xrai-iframe").src = "";
				$("#3d-walkthrough-curtain").css("display", "flex");
				$("#3d-walkthrough-curtain").css("opacity", "1");
			}
			
			/*$("#unit-image").fadeOut(500);
			$("#unit-image").attr("src", $(this).data('base-image'));
			$("#unit-image").attr("srcset", $(this).data('base-image'));
			$("#unit-image").fadeIn(500);*/
			
			var unitRadio = $(this);
			$("#unit-image").fadeOut(0, function () {
				$(this).attr("src", unitRadio.data('base-image')).attr("srcset", unitRadio.data('base-image')).fadeIn(0);
			});
			
			$("#bond-price-cb").prop("disabled", false);
			$("#viewGameNowBtn").prop("disabled", false);
			/*$("#myPlace-cb").prop("disabled", false);*/
			/*$("#meridian-cb").prop("disabled", false);*/
			$("#viewGameNowBtn").html("View Now");
			$("#game-disabled-text").hide();
			$("#viewGameNowBtn").show();
			
			//$("#cart-container").css("display", "block");
			$("#cart-container").fadeIn(500);
			$("#cart-unit-price").html("R " + numberWithSpaces($(this).data("price")));
			
			unitIDInput.val($(this).data("unit-id"));
			unitCostValues.unit = $(this).data("price");
			
			$("#bond-price-cb").attr("data-price", $(this).data("bond-price"));
			/*$('#myPlace-cb').attr('data-price', $(this).data('myplace-price'));*/
			/*$('#meridian-cb').attr('data-price', $(this).data('meridian-upgrade-price'));*/
			$("#bond-price-label").html("R " + numberWithSpaces($(this).data("bond-price")));
			/*$("#myplace-price-label").html("R " + numberWithSpaces($(this).data('myplace-price')));*/
			/*$("#meridian-price-label").html("R " + numberWithSpaces($(this).data('meridian-upgrade-price')));*/
			
			//Enable all MyPlace addon checks
			/*allMyPlaceAddonNumbers.forEach(function ( addonNumber ) {
				$("#myplace-addon-" + addonNumber + "-cb").prop("disabled", false);
			});*/
			
			//Build array containing all addon numbers
			var addonCombinations = allAddonNumbers.flatMap((v, i) => allAddonNumbers.slice( i + 1 ).map( w => v + '-' + w ));
			allAddonNumbers.forEach(function ( addonNumber ) {
				//Images
				$("#upgrade-" + addonNumber + "-cb").attr("data-upgrade-image", unitRadio.attr("data-upgrade-" + addonNumber + "-image"));
				$("#upgrade-" + addonNumber + "-cb").attr("data-upgrade-all-image", unitRadio.attr("data-upgrade-all-image"));
				$("#upgrade-" + addonNumber + "-cb").attr("data-base-unit-image", unitRadio.attr("data-base-image"));
				addonCombinations.forEach(function ( addonCombo ) {
					$("#upgrade-" + addonNumber + "-cb").attr("data-upgrade-" + addonCombo + "-image", unitRadio.attr("data-upgrade-" + addonCombo + "-image"));
				});
				
				//Prices
				$("#upgrade-" + addonNumber + "-cb").attr("data-price", unitRadio.data("upgrade-" + addonNumber + "-price"));
				$("#upgrade-" + addonNumber + "-price-label").html("R " + numberWithSpaces(unitRadio.data("upgrade-" + addonNumber + "-price")));
				
				//Enable addon checkboxes
				$("#upgrade-" + addonNumber + "-cb").prop("disabled", false);
			});
			
			/*allMyPlaceAddonNumbers.forEach(function ( addonNumber ) {
				$("#myplace-addon-" + addonNumber + "-cb").attr("data-price", unitRadio.attr("data-myplace-addon-" + addonNumber + "-price"));
				$("#myplace-addon-" + addonNumber + "-price-label").html("R " + numberWithSpaces(unitRadio.attr("data-myplace-addon-" + addonNumber + "-price")));

				if ( $("#myplace-addon-" + addonNumber + "-cb").prop("checked") ) {
					//Add price of this addon to total myplace price
					myPlaceAddonSelected($("#myplace-addon-" + addonNumber + "-cb"));
				}

			});*/
			
			for (let i = 1; i < 100; i++) {
				if ($(".unit-" + i).length <= 0) {
					break;
				}
				$(".unit-" + i).css("display", "none");
			}
			
			$(".unit-" + $(this).data("unit-number")).fadeIn(500);
			
			unitCostValues.addOn = 0;
			addonsSelected.forEach(function (item, index, arr) {
				addOnSelected($("input[data-image-class-name='" + item + "']"));
			});
			
			additionalAddonsSelected.forEach(function (item, index, arr) {
				addOnSelected($("input[data-image-class-name='" + item + "']"));
			});
			
			selectedUnitNo = $(this).data("unit-number");
			selectedUnitID = $(this).data("unit-id");
			selectedreservationNumber = $(this).data("reservation-number");
			selectedUnitPrice = $(this).data('price');
			
			buildPaymentRef();
			
			$(".unitIDInput").each(function (i, obj) {
				$(obj).val(selectedUnitID);
			});
			
			$(".unitNameNumberHiddenInput").each(function (i, obj) {
				$(obj).val(selectedUnitNo);
			});
			
			$(".unitCostHiddenInput").each(function (i, obj) {
				$(obj).val("R " + numberWithSpaces(selectedUnitPrice));
			});
			
			$(".reservationNumberHiddenInput").each(function (i, obj) {
				$(obj).val(selectedreservationNumber)
			});
			
			if ( clickedFromFloorPlan ) {
				clickedFromFloorPlan = false;
			}
			
			break;
		case "add-on":
			addOnSelected($(this));
			break;
	}
	updateTotalPrice();
});

function updateTotalPrice () {
	totalUnitCost = 0;
	for (const key in unitCostValues) {
		var price = unitCostValues[key];
		var type = key;
		totalUnitCost += price;
	}
	
	totalUnitCostDiv.each(function (i, obj) {
		$(obj).html("R " + numberWithSpaces(totalUnitCost));
	});
	totalCostHiddenInput.val("R " + numberWithSpaces(totalUnitCost));
	
	$(".totalCostHiddenInput").each(function (i, obj) {
		$(obj).val("R " + numberWithSpaces(totalUnitCost));
	});
}

/*function myPlaceAddonSelected ( myPlaceAddonInput ) {

	//If main MyPlace addon is not selected -- select it
	if ( $("#myPlace-cb").prop("checked") == false ) {
		$("#myPlace-cb").click();
	}

	var myPlaceAddonNumber = myPlaceAddonInput.attr("data-myplace-addon-number");
	var myPlaceCurrentPrice = parseFloat($("#myPlace-cb").attr("data-price"));
	var newPrice = 0;

	if ( $(myPlaceAddonInput).prop("checked") ) {
		//Add to add to myplace price
		newPrice = myPlaceCurrentPrice + parseFloat($(myPlaceAddonInput).attr("data-price"));
		$(".myPlaceUpgradeAddon" + myPlaceAddonNumber + "HiddenInput").val("Yes");
	} else {
		//Remove from myplace price
		newPrice = myPlaceCurrentPrice - parseFloat($(myPlaceAddonInput).attr("data-price"));
		$(".myPlaceUpgradeAddon" + myPlaceAddonNumber + "HiddenInput").val("No");
	}

	$("#myplace-price-label").html("R " + numberWithSpaces(newPrice));
	$("#myPlace-cb").attr("data-price", newPrice);

	if ( !myplaceAddonExternal ) {
		addOnSelected($("#myPlace-cb"));
		unitCostValues.addOn -= parseFloat(myPlaceCurrentPrice);
	}

	updateTotalPrice();

	if ( myplaceAddonExternal ) {
		myplaceAddonExternal = false;
	}

}*/

function floorTypeChanged ( floorTypeElem, onLoad ) {
	$("#flooring-image").css({"background-image":"url('" + $(floorTypeElem).attr("data-floor-select-image-source") + "')"});
	//Update the cart if the floor option plan price is higher than 0.00
	var floorOptionPrice = $(floorTypeElem).attr('data-floor-select-price');
	var floorOptionName = $(floorTypeElem).attr('data-floor-select-name') + " Floor";
	
	$(".floorTypeHiddenInput").val(floorOptionName);
	
	if ( floorOptionPrice > 0 ) {
		$("#cart-floor-wrap").css("display", "flex");
		$("#cart-floor-label").html(floorOptionName);
		$("#cart-floor-price").html("R " + numberWithSpaces(floorOptionPrice));
	} else {
		$("#cart-floor-wrap").css("display", "none");
		$("#cart-floor-label").html("");
		$("#cart-floor-price").html("R " + numberWithSpaces(0));
	}
	
	if ( $(floorTypeElem).attr("data-xrai-iframe-call") !== "" ) {
		document.getElementById("xrai-iframe").contentWindow.postMessage($(floorTypeElem).attr("data-xrai-iframe-call"), "*");
	}
	
	//Add this to the total unit cost
	unitCostValues.floorPrice = parseFloat(floorOptionPrice);
	if ( !onLoad ) {
		updateTotalPrice();
	}
}

function numberWithSpaces(n) {
	var r = n.toString().split(".");
	return (r[0] = r[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")), r.join(".");
}

function addOnSelected ( addonCheck ) {
	if ( addonCheck.prop("checked") ) {
		
		if ( addonCheck.attr("id") == "upgrade-2-cb" ) {
			//Set furn-list opacity to 1
			$("#furn-list").css("opacity", 1);
			$("#furn-list-text").css("display", "none");
		}
		
		unitCostValues.addOn += parseInt(addonCheck.attr("data-price"));
		$("." + addonCheck.data("image-class-name") + "UpgradeHiddenInput").each(function (a, e) {
			$(e).val("Yes");
		});
		
		console.log("#cart-" + addonCheck.data("image-class-name") + "-wrap");
		
		$("#cart-" + addonCheck.data("image-class-name") + "-wrap").css("display", "flex");
		$("#cart-" + addonCheck.data("image-class-name") + "-price").html("R " + numberWithSpaces(addonCheck.attr("data-price")));
		
		if ( addonCheck.data("addon-counter") ) {
			if ( addonsSelected.indexOf(addonCheck.data("image-class-name")) < 0 ) {
				addonsSelected.push(addonCheck.data("image-class-name"));
			}
			
			addonsSelected.sort();
			
			//Update unit image
			/*if ( addonsSelected.indexOf(addonCheck.data("image-class-name")) < 0 ) {
				addonsSelected.push(addonCheck.data("image-class-name"));
			}*/
			
			//let addonImageSelector = addonCheck.data("image-class-name");
			if ( addonsSelected.length == totalNumberOfAddons ) {
				//addonImageSelector = "both";
				//Both addons selected
				$("#unit-image").attr("src", addonCheck.attr('data-upgrade-all-image'));
				$("#unit-image").attr("srcset", addonCheck.attr('data-upgrade-all-image'));
			} else {
				if ( addonsSelected.length == 1 ) {
					$("#unit-image").attr("src", addonCheck.attr('data-upgrade-image'));
					$("#unit-image").attr("srcset", addonCheck.attr('data-upgrade-image'));
				} else {
					//Build the attribute identifier for the selected combination of addons
					var addonImageName = 'data-upgrade-'; //data-upgrade-2-3-image
					addonsSelected.forEach( function ( addon ) {
						var addonNo = addon.replace('upgrade-', '');
						addonImageName += addonNo + '-';
					});
					addonImageName += 'image';
					$("#unit-image").attr("src", addonCheck.attr(addonImageName));
					$("#unit-image").attr("srcset", addonCheck.attr(addonImageName));
				}
			}
			
			$("."+ addonCheck.attr("data-image-class-name") +"HiddenInput").each(function (i, obj) {
				$(obj).val("Yes");
			});
			
			switch ( addonCheck.attr("data-image-class-name") ) {
				case "upgrade-2":
					//Appliance upgrade selected - De-select Appliance basic
					if ( $("#appliance-basic-cb").prop("checked") == true ) {
						$("#appliance-basic-cb").click();
					}
					document.getElementById("xrai-iframe").contentWindow.postMessage("LuxOn", "*");
					break;
			}
			if ( gameLoaded ) {
				//Add addon switch here
			}
		} else {
			if ( additionalAddonsSelected.indexOf(addonCheck.data("image-class-name")) < 0 ) {
				additionalAddonsSelected.push(addonCheck.data("image-class-name"));
			}
		}
	} else {
		
		if ( addonCheck.attr("id") == "upgrade-2-cb" ) {
			//Set furn-list opacity to 1
			$("#furn-list").css("opacity", .5);
			$("#furn-list-text").css("display", "flex");
		}
		
		unitCostValues.addOn -= parseInt(addonCheck.attr("data-price"));
		$("." + addonCheck.data("image-class-name") + "UpgradeHiddenInput").each(function (a, e) {
			$(e).val("No");
		});
		console.log("#cart-" + addonCheck.data("image-class-name") + "-wrap");
		$("#cart-" + addonCheck.data("image-class-name") + "-wrap").css("display", "none");
		$("#cart-" + addonCheck.data("image-class-name") + "-price").html("R " + numberWithSpaces(0));
		if ( addonCheck.data("addon-counter") ) {
			let e = addonsSelected.indexOf(addonCheck.data("image-class-name"));
			if ( e > -1 ) {
				addonsSelected.splice(e, 1);
			}
			
			addonsSelected.sort();
			
			//Update unit image
			if ( addonsSelected.length > 0 ) {
				if ( addonsSelected.length == totalNumberOfAddons ) {
					//addonImageSelector = "both";
					//Both addons selected
					$("#unit-image").attr("src", addonCheck.attr('data-upgrade-all-image'));
					$("#unit-image").attr("srcset", addonCheck.attr('data-upgrade-all-image'));
				} else {
					if ( addonsSelected.length == 1 ) {
						$("#unit-image").attr("src", $("#" + addonsSelected[0] + "-cb").attr('data-upgrade-image'));
						$("#unit-image").attr("srcset", $("#" + addonsSelected[0] + "-cb").attr('data-upgrade-image'));
					} else {
						//Build the attribute identifier for the selected combination of addons
						var addonImageName = 'data-upgrade-'; //data-upgrade-2-3-image
						addonsSelected.forEach(function ( addon ) {
							var addonNo = addon.replace('upgrade-', '');
							addonImageName += addonNo + '-';
						});
						addonImageName += 'image';
						$("#unit-image").attr("src", addonCheck.attr(addonImageName));
						$("#unit-image").attr("srcset", addonCheck.attr(addonImageName));
					}
				}
			} else {
				//Show bare unit image
				$("#unit-image").attr("src", addonCheck.attr('data-base-unit-image'));
				$("#unit-image").attr("srcset", addonCheck.attr('data-base-unit-image'));
			}
			
			$("."+ addonCheck.attr("data-image-class-name") +"HiddenInput").each(function (i, obj) {
				$(obj).val("No");
			});
			
			switch ( addonCheck.attr("data-image-class-name") ) {
				case "upgrade-2":
					if ( $("#appliance-basic-cb").prop("checked") == false ) {
						$("#appliance-basic-cb").click();
					}
					document.getElementById("xrai-iframe").contentWindow.postMessage("LuxOff", "*");
					break;
			}
			
			if ( gameLoaded ) {
				//Add addon switch here
			}
		} else {
			let e = additionalAddonsSelected.indexOf(addonCheck.data("image-class-name"));
			if ( e > -1 ) {
				additionalAddonsSelected.splice(e, 1);
			}
		}
	}
	
	/*setTimeout(function () {
		console.log("Set offset");
		var viewportOffsetBefore = document.getElementById("virtual-tour").getBoundingClientRect();
		document.getElementById("virtual-tour").offsetTop = viewportOffsetBefore.top;
	}, 3000);*/
}

/*function addOnSelected_old ( a ) {
	if (1 == a.prop("checked"))
		if (
			((unitCostValues.addOn += parseInt(a.attr("data-price"))),
			$("." + a.data("image-class-name") + "UpgradeHiddenInput").each(function (a, e) {
				$(e).val("Yes");
			}),
			$("#cart-" + a.data("image-class-name") + "-wrap").css("display", "flex"),
			$("#cart-" + a.data("image-class-name") + "-price").html("R " + numberWithSpaces(a.attr("data-price"))),
			a.data("addon-counter"))
		) {
			addonsSelected.indexOf(a.data("image-class-name")) < 0 && addonsSelected.push(a.data("image-class-name"));
			let e = a.data("image-class-name");
			if (
				(addonsSelected.length == totalNumberOfAddons && (e = "both"),
				$("." + e).each(function (a, e) {
					$(e).fadeIn(500);
				}),
				gameLoaded)
			)
				switch (a.data("image-class-name")) {
					case "incanda":
						unityGame.SendMessage("JavaScriptHook", "TurnIncandaOn");
						break;
					case "elk":
						unityGame.SendMessage("JavaScriptHook", "LuxuryMode");
				}
		} else additionalAddonsSelected.indexOf(a.data("image-class-name")) < 0 && additionalAddonsSelected.push(a.data("image-class-name"));
	else if (
		((unitCostValues.addOn -= parseInt(a.attr("data-price"))),
		$("." + a.data("image-class-name") + "UpgradeHiddenInput").each(function (a, e) {
			$(e).val("No");
		}),
		$("#cart-" + a.data("image-class-name") + "-wrap").css("display", "none"),
		$("#cart-" + a.data("image-class-name") + "-price").html("R " + numberWithSpaces(0)),
		a.data("addon-counter"))
	) {
		let e = addonsSelected.indexOf(a.data("image-class-name"));
		if (
			(e > -1 && addonsSelected.splice(e, 1),
			addonsSelected.forEach(function (a, e, d) {
				$("." + a).css("display", "block");
			}),
			$(".both").each(function (a, e) {
				$(e).css("display", "none");
			}),
			$("." + a.data("image-class-name")).each(function (a, e) {
				$(e).fadeOut(500);
			}),
			gameLoaded)
		)
			switch (a.data("image-class-name")) {
				case "incanda":
					unityGame.SendMessage("JavaScriptHook", "TurnIncandaOff");
					break;
				case "elk":
					unityGame.SendMessage("JavaScriptHook", "BasicMode");
			}
	} else {
		let e = additionalAddonsSelected.indexOf(a.data("image-class-name"));
		e > -1 && additionalAddonsSelected.splice(e, 1);
	}
}*/

function startGame () {
	document.getElementById("xrai-iframe").src = selectedUnitXraiIframeLink;
}

/*function startGame() {
	var e = "https://www.xrai.co.za/thewaterkloof/1.0.0/Build",
		t = {
			dataUrl: e + "/1.0.0.data.unityweb",
			frameworkUrl: e + "/1.0.0.framework.js.unityweb",
			codeUrl: e + "/1.0.0.wasm.unityweb",
			streamingAssetsUrl: "StreamingAssets",
			companyName: "XRai",
			productName: "XRai ERIDANUS",
			productVersion: "1.0.0",
		},
		a = document.querySelector("#unity-container"),
		n = document.querySelector("#unity-canvas"),
		i = document.querySelector("#unity-loading-bar"),
		o = document.querySelector("#unity-progress-bar-full"),
		r = document.querySelector("#unity-fullscreen-button"),
		c = document.querySelector("#unity-mobile-warning"),
		s = !1;
	/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
		? ((a.className = "unity-mobile"),
			(t.devicePixelRatio = 1),
			(c.style.display = "block"),
			(s = true),
			setTimeout(() => {
				c.style.display = "none";
			}, 5e3))
		: ((n.style.width = "960px"), (n.style.height = "600px")),
		(i.style.display = "block");
	var l = document.createElement("script");
	(l.src = "https://www.xrai.co.za/heartfelt/unit_4/Build/4.0.5.loader.js"),
		(l.onload = () => {
			createUnityInstance(n, t, (e) => {
				o.style.width = 100 * e + "%";
			})
				.then((e) => {
					(unityGame = e),
					1 == s && unityGame.SendMessage("JavaScriptHook", "MobileController"),
						(i.style.display = "none"),
						(r.onclick = () => {
							e.SetFullscreen(1);
						}),
						n.addEventListener("click", () => {
							unityGame.SendMessage("JavaScriptHook", "ClickInsideCanvas");
						});
					var t = n;
					document.addEventListener("click", function (e) {
						t.contains(e.target) || unityGame.SendMessage("JavaScriptHook", "ClickOutsideCanvas");
					}),
						setTimeout(function () {
							addonsSelected.forEach(function (e, t, a) {
								switch (e) {
									case "incanda":
										unityGame.SendMessage("JavaScriptHook", "TurnIncandaOn");
										break;
									case "elk":
										unityGame.SendMessage("JavaScriptHook", "LuxuryMode");
								}
							});
						}, 1e3),
						(gameLoaded = true);
				})
				.catch((e) => {
					alert(e);
				});
		}),
		document.body.appendChild(l);
}*/

function unity_BtnClick(name, state) {
	/*console.log("Unity toggle", name, state);
	switch (name) {
		case "Incanda":
			$("#incanda-cb").click();
			break;
		case "Luxury":
			$("#elk-cb").click();
			break;
	}*/
}

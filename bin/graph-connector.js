//by clicking in the add  contact button show the fancybox
$('#add_contact_button').click(function () {
	$.fancybox({
		type: 'inline',
		content: jQuery('##add_contact_button').html()
	});
});

$(document).ready(function () {

	$("#add_contact_button").fancybox({
		'transitionIn': 'fade',
		'transitionOut': 'fade',
		'speedIn': 600,
		'speedOut': 200,
		'onClosed': function () {
		}
	});

	$("#add_contact").bind("submit", function () {
		$.fancybox.showLoading();
		//by clicking in the submit button send a request....
		let fname = $("#fname");
		let lname = $("#lname");
		let guid = $("#guid");

		allFields = $([]).add(fname).add(lname).add(guid),
			tips = $(".validateTips");
		function updateTips(t) {
			tips.text(t).addClass("ui-state-highlight");
			setTimeout(function () {
				tips.removeClass("ui-state-highlight", 1500);
			}, 500);
		}


		let valid = true;
		valid = valid && checkLength(fname, "firstname", 1, 20);
		valid = valid && checkLength(lname, "lastlname", 1, 20);
		valid = valid && checkLength(guid, "guid", 8, 45);
		valid = valid && checkRegexp(fname, /^[a-zA-Z]*$/, "firstname can consist of a-z only");
		valid = valid && checkRegexp(lname, /^[a-zA-Z]*$/, "lastname can consist of a-z only");

		function checkLength(o, n, min, max) {
			if (o.val().length > max || o.val().length < min) {
				o.addClass("ui-state-error");
				updateTips("Length of " + n + " must be between " +
					min + " and " + max + ".");
				return false;
			} else {
				return true;
			}
		}

		function checkRegexp(o, regexp, n) {
			if (!(regexp.test(o.val()))) {
				o.addClass("ui-state-error");
				updateTips(n);
				return false;
			} else {
				return true;
			}
		}

		if (valid) {

			let checkPromise22 = new Promise(
				function (resolve, reject) {
					resolve(window.runtime.runtime.addContact(guid.val(), fname.val(), lname.val()));
				});

			checkPromise22.then(
				function (success) {
					console.log(success);
					if (success) {

						$("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:black;" class="label label-success"> *User \"' + fname.val() + '\" is added</span>');

						getAllContacts();

						$.fancybox({
							type: "html",
							content: "<p class=" + "title0" + "> contact was successfully added </p>"
						});

					} else {
						$.fancybox({
							type: "html",
							content: "<p class=" + "title0" + "> contact was Not added </p>"
						});
					}
				});
		} else {
			$.fancybox.hideLoading();
			$(".add_contact").trigger("click");
		}

		return false;
	});

});


//creating friendlist for GraphConnector array, no local array
function createFriendListGC(obj1, index) {
	sortFriendsGC(obj1);
	//obj = obj1;
	if (obj1.length !== 0) {
		let table = '<table class="table table-hover" id="mytable">';
		let i = index;
		$.each(obj1, function () {
			if(obj1._guid = ownerguid) {
				table += '<tr><td><button type="button" class="btn btn-primary btn-lg btn-block" data-toggle="button" aria-pressed="false" autocomplete="off" id="button' + i + '" onclick=detailsOwner()><b>' + this['_firstName'] + '\t' + this['_lastName'] + '</b></button></td></tr>';
			} else {
				table += '<tr><td><button type="button" class="btn btn-primary btn-lg btn-block" data-toggle="button" aria-pressed="false" autocomplete="off" id="button' + i + '" onclick=details(' + i + ')><b>' + this['_firstName'] + '\t' + this['_lastName'] + '</b></button></td></tr>';
			}
			i++;
		});
		table += '</table>';
		$("#left-div").html(table);
	} else {
		if (obj.length != 0) {
			$("#left-div").html("<br><br><br><h3 align='center' style='color:red;'><b>\"No contact found, please try with other keyword\"</b></h4> ");
		} else {
			$("#left-div").html("<br><br><br><h3 align='center' style='color:red;'><b>\"No contacts in the imported file, please upload another file\"</b></h4> ");
		}
	}
}
//sorting for GraphConnector array, no local array
function sortFriendsGC(obj) {
	obj.sort(function (a, b) {
		if (a._firstName.toLowerCase() < b._firstName.toLowerCase())
			return -1;
		if (a._firstName.toLowerCase() > b._firstName.toLowerCase())
			return 1;
		return 0;
	});
}


//by clicking in the add button show the fancybox
$('#set_defaults').click(function () {
	$.fancybox({
		type: 'inline',
		content: jQuery('#set_defaults').html()
	});
});

$(document).ready(function () {

	$("#set_defaults").fancybox({
		'transitionIn': 'fade',
		'transitionOut': 'fade',
		'speedIn': 600,
		'speedOut': 200,
		'onClosed': function () {
		}
	});

	$("#set_defaults_form").bind("submit", function () {
		$.fancybox.showLoading();
		//by clicking in the submit button send a request....
		let data = $(this).serializeArray();
		let voice = data[0]["value"];
		let chat = data[1]["value"];
		let video = data[2]["value"];

		window.runtime.runtime.setDefaults(voice, chat, video);

		get_owner_information();
		$.fancybox({
			type: "html",
			content: "<p class=" + "title0" + "> Defaults  successfully Added </p>"
		});

		return false;
	});
});

//by clicking in the add button show the fancybox
$('#query_global_registry_button').click(function () {
	console.log(" 11111 queryGlobalRegistry");
	$.fancybox({
		type: 'inline',
		content: jQuery('#query_global_registry_button').html()
	});
});

$(document).ready(function () {

	$("#query_global_registry_button").fancybox({
		'transitionIn': 'fade',
		'transitionOut': 'fade',
		'speedIn': 600,
		'speedOut': 200,
		'onClosed': function () {
		}
	});

	$("#query_global_registry_form").bind("submit", function () {
		$.fancybox.showLoading();
		//by clicking in the submit button send a request....
		let data = $(this).serializeArray();
		let guid = data[0]["value"];
		console.log(" queryGlobalRegistry");

		var p1 = new Promise(
			function (resolve, reject) {
				resolve(window.runtime.runtime.queryGlobalRegistry(guid));
			});

		p1.then(
			function (result) {
				if (result === 'GUID not found') {
					$.fancybox({
						type: "html",
						content: "No such contact with this GUID"
					});

				} else {
					console.log("result of queryGlobalRegistry");
					console.log(result);
					if (guid == ownerguid) {
						contentHTML = "<p class=" + "title0" + "><h3><span class='glyphicon glyphicon-user' aria-hidden='true'></span> This is your account with " + "</h3> <br>  GUID: <b>\"" + result._guid + "\"</b> <br> <h3>You have User IDs:</h3>";
						for (var i = 0; i < result._userIDs.length; i++) {
							contentHTML += "<br><span class='glyphicon glyphicon-tags' aria-hidden='true'></span><b>" + result._userIDs[i].uid + " " + result._userIDs[i].domain + "</b><br>";
						}
						contentHTML += "</p>";
					} else {
						contentHTML = "<p class=" + "title0" + "><h3><span class='glyphicon glyphicon-user' aria-hidden='true'></span> Found details of contact: " + "</h3> <br>  GUID: <b>\"" + result._guid + "\"</b> <br> <h3>User IDs found:</h3>";
						for (var i = 0; i < result._userIDs.length; i++) {
							contentHTML += "<br><span class='glyphicon glyphicon-tags' aria-hidden='true'></span><b>" + result._userIDs[i].uid + " " + result._userIDs[i].domain + "</b><br>";
						}
						contentHTML += "</p>";
						checkGUIDRuntime(result._guid);
					}

					console.info(obj);
					$.fancybox({
						type: "html",
						content: contentHTML
					});
				}

			});

		return false;
	});

});

function get_owner_information() {

	let result = window.runtime.runtime.getOwner();

	console.log(result);
	if (result == null) {
		return "NO such GUID";

	} else {
		globalOwnerDetails = result;
		let html = "<table class='table table-hover'><tr>" +
			"<td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'> Firstname : </span></b></td>" +
			"<td> " + result._firstName + " </td>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'>Lastname : </span> </b></td>" +
			"<td>" + result._lastName + "</td>" +
			"</tr>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;' > GUID : </span> </b></td>" +
			"<td>" + result._guid + "</td>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'> User IDs : </span> </b></td><td>";

		for (let i = 0; i < result._userIDs.length; i++) {

			html = html + "<div><span style='font-family:Arial;font-size:14px;font-weight:bold;color:black;'>Uid:</span>" + result._userIDs[i].uid +
				"<span style='font-family:Arial;font-size:14px;font-weight:bold;color:black;'> Domain:</span>" + result._userIDs[i].domain + "</div>";
		}

		html = html + "</td></tr>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;' > Defaults: </span> </b></td>" +
			"<td><div><span style='font-family:Arial;font-size:14px;font-weight:bold;color:black;'>voice:</span>" + result._defaults.voice + "</div>" +
			"<div><span style='font-family:Arial;font-size:14px;font-weight:bold;color:black;'>chat:</span>" + result._defaults.chat + "</div>" +
			"<div><span style='font-family:Arial;font-size:14px;font-weight:bold;color:black;'>video:</span>" + result._defaults.video + "</div>" +
			"</td>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'> LastSyncBloomFilter1Hop : </span> </b></td>" +
			"<td>" + result._lastSyncBloomFilter1Hop + "</td>" +
			"</tr>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'> LastSyncDomainUserIDs : </span> </b></td>" +
			"<td>" + result._lastSyncDomainUserIDs + "</td>" +
			"</tr>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'> Groups : </span> </b></td>" +
			"<td>" + result._groups + "</td>" +
			"</tr>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'> LastCalculationBloomFilter1Hop : </span> </b></td>" +
			"<td>" + result.lastCalculationBloomFilter1Hop + "</td>" +
			"</tr>";

		html = html + "</tr><tr><td colspan=3 align='middle'><button class='btn btn-success' onclick = send_global_registry_record()><span class='glyphicon glyphicon-send'><b> send Global Registry Record</b></span></button></td></tr>" +
			"</table>";

		$.fancybox({
			type: "html",
			content: html
		});
	}

}


function update_owner_information() {
	let result = window.runtime.runtime.getOwner();

	if (result == null) {
		return "NO such GUID";
	} else {
		globalOwnerDetails = result;
		ownerguid = result._guid;
	}


}

function send_global_registry_record() {
	if (typeof window.runtime.runtime.getOwner()._guid == "string") {
			window.runtime.runtime.setDefaults(0,0,0);
			$.fancybox.close();
			let result = window.runtime.runtime.signGlobalRegistryRecord();

			if (result == null) {
				return "NO such GUID";

			} else {
				console.log(result);

				let checkPromise = new Promise(
					function (resolve, reject) {
						resolve(window.runtime.runtime.sendGlobalRegistryRecord(result));
					});

				checkPromise.then(
					function (result) {
						console.log("send #########");
						console.log(result)
						console.log("send #########");
						if (result == 200) {
							ownerguid = globalOwnerDetails._guid;
							$.fancybox({
								type: "html",
								content: "<p class=" + "title0" + ">  Global Registry Record successfully sent </p>"
							});
						} else {
							$.fancybox({
								type: "html",
								content: "<p class=" + "title0" + ">  Error code: " + result + "  </p>"
							});
						}
					});
			}
}	else {
				$.fancybox({
					type: "html",
					content: "<p class=" + "title0" + ">  Please generate a valid GUID first!  </p>"
				});
			}
}


function checkGUIDRuntime(guid) {


	let checkPromise = new Promise(
		function (resolve, reject) {
			resolve(window.runtime.runtime.checkGUID(guid));
		});

	checkPromise.then(
		function (foundContacts) {

			console.info(foundContacts);
			let DirectContact = foundContacts[0];
			let FoF = foundContacts[1];

			if (DirectContact.length !== 0 || FoF.length !== 0) {
				console.log('FoF : ' + FoF);
				console.log(' DirectContact : ' + DirectContact);
				if (FoF.length !== 0) {
					console.log('AddressBook Log: Found Mutual Friend');
					console.info(FoF);
					contentHTML += "<br><h3><span class='glyphicon glyphicon-star' aria-hidden='true'></span> Found Mutual Contact: <b><u>\"" + FoF[0]._firstName + "\"</u> with GUID: <u>\"" + FoF[0]._guid + "\"</u></b></h3><br>";
				} else if (DirectContact.length !== 0) {
					console.log('AddressBook Log: Found Direct Friend');
					console.info(DirectContact);
					contentHTML += "<br><h3><span class='glyphicon glyphicon-star' aria-hidden='true'></span> Already In Contacts As: <b><u>\"" + DirectContact[0]._firstName + "\"</u> with GUID: <u>\"" + DirectContact[0]._guid + "\"</u></b></h3><br>";
				} else {
					console.log('AddressBook Log: No direct or mutual Friend');
					contentHTML += "<br><h3><span class='glyphicon glyphicon-remove-sign' aria-hidden='true'></span><b> Not in Direct Contacts and no mutual friend found </b></h3><br> ";
					contentHTML += "<div><button class='btn bn-info' id='add_contact_button' href='#add_contact' style='height:30px; color:white; width:170px'>Add as a contact</button></div>";
					document.getElementById("guid").value=guid;
				}
				$.fancybox({
					type: "html",
					content: contentHTML
				});
			} else {
				console.log('User with no contacts \n GUID: ' + guid)
				contentHTML += "<br><h3><span class='glyphicon glyphicon-remove-sign' aria-hidden='true'></span><b> Not in Direct Contacts and no mutual friend found </b></h3><br> ";
				contentHTML += "<div><button class='btn bn-info' id='add_contact_button' href='#add_contact' style='height:30px; color:white; width:170px'>Add as a contact</button></div>";
				document.getElementById("guid").value=guid;
				$.fancybox({
					type: "html",
					content: contentHTML
				});
			}
		});

}

/**
 * Created by Senan Sharhan on 17.10.2016.
 */

//by clicking in the add "add user id " button show the fancybox
$('#add_user_id').click(function () {
	$.fancybox({
		type: 'inline',
		content: jQuery('#add_user_id').html()
	});
});

$(document).ready(function () {

	$("#add_user_id").fancybox({
		'transitionIn': 'fade',
		'transitionOut': 'fade',
		'speedIn': 600,
		'speedOut': 200,
		'onClosed': function () {
		}
	});

	$("#add_user_id_form").bind("submit", function () {
		$.fancybox.showLoading();
		//by clicking in the submit button send a request....
		let data = $(this).serializeArray();
		let uid = data[0]["value"];
		let domain = data[1]["value"];

		window.runtime.runtime.addUserID(uid, domain);
		//update the owner information
		update_owner_information();
		$.fancybox({
			type: "html",
			content: "<p class=" + "title0" + "> User ID successfully Added </p>"
		});

		return false;
	});
});


//Removing userID of the owner
function remove_user_id() {
	console.info(globalOwnerDetails);
	let ownerUserIDs;
	if (typeof globalOwnerDetails === 'undefined' || globalOwnerDetails === null) {
		let html = "<table class='table table-hover'><tr>" +
			"<td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'> No UserIDs available </span></b></td></tr>";
		$.fancybox({
			autoScale: true,
			openEffect: 'fade',
			type: "html",
			content: html
		});
		return;
	} else {
		ownerUserIDs = globalOwnerDetails._userIDs;
	}
	if (typeof ownerUserIDs === 'undefined' || ownerUserIDs === null || ownerUserIDs.length === 0) {
		var html = "<table class='table table-hover'><tr>" +
			"<td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'> No UserIDs available </span></b></td></tr>";
	} else {
		var html = "<h3>User Ids are:</h3><br>";
		html += '<form name="removeForm" >';
		for (let i = 0; i < ownerUserIDs.length; i++) {
			html += '<div class="radio"><input type="radio" name="userIDsBtn" /></div>';
			html += '<div class="radio"><label style="font-size:18px"><input type="radio" style="all:unset;" onClick="enableRemoveUserIDBtn()" name="userIDsBtn" value=' + ownerUserIDs[i].uid + ',' + ownerUserIDs[i].domain + '><u><b>Uid: </b></u>' + ownerUserIDs[i].uid + ' <u><b>Domain: </b></u>' + ownerUserIDs[i].domain + '</label></div>';
		}
		html += '&nbsp;<input id="removeOwnerIDBtn" class="btn btn-danger" type="button" onClick=removeOwnerUserID() value="Remove" disabled></form>';
	}
	$.fancybox({
		autoScale: true,
		openEffect: 'fade',
		type: "html",
		content: html
	});
}
//Remove owner userID helper functions
function enableRemoveUserIDBtn() {
	for (let i = 0; i < document.removeForm.userIDsBtn.length; i++) {
		if (document.removeForm.userIDsBtn[i].checked == true) {
			$("#removeOwnerIDBtn").prop("disabled", false);
		}
	}
}
//Remove owner userID helper functions
function removeOwnerUserID() {
	var userID;
	for (let i = 0; i < document.removeForm.userIDsBtn.length; i++) {
		if (document.removeForm.userIDsBtn[i].checked == true) {
			userID = document.removeForm.userIDsBtn[i].value;
			var array = userID.split(',')
			$("#removeOwnerIDBtn").prop("disabled", false);
		}
	}
	console.log('Deleting userID: ' + userID + '....');
	window.runtime.runtime.removeUserID(array[0], array[1]);
	//update owner information
	update_owner_information();
	$("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:black;" class="label label-danger"> *User ID \"' + userID + '\" is successfully deleted</span>');
}

//by clicking in the add "add legacy id " button show the fancybox
$('#add_legacy_id').click(function () {
	$.fancybox({
		type: 'inline',
		content: jQuery('#add_legacy_id').html()
	});
});

$(document).ready(function () {

	$("#add_legacy_id").fancybox({
		'transitionIn': 'fade',
		'transitionOut': 'fade',
		'speedIn': 600,
		'speedOut': 200,
		'onClosed': function () {
		}
	});

	$("#add_legacy_id_form").bind("submit", function () {
		$.fancybox.showLoading();
		//by clicking in the submit button send a request....
		let data = $(this).serializeArray();
		let type = data[0]["value"];
		let category = data[1]["value"];
		let description = data[2]["value"];
		let legacyid = data[3]["value"];

		window.runtime.runtime.addLegacyID(type, category, description, legacyid);
		//update the owner information
		update_owner_information();
		$.fancybox({
			type: "html",
			content: "<p class=" + "title0" + "> Legacy ID successfully Added </p>"
		});

		return false;
	});
});


//Removing userID of the owner
function remove_user_legacy() {
	console.info(globalOwnerDetails);
	let ownerlegacyIDs;
	if (typeof globalOwnerDetails === 'undefined' || globalOwnerDetails === null) {
		let html = "<table class='table table-hover'><tr>" +
			"<td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'> No legacyIDs available </span></b></td></tr>";
		$.fancybox({
			autoScale: true,
			openEffect: 'fade',
			type: "html",
			content: html
		});
		return;
	} else {
		ownerlegacyIDs = globalOwnerDetails._legacyIDs;
	}
	if (typeof ownerlegacyIDs === 'undefined' || ownerlegacyIDs === null || ownerlegacyIDs.length === 0) {
		var html = "<table class='table table-hover'><tr>" +
			"<td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;'> No legacyIDs available </span></b></td></tr>";
	} else {
		var html = "<h3>User Ids are:</h3><br>";
		html += '<form name="removeLegacyForm" >';
		for (let i = 0; i < ownerlegacyIDs.length; i++) {
			html += '<div class="radio"><input type="radio" name="userIDsBtn" /></div>';
			html += '<div class="radio"><label style="font-size:18px"><input type="radio" style="all:unset;" onClick="enableRemoveLegacyIDBtn()" name="userIDsBtn" value=' + ownerlegacyIDs[i].type + ','+ ownerlegacyIDs[i].category + ',' + ownerlegacyIDs[i].description + ',' + ownerlegacyIDs[i].id + '><u><b>type: </b></u>' + ownerlegacyIDs[i].type + ' <u><b>id: </b></u>' + ownerlegacyIDs[i].id + '</label></div>';
		}
		html += '&nbsp;<input id="removeOwnerLegacyBtn" class="btn btn-danger" type="button" onClick=removeOwnerLegacyID() value="Remove" disabled></form>';
	}
	$.fancybox({
		autoScale: true,
		openEffect: 'fade',
		type: "html",
		content: html
	});
}
//Remove owner userID helper functions
function enableRemoveLegacyIDBtn() {
	for (let i = 0; i < document.removeLegacyForm.userIDsBtn.length; i++) {
		if (document.removeLegacyForm.userIDsBtn[i].checked == true) {
			$("#removeOwnerLegacyBtn").prop("disabled", false);
		}
	}
}
//Remove owner userID helper functions
function removeOwnerLegacyID() {
	var userID;
	for (let i = 0; i < document.removeLegacyForm.userIDsBtn.length; i++) {
		if (document.removeLegacyForm.userIDsBtn[i].checked == true) {
			userID = document.removeLegacyForm.userIDsBtn[i].value;
			var array = userID.split(',')
			$("#removeOwnerLegacyBtn").prop("disabled", false);
		}
	}
	console.log('Deleting LegacyID: ' + userID + '....');
	window.runtime.runtime.removeLegacyID(array[0], array[1],array[2],array[3]);
	//update owner information
	update_owner_information();
	$("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:black;" class="label label-danger"> *Legacy ID \"' + userID + '\" is successfully deleted</span>');
}

/**
 * Created by Senan Sharhan on 23.08.2016.
 */


function details(j) {
	//console.log(obj);
	if (obj.length !== 0) {
		//console.log("helloValue from obj " + obj[j]._firstName);

		var html = "<table class='table table-hover'><tr>" +
			"<td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;' class='label label-info'> Firstname : </span></b></td>" +
			"<td><input class='form-control' style='font-weight:bold; background:lightgrey;' type='text' placeholder='Enter First Name' value='" + obj[j]._firstName + "' readonly/></td>" +
			"<td><button class='btn btn-info' onclick=edit_values(1," + j + ")>Edit</button></td>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;' class='label label-info'>Lastname : </span> </b></td>" +
			"<td><input class='form-control' type='text' style='font-weight:bold; background:lightgrey;' placeholder='Enter Last Name' value='" + obj[j]._lastName + "' readonly/></span></td>" +
			"<td><button class='btn btn-info' onclick=edit_values(2," + j + ")>Edit</button></td></tr>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;' class='label label-info'> GUID : </span> </b></td>" +
			"<td><input class='form-control' type='text' placeholder='Enter GUID' style='font-weight:bold; background:lightgrey;' value='" + obj[j]._guid + "' readonly/></span></td>" +
			"<td><button class='btn btn-info' onclick=edit_values(3," + j + ")>Edit</button></td></tr> " +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;' class='label label-info'> Private Contact: </span> </b></td><td>";

		if (obj[j]._privateContact == 'true' || obj[j]._privateContact == true) {
			html = html + "<label class='radio-inline'><input type='radio' style='all:unset;' name='privacy' onClick='editPrivacy(" + j + ", true)' checked><u>Yes</u></label><label class='radio-inline'><input type='radio' style='all:unset;' name='privacy' onClick='editPrivacy(" + j + ", false)'>No</label>";
		} else {
			html = html + "<label class='radio-inline'><input type='radio' style='all:unset;' name='privacy' onClick='editPrivacy(" + j + ", true)' >Yes</label><label class='radio-inline'><input type='radio' style='all:unset;' name='privacy' onClick='editPrivacy(" + j + ", false)' checked><u>No</u></label>";
		}
		html = html + "<tr><td></td><td>";
		html = html + '<div class="dropdown open">' +
			'<button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
			'Contact\'s User IDs </button>  <ul class="dropdown-menu" style="border: 1px solid black;">';
		if (obj[j]._userIDs.length > 0) {
			for (var i = 0; i < obj[j]._userIDs.length; i++) {

				html = html + '<li><a class="btn btn-default"><b><u>Uid : ' + obj[j]._userIDs[i].uid + ' Domain: ' + obj[j]._userIDs[i].domain + '</u></b></a></li>';
			}
		}
		html = html + '</div></div><td></tr>';

		html = html + "<tr><td></td><td>";
		html = html + '<div class="dropdown open">' +
			'<button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
			'Contact\'s Legacy IDs </button>  <ul class="dropdown-menu" style="border: 1px solid black;">';
		if (obj[j]._legacyIDs.length > 0) {
			for (var i = 0; i < obj[j]._legacyIDs.length; i++) {
				html = html + '<li><a class="btn btn-default"><b><u>Type : ' + obj[j]._legacyIDs[i].type + ' Category: ' + obj[j]._legacyIDs[i].category +' Description: ' + obj[j]._legacyIDs[i].description +' ID: ' + obj[j]._legacyIDs[i].id + '</u></b></a></li>';
			}
		}
		html = html + '</div></div><td></tr>';

		html = html + "</td></tr><tr>" +
			"<td colspan=3 align='middle'><button class='btn btn-success' onclick=call(" + j + ")><span class='glyphicon glyphicon-earphone'> <b>Call</b></span></button></td></tr><tr>" +
			"<td colspan=3 align='middle'><button class='btn btn-warning' onclick=call(" + j + ")><span class='glyphicon glyphicon-envelope'> <b>Text</b></span></button></td></tr><tr>" +
			"<td colspan=3 align='middle'><button class='btn btn-danger' onclick = removeFriend(" + j + ")><span class='glyphicon glyphicon-trash'><b>Remove</b></span></button></td></tr><tr>" +
			"<td colspan=3 align='middle'> ";
		if (obj[j]._groups.length > 0) {
			for (var i = 0; i < obj[j]._groups.length; i++) {

				html = html + "<button class='btn btn-primary' type='button' onclick = delete_from_group(" + j + "," + i + ") > " + obj[j]._groups[i] + "  </button> ";
			}
		}
		html = html + "<button class='btn btn-danger' onclick = add_to_group(" + j + ")><span class='glyphicon glyphicon-plus'><b> add to group</b></span></button></td></tr>" +
			"<td colspan=3 align='middle'><button class='btn btn-success' onclick= update_contact(" + j + ")><span class='glyphicon glyphicon-refresh'> <b>Update contact Info</b></span></button></td></tr><tr>" +
			"</table>";

		$("#right-div").html(html);

	} else {
		$("#right-div").html("<br><br><br><h3 align='center' style='color:red;'><b>\"All the contacts have been deleted\"</b></h4> ");
		$("#message_lbl").html('<h4 ><span style="font-family:Verdana;font-size:12px;font-weight:bold;color:black;" class="label label-danger"> *All the contacts have been deleted</span></h4>');
	}
}

function detailsOwner(j) {
	console.log("Owner Details");
	if (globalOwnerDetails.length !== 0) {

		var html = "<table class='table table-hover'><tr>" +
			"<td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;' class='label label-info'> Firstname : </span></b></td>" +
			"<td><input class='form-control' style='font-weight:bold; background:lightgrey;' type='text' placeholder='Enter First Name' value='" + globalOwnerDetails._firstName + "' readonly/></td>" +
			"<td><button class='btn btn-info' disabled>Edit</button></td>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;' class='label label-info'>Lastname : </span> </b></td>" +
			"<td><input class='form-control' type='text' style='font-weight:bold; background:lightgrey;' placeholder='Enter Last Name' value='" + globalOwnerDetails._lastName+ "' readonly/></span></td>" +
			"<td><button class='btn btn-info' disabled>Edit</button></td></tr>" +
			"<tr><td><b><span style='font-family:Arial;font-size:18px;font-weight:bold;color:black;' class='label label-info'> GUID : </span> </b></td>" +
			"<td><input class='form-control' type='text' placeholder='Enter GUID' style='font-weight:bold; background:lightgrey;' value='" + globalOwnerDetails._guid + "' readonly/></span></td>" +
			"<td><button class='btn btn-info' disabled>Edit</button></td></tr></table>";

		$("#right-div").html(html);

	} else {
		$("#right-div").html("<br><br><br><h3 align='center' style='color:red;'><b>\"All the contacts have been deleted\"</b></h4> ");
		$("#message_lbl").html('<h4 ><span style="font-family:Verdana;font-size:12px;font-weight:bold;color:black;" class="label label-danger"> *All the contacts have been deleted</span></h4>');
	}
}

function editPrivacy(j, status) {
	let guid = obj[j]._guid;

	let body = window.runtime.runtime.editContact(obj[j]._guid, obj[j]._firstName, obj[j]._lastName, obj[j]._guid, status);
	if (body.success) {
		let result = body.contact;
		console.info(result);
		getAllContacts();
	}
}

function edit_friend(l, j) {
	let error_status = false;
	var oldGUID = obj[j]._guid;
	if (l == 1 && checkLength($("#efname"), "firstname", 1, 20) && checkRegexpEdit($("#efname"), /^[a-zA-Z]*$/, "firstname can consist of a-z only")) {
		obj[j]._firstName = $("#efname").val();
		error_status = true;
	}
	if (l == 2 && checkLength($("#elname"), "Lastname", 1, 20) && checkRegexpEdit($("#elname"), /^[a-zA-Z]*$/, "Lastname can consist of a-z only")) {
		obj[j]._lastName = $("#elname").val();
		error_status = true;
	}
	if (l == 3 && checkLength($("#eguid"), "guid", 8, 64)) {
		obj[j]._guid = $("#eguid").val();
		error_status = true;
	}
	if (error_status) {
		window.runtime.runtime.editContact(oldGUID, obj[j]._firstName, obj[j]._lastName, obj[j]._guid, obj[j]._privateContact);
		getAllContacts();
		details(j);
		$("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:black;" class="label label-success"> *Details of \"' + obj[j]._firstName + '\" have been updated successfully</span>');
	} else {
		alert("Please enter valid details");
	}
}


function createFriendList(obj, index) {
	sortFriends(obj);
	if (obj.length !== 0) {
		let table = '<table class="table table-hover" id="mytable">';
		let i = index;
		$.each(obj, function () {
			table += '<tr><td><button type="button" class="btn btn-primary btn-lg btn-block" data-toggle="button" aria-pressed="false" autocomplete="off" id="button' + i + '" onclick=details(' + i + ')><b>' + this['fname'] + '\t' + this['lname'] + '</b></button></td></tr>';
			i++;
		});
		table += '</table>';
		$("#left-div").html(table);
	} else {
		$("#left-div").html("<br><br><br><h3 align='center' style='color:red;'><b>\"No contacts in the imported file, please upload another file\"</b></h4> ");
	}
}


function export_list(obj) {
	let data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
	let a = document.createElement('a');
	a.href = 'data:' + data;
	a.download = 'contacts.json';
	a.innerHTML = '<span class="glyphicon glyphicon-download-alt"><b><u>Download your Contacts</b></u><span>';
	a.class = 'btn btn-primary';
	$("#export_link").html(a);
}


function checkRegexpEdit(o, regexp, n) {
	if (!(regexp.test(o.val()))) {
		return false;
	} else {
		return true;
	}
}


function checkLength(o, n, min, max) {
	if (o.val().length > max || o.val().length < min) {
		return false;
	} else {
		return true;
	}
}

function edit_values(l, j) {
	$('tr:nth-child(' + l + ') td:nth-child(2)').each(function () {
		console.log("Editing the value ");
		let html = $(this).html();
		if (l == 1) {
			var input = $('<input id="efname" class="form-control" type="text" placeholder="Enter First Name" value="' + obj[j]._firstName + '" />');
		} else if (l == 2) {
			var input = $('<input id="elname" class="form-control" type="text" placeholder="Enter Last Name" value="' + obj[j]._lastName + '"/>');
		} else {

			var input = $('<input id="eguid" class="form-control" placeholder="Enter GUID" type="text" value=" ' + obj[j]._guid + '"/>');
		}
		input.val();
		$(this).html(input);
		$('tr:nth-child(' + l + ') td:nth-child(3)').html("<button class='btn btn-info' onclick=edit_friend(" + l + "," + j + ")>Done</button>");
	});
}


function removeFriend(j) {


	var html = "<p class='title'></p>" +
		" <input type='button' class='confirm yes' value='Yes' /><input type='button' class='confirm no' value='No' />";

	$.fancybox({
		type: "html",
		content: html,
		beforeShow: function () {
			$(".title").html("Are you sure you want to delete this friend from your friend list?");
		},
		afterShow: function () {
			$(".confirm").on("click", function (event) {
				if ($(event.target).is(".yes")) {
					let userdel = obj[j]._firstName;
					window.runtime.runtime.removeContact(obj[j]._guid);
					deleteRecordByFileName(obj, userdel);

					if (obj.length == 0) {
						$("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:black;" class="label label-danger"> *All the contacts have been deleted</span>');
						getAllContacts();
					} else {
						$("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:black;" class="label label-success"> *Your friend \"' + userdel + '\" has been successfully removed </span>');
						details(0);
						getAllContacts();
					}
					ret = true;
				} else if ($(event.target).is(".no")) {
					ret = false;
				}
				$.fancybox.close();
			});
		}
	});
}

function add_to_group(i) {

	var html = "<p class='title'></p>" +
		"<p>&nbsp;</p>"+
		"<label style='font-size:18px'>Group Name</label>"+
		"<input name='gname' type='text' id='gname' class='text ui-widget-content ui-corner-all'/><br>"+
		"<p>&nbsp;</p>"+
		" <input type='button' class='confirm yes' style='font-size:15px' value='Yes' /><input type='button' class='confirm no' style='font-size:15px' value='No' />";

	$.fancybox({
		type: "html",
		content: html,
		beforeShow: function () {
			$(".title").html("<label style='font-size:20px'>Enter the Group Name !</label>");
		},
		afterShow: function () {
			$(".confirm").on("click", function (event) {
				if ($(event.target).is(".yes")) {
					group_name = $("#gname").val();
					if (group_name != "" && group_name != null) {
						window.runtime.runtime.addGroupName(obj[i]._guid, group_name);
						$("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:black;" class="label label-danger"> ' + obj[i]._firstName + " was successfully added to " + group_name + '\" </span>');
						getAllContacts();
						details(i);
					} else {

					}

					ret = true;
				} else if ($(event.target).is(".no")) {
					ret = false;
				}
				$.fancybox.close();
			});
		}
	});
}

function update_contact(i) {

	let checkPromise = new Promise(
		function (resolve, reject) {
			resolve(window.runtime.runtime.updateContactInfo(obj[i]._guid));
		});

	checkPromise.then(
		function (result) {

			console.log("send #########");
			console.log(result)
			console.log("send #########");
			if (result == true) {
				getAllContacts();
				details(i);
				$.fancybox({
					type: "html",
					content: "<p class=" + "title0" + ">  Contact was updated </p>"
				});
			} else {
				$.fancybox({
					type: "html",
					content: "<p class=" + "title0" + ">  Nothing to update  </p>"
				});
			}
		});

}


function sortFriends(obj) {
	obj.sort(function (a, b) {
		if (a._firstName.toLowerCase() < b._firstName.toLowerCase())
			return -1;
		if (a._firstName.toLowerCase() > b._firstName.toLowerCase())
			return 1;
		return 0;
	});
}


function deleteRecordByFileName(myArr, fname) {
	let index = null;
	console.log("before length is " + myArr.length)
	for (let i = 0; i < myArr.length; i++) {
		if (myArr[i]._firstName === fname) {
			index = i;
			break;
		}
	}
	if (index !== null) {
		myArr.splice(index, 1);
	}
	console.log("length is " + myArr.length);
	return myArr;
}


function call(j) {
	alert("Calling " + obj[j].mnum);
}


function message(j) {
	alert("Message sent to " + obj[j].mnum)
}

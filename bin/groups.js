/**
 * Created by Senan Sharhan on 17.10.2016.
 */

//by clicking in the " Add myself to group " button show the fancybox
$('#add_group_name_button').click(function () {
    $.fancybox({
        type: 'inline',
        content: jQuery('#add_group_name_button').html()
    });
});

$(document).ready(function () {

    $("#add_group_name_button").fancybox({
        'transitionIn': 'fade',
        'transitionOut': 'fade',
        'speedIn': 600,
        'speedOut': 200,
        'onClosed': function () {
        }
    });

    $("#add_group_name_form").bind("submit", function () {
        $.fancybox.showLoading();
        //by clicking in the submit button send a request....
        let data = $(this).serializeArray();
        let group_name = data[0]["value"];

        window.runtime.runtime.addGroupName(ownerguid, group_name);
        $.fancybox({
            type: "html",
            content: "<p class=" + "title0" + "> you have been added to  " + group_name + " Group </p>"
        });
        //get all groups
        getGroups();
        update_owner_information();
        return false;
    });

});


function getGroups() {

    console.log("function get Groups ");
    let result = window.runtime.runtime.getGroupNames();

	console.log("Groups " + result);

	select = document.getElementById('selectElementId');

	if (result.length != 0) {
		var j;
		for (j = select.options.length - 1; j >= 0; j--) {
			select.remove(j);
		}

		var opt1 = document.createElement('option');
		opt1.value = "all";
		opt1.innerHTML = "All Contacts";
		select.appendChild(opt1);

		for (var i = 0; i < result.length; i++) {
			var opt = document.createElement('option');
			opt.value = result[i];
			opt.innerHTML = result[i];
			select.appendChild(opt);
		}
	} else {
		var j;
		for (j = select.options.length - 1; j >= 0; j--) {
			select.remove(j);
		}
		var opt1 = document.createElement('option');
		opt1.value = "all";
		opt1.innerHTML = "All Contacts";
		select.appendChild(opt1);
	}
}

function get_group_users(groupname) {

    if (groupname == "all") {
        getAllContacts();
    } else {
        let result = window.runtime.runtime.getGroup(groupname);

		if (result == null) {
			return "NO users in this Group";
		} else {
			createFriendListGC(result, 0);
			console.log(result[0]._firstName);
		}
    }
}

function delete_from_group(j, i) {

    var html = "<p class='title'></p>" +
        " <input type='button' class='confirm yes' value='Yes' /><input type='button' class='confirm no' value='No' />";

    $.fancybox({
        type: "html",
        content: html,
        beforeShow: function () {
            $(".title").html("do you want really to remove this user from the group?");
        },
        afterShow: function () {
            $(".confirm").on("click", function (event) {
                if ($(event.target).is(".yes")) {
                    console.log("hi remove");
                    window.runtime.runtime.removeGroupName(obj[j]._guid, obj[j]._groups[i]);
                    getAllContacts();
                    getGroups();
                    ret = true;
                } else if ($(event.target).is(".no")) {
                    ret = false;
                }
                $.fancybox.close();
            });
        }
    });
}

function remove_owner_from_group() {


    var html = "<table class='table table-hover'><tr> </tr>";

    if (globalOwnerDetails._groups.length > 0) {
        tempGroups = globalOwnerDetails._groups;
        for (var i = 0; i < globalOwnerDetails._groups.length; i++) {

            html = html + "</tr><tr><td colspan=3 align='middle'> <b> Group name : " + globalOwnerDetails._groups[i] + "</b> <button class='btn btn-danger' onclick = 'delete_owner_from_group(" + i + ")'><span class='glyphicon glyphicon-trash'></span></button></td></tr>";
        }
    } else {
        html = html + "</tr><tr><td colspan=3 align='middle'> <b> You are Not a Member of any Group </b> </td></tr>";
    }
    html = html + "</table>";

    $.fancybox({
        type: "html",
        content: html
    });

}

function delete_owner_from_group(index) {

    var html = "<p class='title'></p>" +
        " <input type='button' class='confirm yes' value='Yes' /><input type='button' class='confirm no' value='No' />";

    $.fancybox({
        type: "html",
        content: html,
        beforeShow: function () {
            $(".title").html("do you want really to remove yourself from the group?");
        },
        afterShow: function () {
            $(".confirm").on("click", function (event) {
                if ($(event.target).is(".yes")) {
                    console.log("hi remove");
                    window.runtime.runtime.removeGroupName(ownerguid, tempGroups[index]);
                    getAllContacts();
                    getGroups();
                    ret = true;
                } else if ($(event.target).is(".no")) {
                    ret = false;
                }
                $.fancybox.close();
            });
        }
    });
    update_owner_information();
}

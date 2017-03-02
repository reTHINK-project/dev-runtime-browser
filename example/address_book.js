import { ready, errorMessage } from './support';

// polyfills
import 'babel-polyfill';
import 'indexeddbshim';
import 'mutationobserver-shim';
import 'object.observe';
import 'array.observe';

import rethink from '../bin/rethink';




let domain = "felix.dev"; // change to your URL!
        window.runtime = {
        "domain": domain
    }
if(document.readyState === 'complete') {
  documentReady();
} else {
  window.addEventListener('onload', documentReady, false);
  document.addEventListener('DOMContentLoaded', documentReady, false);
}


function documentReady() {
  // ready();
    window.addEventListener("message", receiveMsg, false);
 //
 rethink.install({
      "domain": domain,
      development: true
 }).then(documentReady).catch(errorMessage);
}


function receiveMsg(event){

 

function createDialog(title, text, options) {
     return $("<div class='dialog' style='text-align: center;' title='" + title + "'><p> -- Write down this words to login later !--</p><br\><strong>" + text + "</strong></div>").dialog(options);}
function copyToClipboard(text) {
  window.prompt("Copy to clipboard: Ctrl+C, Enter", text);}



  if(event.data.to == "runtime:getContact"){
    let userFirstName = event.data.body.firstName;
    let userLastName = event.data.body.lastName;
    $('.testResult').append("<h3>The user's firstName is <u>"+ userFirstName+"<h3></u> and Last Name is <u>"+ userLastName+"</u></h3>");//Append in guid.js


  }else if(event.data.to =='runtime:checkGUID'){
    let found =event.data.check; // true if there ist contacts list associated with the GUID,
    let FoF = event.data.usersFoF;

    console.log('@@@ Recrevived Post-message ' + event.data.to);

    let DirectContact =event.data.usersDirectContact;
      if (event.data.check){  
        console.log('FoF : '+ FoF);
        console.log(' DirectContact : '+ DirectContact);

      }else {
        console.log('User with no contacts \n GUID: ' + event.data.body.GUID )
        var el = $( "<p style='display: none;'>User with no contacts</p>" );
        $('#right-div').append(el);
        el.fadeIn('slow');

        setTimeout(function(){
          el.fadeOut('slow');
        }, 3000);


      };

  }else if(event.data.to == 'runtime:generateGUID'){
      let userGUID = event.data.body.guid;


      console.log('@@@ Recrevived PostMsg to ' + event.data.to);
      //$("#footer").append('<span style="font-family:Verdana;font-size:12px;font-weight:bold;" class="label "> *GUID is \"' + userGUID + '\"</span>');
      var popup = createDialog('Mnemonic Pop-Up!', userGUID,
      {autoOpen: false,
       height: 250,
       width: 350,
       buttons: [{
                  text: 'Copy to clipboard',
                'click': function() {
                   copyToClipboard(userGUID);
                   ;}
                }]
    });
      popup.dialog('open');
}
}




    var obj = []; //Empty JSON Object to store the friendlist temporarily 

    //Call function to be called on click event of call button
    function call(j) {
        alert("Checking... " + obj[j].fname);

    }
    //Message function to be called on click event of message button
    function message(j) {
        alert("Message sent to " + obj[j].mnum)
    }
    //removing a friend
    function deleteRecordByFileName(myArr, fname) {
        var index = null;
        console.log("before length is " + myArr.length)
        for (var i = 0; i < myArr.length; i++) {
            if (myArr[i].fname === fname) {
                index = i;
                break;
            }
        }
        if (index !== null) {
            myArr.splice(index, 1);
        }
        console.log("length is " + myArr.length)
        return myArr;
    }

    //remove friend
    function removeFriend(j) {
        if (confirm('Are you sure you want to delete this friend from your friend list?')) {
            var userdel = obj[j].fname;
            window.runtime.runtime.removeContact(obj[j].GUID);
            obj = deleteRecordByFileName(obj, obj[j].fname);
            createFriendList(obj);
            details(0);
            export_list(obj);
            $("#message_lbl").html('<h4 ><span style="font-family:Verdana;font-size:12px;font-weight:bold;color:FFFFFF;" class="label label-success"> *Your friend \"' + userdel + '\" has been successfully removed </span></h4>');
        } else {
            // Do nothing!
        }
    }

    function sortFriends(obj) {
        obj.sort(function(a, b) {

            if (a.fname.toLowerCase() < b.fname.toLowerCase())
                return -1;

            if (a.fname.toLowerCase() > b.fname.toLowerCase())
                return 1;
            return 0;

        });
    }
    //create friendlist
    function createFriendList(obj) {
        sortFriends(obj);
        if (obj.length !== 0) {
            var table = '<table class="table table-hover" id="mytable">';
            var i = 0;
            $.each(obj, function() {
                table += '<tr><td><button type="button" class="btn btn-primary btn-lg btn-block" data-toggle="button" aria-pressed="false" autocomplete="off" id="button' + i + '" onclick=details(' + i + ')><b>' + this['fname'] + '\t' + this['lname'] + '</b></button></td></tr>';
                i++;
            });
            table += '</table>';
            $("#left-div").html(table);
        } else {
            $("#left-div").html("<br><br><br><h3 align='center' style='color:red;'><b>\"No contacts in the imported file, please upload another file\"</b></h4> ");
        }
    }

    //Function to write details on click of a friend's name
    function details(j) {
        if (obj.length !== 0) {
            //console.log("helloValue from " + obj[j].fname);
            $("#right-div").html(
                "<table class='table table-hover'><tr><td><b>First Name</b></td><td>" + obj[j].fname + "</td><td><button class='btn btn-info' onclick=edit_values(1," + j + ")>Edit</button></td>" +
                "<tr><td><b>Last Name </b></td><td>" + obj[j].lname + "</td><td><button class='btn btn-info' onclick=edit_values(2," + j + ")>Edit</button></td></tr>" +
                "<tr><td><b>GUID </b></td><td>" + obj[j].GUID + "</td><td><button class='btn btn-info' onclick=edit_values(3," + j + ")>Edit</button></td></tr>" +
                "<tr><td colspan=3 align='middle'><button class='btn btn-success' onclick=call(" + j + ")><span class='glyphicon glyphicon-earphone'> <b>Call</b></span></button></td></tr>" +
                "<tr><td colspan=3 align='middle'><button class='btn btn-warning' onclick=call(" + j + ")><span class='glyphicon glyphicon-envelope'> <b>Text</b></span></button></td></tr>" +
                "<tr><td colspan=3 align='middle'><button class='btn btn-danger' onclick = removeFriend(" + j + ")><span class='glyphicon glyphicon-trash'><b> Remove</b></span></button></td></tr>" +
                "</table>");
        } else {
            $("#right-div").html("<br><br><br><h3 align='center' style='color:red;'><b>\"All the contacts have been deleted\"</b></h4> ");
            $("#message_lbl").html('<h4 ><span style="font-family:Verdana;font-size:12px;font-weight:bold;color:FFFFFF;" class="label label-danger"> *All the contacts have been deleted</span></h4>');
        }
    }

    //Adding a new user
    function export_list(obj) {
        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
        var a = document.createElement('a');
        a.href = 'data:' + data;
        a.download = 'contacts.json';
        a.innerHTML = '<span class="glyphicon glyphicon-download-alt"><b><u>Download your Contacts</b></u><span>';
        a.class = 'btn btn-primary';
        $("#export_link").html(a);
    }

    function useGUID() {

        var seed = $("#seed").val();
        if (seed == "" || seed == null) {
            alert("please enter seed");
        } else {
            console.log("seed is" + seed);
            window.runtime.runtime.useGUID(seed);
        }

    }

    //edit friend's detail
    function edit_values(l, j) {
        $('tr:nth-child(' + l + ') td:nth-child(2)').each(function() {
            console.log("Editing the value ");
            var html = $(this).html();
            if (l == 1) {
                var input = $('<input id="efname" type="text" />');
            } else if (l == 2) {
                var input = $('<input id="elname" type="text" />');
            } else {
                var input = $('<input id="eguid" type="text" />');
            }
            input.val(html);
            $(this).html(input);
            $('tr:nth-child(' + l + ') td:nth-child(3)').html("<button class='btn btn-info' onclick=edit_friend(" + l + "," + j + ")>Done</button>");
        });
    }

    //validations
    function checkLength(o, n, min, max) {
        if (o.val().length > max || o.val().length < min) {
            return false;
        } else {
            return true;
        }
    }

    function checkRegexp(o, regexp, n) {
        if (!(regexp.test(o.val()))) {
            return false;
        } else {
            return true;
        }
    }
    //commiting the changes
    function edit_friend(l, j) {
        var error_status = false;
        if (l == 1 && checkLength($("#efname"), "firstname", 1, 20) && checkRegexp($("#efname"), /^[a-zA-Z]*$/, "firstname can consist of a-z only")) {
            obj[j].fname = $("#efname").val();
            error_status = true;
        }
        if (l == 2 && checkLength($("#elname"), "Lastname", 1, 20) && checkRegexp($("#elname"), /^[a-zA-Z]*$/, "Lastname can consist of a-z only")) {
            obj[j].lname = $("#elname").val();
            error_status = true;
        }
        if (l == 3 && checkRegexp($("#eguid"), /^[a-z0-9]+$/i, "GUID can consist of only alphanumeric characters") && checkLength($("#eguid"), "guid", 8, 32)) {
            obj[j].GUID = $("#eguid").val();
            error_status = true;
        }
        if (error_status) {
            details(j);
            createFriendList(obj);
            export_list(obj);
            $("#message_lbl").html('<h4 ><span style="font-family:Verdana;font-size:12px;font-weight:bold;color:FFFFFF;" class="label label-success"> *Details have been updated successfully</span></h4>');
        } else {
            alert("Please enter valid details");
        }
    }

    function search_friend() {
        var name = $("#searchBox").val();
        window.runtime.runtime.getContact(name.toLowerCase());
        window.addEventListener("message", getContact, false);
    }


    function getContact(event) {
        var name = $("#searchBox").val();
        if (event.data.to == "runtime:getContact") {
            var tempObj = [];
            var userFirstName = event.data.body.firstName;
            var userLastName = event.data.body.lastName;
            var userExist = event.data.body.userExist;
            if (name == "") {
                createFriendList(obj);
            } else {
                for (var i = 0; i < obj.length; i++) {
                    if ((obj[i].fname.toLowerCase() == name.toLowerCase() || obj[i].lname.toLowerCase() == name.toLowerCase()) && (userFirstName.toLowerCase() == name.toLowerCase() || userLastName.toLowerCase() == name.toLowerCase()) && userExist) {

                        console.log("Found a contact " + userFirstName + ' GUID:'+obj[i].guid);


                        $("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:FFFFFF;" class="label label-success"> *Found a contact with name \"' + name + '\"</span>');
                        tempObj.push(obj[i]);
                    }
                };
                if (tempObj.length == 0) {
                    $('#left-div').html("<h3 align='center'> <b>No such contact with name </b> \"" + name + "\"</h3>");
                    $("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:FFFFFF;" class="label label-success"> *No Such contact with name \"' + name + '\"</span>');
                } else {
                    createFriendList(tempObj);
                }   
            }
        }
    }

    function add_user_id() {
        var userid = prompt("Please enter user ID you would like to add ", "");
        if (userid != "" && userid != null) {
            window.runtime.runtime.addUserID("userid");
            $("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:FFFFFF;" class="label label-success"> *User ID \"' + userid+ '\" is successfully Added</span>');
            //alert("User Id "+userid+" is added succussfully");
        } else {
            alert("user ID cannot be blank");
        }
    }

    function remove_user_id() {
        var userid = prompt("Please enter user ID you would like to remove ", "");
        if (userid != "" && userid != null) {
            window.runtime.runtime.removeUserID(userid);
            $("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:FFFFFF;" class="label label-danger"> *User ID \"' + userid+ '\" is successfully deleted</span>');
            //alert("User Id "+userid+" is deleted succussfully");
        } else {
            alert("user ID cannot be blank");
        }
    }

    function query_global_registry() {
        window.runtime.runtime.queryGlobalRegistry('shdfjdskfjs7fdsd87few87fs898sa');
    }

    function generate_guid() {
        var guid = window.runtime.runtime.generateGUID();
        //$("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:FFFFFF;" class="label label-success"> *GUID is \"' + guid + '\"</span>');
    }
    //Generating list of friends dynamically
    $(document).ready(function() {
     
        $('#login').html('<div class="container">' +
            '<!-- Trigger the modal with a button -->' +
            '' +
            '<!-- Modal -->' +
            '<div class="modal fade" id="myLogin" role="dialog">' +
            '<div class="modal-dialog">' +
            '<!-- Modal content-->' +
            '<div class="modal-content" align="left">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
            '<h4 class="modal-title"><b>Login using Seed</b></h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<label align="left">Please enter the 16 word seed</label>' +
            '<input name="seed" type="text" id="seed" style=" width: 500px;" placeholder="Enter seed..."/>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" onclick=useGUID() data-dismiss="modal" >login</button><button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');
    });
    //funtion for dialogue box to add new friend with validation
    $(function() {
        var dialog, form, allFields, tips;
        var fname = $("#fname");
        var lname = $("#lname");
        //var mnum = $("#mnum");
        //var age = $("#age");
        var guid = $("#guid");
        //allFields = $([]).add(fname).add(lname).add(age).add(guid).add(mnum),
           // tips = $(".validateTips");
		allFields = $([]).add(fname).add(lname).add(guid),
		    tips = $(".validateTips");

        function updateTips(t) {
            tips.text(t).addClass("ui-state-highlight");
            setTimeout(function() {
                tips.removeClass("ui-state-highlight", 1500);
            }, 500);
        }

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

        function addUser() {
            var valid = true;
            allFields.removeClass("ui-state-error");
            valid = valid && checkLength(fname, "firstname", 1, 20);
            valid = valid && checkLength(lname, "lastlname", 1, 20);
            valid = valid && checkLength(guid, "guid", 8, 32);
            //valid = valid && checkLength(age, "age", 1, 2);
            valid = valid && checkRegexp(fname, /^[a-zA-Z]*$/, "firstname can consist of a-z only");
            valid = valid && checkRegexp(lname, /^[a-zA-Z]*$/, "lastname can consist of a-z only");
            valid = valid && checkRegexp(guid, /^[a-z0-9]+$/i, "GUID can consist of only alphanumeric characters");
            //valid = valid && checkRegexp(age, /^\d+$/, "age can only be a two digit number");
            //valid = valid && checkRegexp( mnum, /^[0-9]\d{10}$/, "Mobile Number can only be 10 digits long" );
            if (valid) {
                obj.push({
                    "fname": fname.val(),
                    "lname": lname.val(),
                    //"age": age.val(),
                    "GUID": guid.val()
                    //"mnum": mnum.val()
                });
                window.runtime.runtime.addContact(guid.val(), fname.val().toLowerCase(), lname.val().toLowerCase());
                window.runtime.runtime.checkGUID(guid.val());
                
                $("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:FFFFFF;" class="label label-success"> *User ' + fname.val()+ ' is added</span>');
                dialog.dialog("close");
                createFriendList(obj);
                export_list(obj);
            }
            return valid;
        };

        dialog = $("#dialog-form").dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            buttons: {
                "Add": addUser,
                Cancel: function() {
                    dialog.dialog("close");
                }
            },
            close: function() {
                form[0].reset();
                allFields.removeClass("ui-state-error");
            }
        });

        form = dialog.find("form").on("submit", function(event) {
            event.preventDefault();
            addUser();

        });

        $("#add_new_btn").button().on("click", function() {
            dialog.dialog("open");
        });
    });

    //Uploading JSON
    $(document).on('change', '.filestyle', function(event) {
        var reader = new FileReader();

        reader.onload = function(event) {
            obj = JSON.parse(event.target.result);
            //alert(Obj[0].fname);
            console.log("uploaded file");
            createFriendList(obj);
            export_list(obj);
            for (var i = 0; i < obj.length; i++) {
                window.runtime.runtime.addContact(obj[i].guid, obj[i].fname.toLowerCase(), obj[i].lname.toLowerCase());
            };
            if(obj.length!=0){
                for (var i = 0; i < obj.length; i++) {
                window.runtime.runtime.addContact(obj[i].guid, obj[i].fname.toLowerCase(), obj[i].lname.toLowerCase());
                };
                details(0);
                $("#message_lbl").html('<span style="font-family:Verdana;font-size:12px;font-weight:bold;color:black;" class="label label-success"> * ' + obj.length+ ' contacts have been imported</span>');
            } else {
                $("#right-div").html("<br><br><br><h3 align='center' style='color:red;'><b>\"No contacts in the imported file\"</b></h4> ");
            }
            

        }
        reader.readAsText(event.target.files[0]);
    });
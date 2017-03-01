//-------------------
// User Object
//-------------------
var user = {
    "FirstName": "",
    "LastName": "",
    "UserID": "0",
    "Persona": "",
    "Validated": "false",
    "WaiverSigned": "false",
    "ProviderWaiverSigned": "true",
    "ExternalProfileID": "0",
    "ReferralCode": ""
};

var gAvailableForWork = false;
var gHTMLObject = "";
var gLastRow = 0;
var bDisplayPage = false;
var gCustomerToAddressForReview = "";
var gDiscountDollars = 0;
var gTotalDiscountableCost = 0;
var gTotalDiscountableSubCost = 0;
var gToLat = 0;
var gToLng = 0;
var pushregtoken = "";
var gIGNOREdisabledEventPropagation = false;

//------------------------------
// General Start-up Routines
//------------------------------
var gLocationIntervalID = null;
var gDashboardIntervalID = null;

setInterval("unblockUI();", 10000);

function adjustpreviewwidthtoimage() {

    $("body").css("background-color", "silver");
    var where = window.location.toString();

    var img = new Image();
    var prefix = "../";

    if (where.indexOf("index.html") > -1) {
        prefix = "";
    }

    img.src = prefix + 'assets/common/images/welcome-background.png';

    var cWidth = $(window).width();
    var cHeight = $(window).height();

    if (cWidth > 600) {
        cWidth = 600;
    }

    var resizer = calculateAspectRatioFit(img.width, img.height, cWidth, cHeight);

    $(".senduserhome").css("width", resizer.width.toString() + "px");
    $("#myCarousel").css("width", resizer.width.toString() + "px");

    resizeitems(resizer.width);
    $(".appcontainer").show();
}

function adjustwidthtoimage() {

    $("body").css("background-color", "silver");
    var where = window.location.toString();

    var img = new Image();
    var prefix = "../";

    if (where.indexOf("index.html") > -1) {
        prefix = "";
    }

    img.src = prefix + 'assets/common/images/log-in-background.png';

    var cWidth = $(window).width();
    var cHeight = $(window).height();

    if (cWidth > 600) {
        cWidth = 600;
    }

    var resizer = calculateAspectRatioFit(img.width, img.height, cWidth, cHeight);

    resizeitems(resizer.width);

}

function resizeitems(w) {

    $("body").css("width", w.toString() + "px");
    $(".appcontainer").css("width", w.toString() + "px");
    $(".container").css("width", w.toString() + "px");
    $(".form-signin").css("width", w.toString() + "px");
    $(".footer-auto").css("width", w.toString() + "px");
    $(".header-auto").css("width", w.toString() + "px");

}

function isValidPostalCode(postalCode, countryCode) {
    switch (countryCode) {
        case "US":
            postalCodeRegex = /^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/;
            break;
        case "CA":
            postalCodeRegex = /^([A-Z][0-9][A-Z])\s*([0-9][A-Z][0-9])$/;
            break;
        default:
            postalCodeRegex = /^(?:[A-Z0-9]+([- ]?[A-Z0-9]+)*)?$/;
    }
    return postalCodeRegex.test(postalCode);
}

function detectCardType(number) {
    var re = {
        electron: /^(4026|417500|4405|4508|4844|4913|4917)\d+$/,
        maestro: /^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)\d+$/,
        dankort: /^(5019)\d+$/,
        interpayment: /^(636)\d+$/,
        unionpay: /^(62|88)\d+$/,
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        mastercard: /^5[1-5][0-9]{14}$/,
        amex: /^3[47][0-9]{13}$/,
        diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
        jcb: /^(?:2131|1800|35\d{3})\d{11}$/
    }

    for (var key in re) {
        if (re[key].test(number)) {


            if (key == "mastercard") {
                return "Mastercard";
            } else if (key == "visa") {
                return "Visa";
            } else if (key == "amex") {
                return "American Express";
            } else if (key == "discover") {
                return "Discover";
            } else {
                return key
            }
        }
    }
}

function StartLocationPoll() {

    if (gSettingGPS == true) {
        if (gLocationIntervalID == null) {
            getLocation("updateLocationInfo();");
            gLocationIntervalID = setInterval('getLocation("updateLocationInfo();")', gSettingLocationPollInterval);
        }
    }

    if (gDashboardIntervalID == null) {
        SetupDashboard(false, false);
        gDashboardIntervalID = setInterval('SetupDashboard(false,false)', gSettingDashboardPollInterval);
    }

}

function EndLocationPoll() {

    clearInterval(gLocationIntervalID);
    gLocationIntervalID = null;

    clearInterval(gDashboardIntervalID);
    gDashboardIntervalID = null;
}

function updateLocationInfo() {
    //LogIt('/api/UpdateUserLocation/ 0 ');

    if (GetCookieItem("my_lat").length == 0 || GetCookieItem("my_lng").length == 0) {
        return;
    }

    //LogIt('/api/UpdateUserLocation/ 1 ');
    //LogIt(GetCookieItem("ProviderActive"));

    //------------------------------
    // Don't log the Provider
    // if in Do Not Disturb Mode
    //------------------------------
    if (user.Persona == "provider") {
        if (GetCookieItem("ProviderActive") != "true") {
            return;
        }
    }

    //LogIt('/api/UpdateUserLocation/ 2');

    var dt = new Date();
    var callback = updateLocationInfoSuccess;
    var data = null;
    var ret = false;

    if (user.UserID == "0") {
        return;
    }

    var url = ServicePrefix + '/api/UpdateUserLocation/';
    data = {
        userid: user.UserID,
        usertype: (user.Persona == "admin" ? "user" : user.Persona),
        latitude: GetCookieItem("my_lat"),
        longitude: GetCookieItem("my_lng"),
        longdate: dt,
        address: GetCookieItem("my_Address"),
        city: GetCookieItem("my_City"),
        state: GetCookieItem("my_State"),
        zipcode: GetCookieItem("my_ZipCode"),
        country: GetCookieItem("my_Country")
    }

    $.ajax({
        data: data,
        dataType: "json",
        url: url,
        method: "POST",
        success: callback,
        error: updateLocationInfoError
    });

}

function updateLocationInfoSuccess(result) {

    UpdateCookieItem("LocationSaved", "true");

    if (result == null) {
        showAlert('returned no data');
        return;
    }

    if (result.Status != "SUCCESS") {
        showAlert(result.Message);
        return;
    } else {
        return;

    }


}

function updateLocationInfoError(jqXHR, textStatus, err) {
    showAlert(textStatus);
    return false;
}

//---------------------
// Functional variables
//---------------------

//------------------------------------------------
// ServicePrefix is initialized in spappinit.js
//---------------------------------------------------
if (window.location.hostname.indexOf("dev.spapp.com") > -1) {
    ServicePrefix = "http://devservices.spapp.com";
    ImagePrefix = "http://devimage.spapp.com";
} else if (window.location.hostname.indexOf("joiful.spapp.com") > -1) {
    ServicePrefix = "http://joifulservices.spapp.com";
    ImagePrefix = "http://joifulimage.spapp.com";
} else if (window.location.hostname.indexOf("stg.spapp.com") > -1) {
    ServicePrefix = "http://stgservices.spapp.com";
    ImagePrefix = "http://stgimage.spapp.com";
} else if (window.location.hostname.indexOf("qa.spapp.com") > -1) {
    ServicePrefix = "http://qaservices.spapp.com";
    ImagePrefix = "http://qaimage.spapp.com";
} else if (window.location.hostname.indexOf("www.spapp.com") > -1) {
    ServicePrefix = "http://services.spapp.com";
    ImagePrefix = "http://image.spapp.com";
} else if (window.location.hostname.indexOf("devmanager.spapp.com") > -1) {
    ServicePrefix = "http://devservices.spapp.com";
    ImagePrefix = "http://devimage.spapp.com";
} else if (window.location.hostname.indexOf("stgmanager.spapp.com") > -1) {
    ServicePrefix = "http://stgservices.spapp.com";
    ImagePrefix = "http://stgimage.spapp.com";
} else if (window.location.hostname.indexOf("qamanager.spapp.com") > -1) {
    ServicePrefix = "http://qaservices.spapp.com";
    ImagePrefix = "http://qaimage.spapp.com";
} else if (window.location.hostname.indexOf("manager.spapp.com") > -1) {
    ServicePrefix = "http://services.spapp.com";
    ImagePrefix = "http://image.spapp.com";
} else if (window.location.hostname.indexOf("joifulmanager.spapp.com") > -1) {
    ServicePrefix = "http://joifulservices.spapp.com";
    ImagePrefix = "http://joifulimage.spapp.com";
}
if (window.location.protocol == "https:") {
    ServicePrefix = ServicePrefix.replace("http", "https");
    ImagePrefix = ImagePrefix.replace("http", "https");
} else {

    var win = window.location.toString().toLowerCase();

    if (win.indexOf("file") == -1) {
        win = win.replace("http", "https");
        window.location = win;
    }

}

$(document).ready(function() {

    gToLat = GetCookieItem("my_lat");

    gToLng = GetCookieItem("my_lng");

});

//--------------------
// Common General Routines
//--------------------
function ReleasePage() {

    bDisplayPage = true;

    $(document).ready(function() {
        if ($(".appcontainer").is(":visible") == false) {
            $(".appcontainer").show();
            //LogIt("Release the page");
        }

        ////$("#spaheader").show();
    });
}

function SetupDashboard(bCacheOnly, bRunFullRoutine, Next) {

    if (typeof bRunFullRoutine == 'undefined') {
        bRunFullRoutine = true;
    }

    if (typeof Next == 'undefined') {
        Next = "";
    }
    //--------------------------------------
    // The primary function of 
    // Non-full mode run is to 
    // get the users to the proper page
    // this code skips the process if they
    // are already there...
    //--------------------------------------
    if (bRunFullRoutine == false) {
        var where = window.location.toString().toLowerCase();
        if ((where.indexOf("jobdetail.html") > -1) ||
            (where.indexOf("canceljob.html") > -1)) {
            //We are already on the page
            // just exit gracefully...
            return;
        }
    }


    //----------------------------
    // Full version of this routine
    // bRunFullRoutine=true
    //----------------------------
    if (bRunFullRoutine == true) {
        if (typeof LoadHomePage != "undefined") {
            LoadHomePage();
        }
    }

    if (typeof bCacheOnly == 'undefined') {
        bCacheOnly = false;
    }

    var UserID = GetCookieItem("UserID");
    var UserType = GetCookieItem("Persona");

    UserType = (UserType == "admin" ? "user" : UserType);

    var uri = ServicePrefix + "/api/GetUserStatus/?userid=" + UserID + "&usertype=" + UserType;

    $.get(uri).then(function(result) {

        if (result == null) {
            showAlert('returned no data', 'RedirectToHomePage();');
            return false;
        }
        if (result.Status != null) {

            // ERROR
            if (result.Status != "SUCCESS") {
                showAlert(result.Message, "RedirectToHomePage();");
            } else {

                var url = "";

                //----------------------------
                // Full version of this routine
                // bRunFullRoutine=true
                //----------------------------
                if (bRunFullRoutine == true) {

                    //-----------------------
                    // Mobile or Gender
                    //-----------------------
                    if (result.PhoneNumberEntered == false || result.GenderEntered == false) {
                        url = "../profile/editprofile.html";
                        showAlert("You must complete your profile information to access the system.", url);
                        return;
                    }
                    //-----------------------
                    // Credit Card
                    //-----------------------
                    UpdateCookieItem("PrimaryCreditCardID", result.PrimaryCreditCardID);
                    if (result.PrimaryCreditCardID.length == 0) {
                        url = "../profile/profilecreditcardeditor.html?creditcardid=0";
                        showAlert("You must enter a credit card to access the system.", url);
                        return;
                    }
                    ////////-----------------------
                    //////// Bank Info
                    ////////-----------------------
                    //////if (result.BankInfoEntered == false && UserType == "provider") {
                    //////    url = "../provider/providerpayeeeditor.html";
                    //////    showAlert("You must enter bank account information to access the system.", url);
                    //////    return;
                    //////}

                    //-----------------------
                    // Addresses
                    //-----------------------
                    UpdateCookieItem("PrimaryAddressID", result.PrimaryAddressID);

                    //-----------------------
                    // Cache work
                    //-----------------------
                    // Services
                    //-----------------------
                    if (GetCookieItem("cServicesDate") != result.LastServiceChangeDate) {
                        RemoveCookie("cServices");
                        // This will cascade offerings...
                    }
                    UpdateCookieItem("cServicesDate", result.LastServiceChangeDate);

                    //-----------------------
                    // States
                    //-----------------------
                    if (GetCookieItem("cStateListDate") != result.LastStateChangeDate) {
                        RemoveCookie("cStateList");
                    }
                    UpdateCookieItem("cStateListDate", result.LastStateChangeDate);

                    //-----------------------
                    // Country
                    //-----------------------
                    if (GetCookieItem("cCountryListDate") != result.LastCountryChangeDate) {
                        RemoveCookie("cCountryList");
                    }
                    UpdateCookieItem("cCountryListDate", result.LastCountryChangeDate);

                    //--------------------------------
                    // Discount Codes - per user bank
                    //-------------------------------
                    RemoveCookieItem("autoapplyDiscountCode");
                    if (result.Discounts != null) {
                        if (result.Discounts.length > 0) {
                            for (var i = 0; i < result.Discounts.length; i++) {
                                UpdateCookieItem("autoapplyDiscountCode", result.Discounts[i].DiscountCode);
                                break;
                            }
                        }
                    }

                }

                if (Next.length > 0) {
                    window.location = "../" + Next + ".html";
                    return;
                }


                //----------------------------
                // This is done everytime
                // bRunFullRoutine=true or false
                //----------------------------
                if (result.Results.length > 0) {
                    JobInProgressRtn(result.Results);
                } else {
                    //----------------------------
                    // Full version of this routine
                    // bRunFullRoutine=true
                    //----------------------------
                    if (bRunFullRoutine == true) {
                        if (result.ReviewID != "0") {
                            ForceReview(UserID, result.ReviewID, result.ReviewAsProvider);
                            return false;
                        }

                        //$(".form-signin").hide();
                        // Dynamic Dashboard
                        if (result.TotalApprovedAccessServices == 0) {
                            if (result.TotalPendingAccessToServices == 0) {
                                $("#divOpenJobs").hide();
                                $("#divNoServices").show();
                                $("#divNotApproved").hide();
                                $("#divPartialApproved").hide();
                            } else {
                                $("#divNoServices").hide();
                                $("#divNotApproved").show();
                                $("#divOpenJobs").hide();
                                $("#divPartialApproved").hide();
                            }
                            //$(".form-signin").show();
                            //if (typeof LoadHomePage != "undefined") {
                            //    LoadHomePage();
                            //}
                        } else {
                            $("#divNoServices").hide();
                            $("#divNotApproved").hide();
                            $("#divOpenJobs").show();
                            //$("#divWorkStatus").show();
                            if (result.TotalPendingAccessToServices > 0) {
                                $("#divPartialApproved").show();
                            } else {
                                $("#divPartialApproved").hide();
                            }
                            ////$(".form-signin").show();
                            //if (typeof LoadHomePage != "undefined") {
                            //    LoadHomePage();
                            //}
                        }

                        //--------------------------
                        // bCacheOnly indicates
                        // already on the home page
                        // -------------------------
                        if (bCacheOnly == false) {
                            RedirectToHomePage();
                            ////$(".form-signin").show();
                            //if (typeof LoadHomePage != "undefined") {
                            //    LoadHomePage();
                            //}
                        }
                    }
                }
            }
        } else {
            RedirectToHomePage();
            ////$(".form-signin").show();
            //if (typeof LoadHomePage != "undefined") {
            //    LoadHomePage();
            //}
        }
    });

}

function JobInProgressRtn(Results) {

    for (var i = 0; i < Results.length; i++) {

        RemoveCookie("providercommand");

        var url = '../cart/jobdetail.html?firsttime=true&jobid=' + Results[i].JobID + "&provider=" + Results[i].IsJobProvider;

        //var Message = gSessionInProgressMessage;

        //if (Results[i].IsJobProvider == true) {
        //    Message = Message.replace('[CUSTOM]', gSessionInProgressMessageProvider);
        //}
        //else {
        //    Message = Message.replace('[CUSTOM]', gSessionInProgressMessageCustomer);
        //}

        //showAlert(Message, url);
        window.location = url;
        return false;
    }
}

function ForceReview(userid, jobid, isProvider) {
    var uri = "";
    var uri = ServicePrefix + "/api/GetJobListWithLimit/?userid=" + userid.toString() + "&usertype=" + (isProvider == true ? "provider" : "user") + "&jobid=" + jobid + "&statusgroup=&rows=1";


    $.get(uri).then(function(result) {
        if (!result) {
            showAlert('returned no data');
            return;
        }

        if (result.Status != "SUCCESS") {
            showAlert(result.Message);
            return;
        }

        if (result.Results.length > 0) {

            ForceReviewSuccess(userid, result.Results[0], isProvider, jobid);
        }

    });
    // pull job id info
}

function ForceReviewSuccess(userid, result, isProvider, jobid) {
    //console.log(isProvider);
    if (isProvider == false && gMobileVersion == false) {
        LoadAddThis();
    }

    var work = "";

    work = work + "<div style='width:100%;max-width:580px;background-color:white;color:" + gColors.PeacefulGray + "'>";

    // Transaction Date
    work = work + "<div class='row noPadding '>";
    work = work + "<div class='col-xs-12'>";
    work = work + "<div style='font-size:large;padding-top:5px'>Last Service</div>";
    work = work + "<div style='font-size:small;padding-bottom:5px;color:" + gColors.PeacefulGray + "'>" + result.TransactionDateDisplay + "</div>";
    work = work + "</div>";
    work = work + "</div>";

    // Please review....
    work = work + "<div class='row noPadding border-top' >";
    work = work + "<div class='col-xs-6 noPadding border-right' style='height:75px'>";
    work = work + "<div style='text-align:center'>";

    if (isProvider == false) {

        work = work + '<div class="col-xs-6 noPadding" style="text-align:right;display:table-cell"><img src="' + ImagePrefix + '/profile/' + result.ProviderUserID + '.jpg" class="img-circle" style="margin-bottom:5px;margin-top:5px;max-height:65px;border-radius:50%;border:solid 2px #d86018"/></div>';
        work = work + "<div class='col-xs-6 noPadding' style='text-align:center;display:table-cell; font-size:12px;padding-top:20px;padding-left:5px;color:" + gColors.PeacefulGray + "'>" + result.ProviderFirstName + "<br><span>" + result.ProviderAvgReview + "</span>&nbsp;<span><img style='height:18px;margin-top:-5px' src='../assets/common/images/stars.png' /></span> s</div>";
    } else {
        work = work + '<div><div class="img-circle" style="margin:0 auto;font-size:small;padding-top:20px;margin-bottom:5px;margin-top:10px;vertical-align:middle;color:' + gColors.PeacefulGray + '"/>' + result.FirstName + '</div></div>';

    }

    work = work + "</div>";

    work = work + "</div>";

    work = work + "<div class='col-xs-6'>";

    work = work + "<div style='font-weight:600;font-size:large;text-align:center;width:100%;padding-top:28px;color:" + gColors.PeacefulGray + "'>";

    var Total = 0;

    for (var i = 0; i < result.CartItems.length; i++) {
        Total = Total + parseFloat(result.CartItems[i].CartOfferingCost);
    }
    work = work + "$" + Total.toFixed(2).toString();
    work = work + "</div>";
    work = work + "</div>";

    work = work + "</div>";

    // Review What / Service Address
    work = work + "<div class='row noPadding border-top' style='height:75px'>";
    work = work + "<div class='col-xs-12'>";
    work = work + "<div style='font-size:large;padding-top:14px;color:" + gColors.PeacefulGray + "'>" + result.Service + "</div>";
    work = work + "<div style='font-size:small;padding-bottom:8px;color:" + gColors.PeacefulGray + "'>" + result.CartAddress.City + ", " + result.CartAddress.State + " " + result.CartAddress.ZipCode + "</div>";
    work = work + "</div>";
    work = work + "</div>";

    // Review Stuff here
    work = work + "<div class='row noPadding border-top' id='reviewareacontent' style='height:133px'>";
    work = work + "<div class='col-xs-12'>";
    work = work + "<div style='font-weight:600;font-size:small;padding-top:10px;width:100%;text-align:center;color:" + gColors.PeacefulGray + "'>RATE YOUR SERVICE</div>";


    work = work + '<div>';
    work = work + '<span style="width:150px"class="rating">';

    //work = work + '<input id="rating1" type="radio" name="rating" onclick="enablereview();" value="1">';
    //work = work + '<label for="rating1">1</label>';
    //work = work + '<input id="rating2" type="radio" name="rating" onclick="enablereview();" value="2">';
    //work = work + '<label for="rating2">2</label>';
    //work = work + '<input id="rating3" type="radio" name="rating" onclick="enablereview();" value="3">';
    //work = work + '<label for="rating3">3</label>';
    //work = work + '<input id="rating4" type="radio" name="rating" onclick="enablereview();" value="4">';
    //work = work + '<label for="rating4">4</label>';
    //work = work + '<input id="rating5" type="radio" name="rating" onclick="enablereview();" value="5">';
    //work = work + '<label for="rating5">5</label>';

    work = work + '<input id="rating5" type="radio" name="rating" onclick="enablereview();" value="5">';
    work = work + '<label for="rating5">5</label>';
    work = work + '<input id="rating4" type="radio" name="rating" onclick="enablereview();" value="4">';
    work = work + '<label for="rating4">4</label>';
    work = work + '<input id="rating3" type="radio" name="rating" onclick="enablereview();" value="3">';
    work = work + '<label for="rating3">3</label>';
    work = work + '<input id="rating2" type="radio" name="rating" onclick="enablereview();" value="2">';
    work = work + '<label for="rating2">2</label>';
    work = work + '<input id="rating1" type="radio" name="rating" onclick="enablereview();" value="1">';
    work = work + '<label for="rating1">1</label>';
    work = work + '</span>';
    work = work + '</div>';


    work = work + '<div style="text-align:center">';
    work = work + '<textarea id="txtAreaReview" placeholder="Tell us your thoughts..." style="margin: 5px 5px 5px 5px;width: 90%; height: 60px; resize: none;color:' + gColors.PeacefulGray + '" maxlength="5000"></textarea>';
    work = work + '</div>';

    work = work + "</div>";

    work = work + "</div>";




    if (isProvider == false) {
        if (gMobileVersion == false) {
            // Share
            work = work + "<div style='display:none;height:50px' class='row noPadding reviewshare border-top' >";

            work = work + "<div class='col-xs-12'>";
            work = work + '<div style="text-align:center" class="addthis_inline_share_toolbox" data-url="http://www.joiful.com" ><span style="font-weight:600;font-size:small;padding-top:10px;width:100%;text-align:center;color:' + gColors.PeacefulGray + '">SHARE</span></div>';
            work = work + "</div>";

            work = work + "</div>";
        } else {
            // Share
            work = work + "<div class='row noPadding reviewshare border-top' style='display:none;'>";

            work = work + "<div class='col-xs-12 noPadding'>";
            work = work + '<img src="../assets/common/images/share.jpg" style="max-width:280px" onclick="SharePG()"/>';
            work = work + "</div>";

            work = work + "</div>";
        }
    }

    var params = "'" + userid + "','" + jobid + "'," + isProvider;
    // Done Button
    var btn = '<button id="btnReviewDone" type="button" class="btn btn-lg btn-success btn-block pullUp reviewshare grad btnHeight" style="display:none;border-radius:0%" onclick="ForceUserHome()">DONE</button>';

    work = work + "<div class='row noPadding'>";
    work = work + "<div class='col-xs-12 noPadding'>";
    work = work + btn;
    work = work + "</div>";
    work = work + "</div>";

    work = work + "</div>";

    // Submit Button
    var btn = '<button id="btnReview"    type="button" class="btn btn-lg btn-success btn-block pullUp reviewarea grad btnHeight"   style="display:none;border-radius:0%" onclick="SubmitReview(' + params + ')">SUBMIT</button>';

    work = work + "<div class='row noPadding'>";
    work = work + "<div class='col-xs-12 noPadding'>";
    work = work + btn;
    work = work + "</div>";
    work = work + "</div>";

    work = work + "</div>";

    showAlert(work, null, null, true);

}

function enablereview() {
    $("#btnReview").show();
}
var bReviewByProvider = false;

function SubmitReview(userid, JobID, bIsProvider) {
    bReviewByProvider = bIsProvider;

    //LogIt(userid);
    var rat = RemoveTags($('input[name="rating"]:checked').val());

    if (typeof rat == "undefined" || rat == null || rat == "") {
        showAlert("Please select 1 to 5 stars when rating your service.", "SendUserHome();");
        return;
    }

    //LogIt(rat);

    var uri = ServicePrefix + '/api/UpdateReview/';

    if (bIsProvider == true) {
        var userType = "provider";
    } else {
        var userType = "user";
    }

    var postData = {
        jobid: JobID,
        userid: userid,
        usertype: (bIsProvider == true ? "provider" : "user"),
        reviewid: 0,
        reviewtext: RemoveTags($("#txtAreaReview").val()),
        ratingvalue: RemoveTags($("input[name='rating']:checked").val())
    }

    $.ajax({
        data: postData,
        dataType: "json",
        url: uri,
        method: "POST",
        success: APIUpdateSuccess,
        error: APIUpdateError
    });
}


function APIUpdateSuccess(result) {

    if (result == null) {
        showAlert('returned no data');
        return;
    }

    if (result.Status != "SUCCESS") {
        showAlert(result.Message);
        return;
    } else {
        if (bReviewByProvider == false) {
            $(".reviewshare").show();
            $(".reviewarea").hide();

            $(':input', '#reviewareacontent').attr("disabled", true);
            $('label').css("pointer-events", "none");
        } else {
            ForceUserHome();
        }


    }
}

function APIUpdateError(result, textStatus, err) {
    showAlert(err);
    return;
}

function formatDollar(inNum) {
    var num = parseFloat(inNum);
    var p = num.toFixed(2).split(".");
    return "$" + p[0].split("").reverse().reduce(function(acc, num, i, orig) {
        return num + (i && !(i % 3) ? "," : "") + acc;
    }, "") + "." + p[1];
}

function RedirectToHomePage() {
    // We are already here...get out...
    if (typeof LoadHomePage != "undefined") {
        return;
    }

    if (user.Persona == "provider") {
        window.location.href = gProviderHomePage;
    } else {
        window.location.href = gCustomerHomePage;
    }
}

function ChangeLabelColor(ClassName, ID) {

    $("." + ClassName).removeClass("btn-white-selected");
    $("." + ClassName).addClass("btn-white");

    $("#" + ID).removeClass("btn-white");
    $("#" + ID).addClass("btn-white-selected");

}

function setView(item, lnkItem) {
    //showConfirm("Sure", "yes", "no", "SendUserHome()", "SendUserHome()");
    if ($("#" + item).is(":visible") == true) {
        $("#" + item).hide();
        $("#" + lnkItem).html("show");
    } else {
        $("#" + item).show();
        $("#" + lnkItem).html("hide");
    }

}

var numbersOnly = /^[0-9]\d+$/;
var decimalOnly = /^\s*-?[0-9]\d*(\.\d{1,2})?\s*$/;
var uppercaseOnly = /^[A-Z]+$/;
var lowercaseOnly = /^[a-z]+$/;
var stringOnly = /^[A-Za-z0-9]+$/;

function testInputData(val, restrictionType) {

    var myData = val;
    if (myData !== '') {
        if (restrictionType.test(myData)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }

}

function ValidMobile(MobileNumber) {

    if (DataLength(RemoveTags(MobileNumber)) == 0) {
        showAlert('Mobile must be entered');
        return false;
    }

    var workMobile = RemoveTags(MobileNumber);

    workMobile = replaceAll(workMobile, "-", "");
    workMobile = replaceAll(workMobile, ".", "");
    workMobile = replaceAll(workMobile, "(", "");
    workMobile = replaceAll(workMobile, ")", "");
    workMobile = replaceAll(workMobile, " ", "");
    if (isNaN(workMobile) == true) {
        showAlert('invalid mobile format');
        return false;
    } else {
        return true;
    }

}

function ValidEmailAddress(address) {

    var atpos = address.indexOf("@");

    var dotpos = address.lastIndexOf(".");

    if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= address.length) {
        return false;
    } else {
        return true;
    }
}

function RemoveTags(inStr) {

    inStr = $.trim(inStr);

    if (inStr == null) {
        return "";
    } else {
        return inStr.toString().replace(/[\<]{1,}[\/]{0,1}[\s]{0,}(script)[\>]{1,}/gi, '');
    }
}

function DataLength(inputstr) {

    if (inputstr == null) {
        return 0;
    } else {
        inputstr = $.trim(inputstr);
        return inputstr.length;
    }
}

function charcount(inputstr, counttype) {
    if (counttype == "upper") {
        return inputstr.replace(/[^A-Z]/g, "").length;
    }
    if (counttype == "lower") {
        return inputstr.replace(/[^a-z]/g, "").length;
    }
    if (counttype == "number") {
        return inputstr.replace(/[^0-9]/g, "").length;
    }
    if (counttype == "special") {
        var pattern = new RegExp(/[~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/); //unacceptable chars
        if (pattern.test(inputstr)) {
            return 1;
        } else {
            return 0;
        }
    }
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function ConvertToOrdinal(num) {
    var last = num.toString().slice(-1);

    var ord = '';

    switch (last) {
        case '1':
            ord = 'st';
            break;
        case '2':
            ord = 'nd';
            break;
        case '3':
            ord = 'rd';
            break;
        default:
            ord = 'th';
            break;
    }

    if (num == 11 || num == 12) {
        ord = "th";
    }


    return num.toString() + ord;
}

//-------------------------------
// Cookie Routines
//-------------------------------
function CleanCookieForNewUser() {

    ResetCookie();
}


function RemoveCookieItem(Key) {

    RemoveCookie(Key);
}

function RemoveCookie(Key) {

    window.localStorage.removeItem(Key);
}

function GetCookieItem(Key) {
    return (window.localStorage.getItem(Key) == "undefined" ? "" : (window.localStorage.getItem(Key) == null ? "" : window.localStorage.getItem(Key)));
}

function UpdateCookieItem(Key, Value) {

    window.localStorage.setItem(Key, Value);
    //SetDateCookie();

    return true;
}


function ResetCookie() {

    window.localStorage.clear();

}

function UpdateCookie(UserID, FirstName, LastName, Persona, Validated, WaiverSigned, ProviderWaiverSigned, ExternalProfileID, ReferralCode) {

    window.localStorage.setItem("UserID", UserID);
    window.localStorage.setItem("FirstName", FirstName);
    window.localStorage.setItem("LastName", LastName);
    window.localStorage.setItem("Persona", Persona);
    window.localStorage.setItem("Validated", Validated);
    window.localStorage.setItem("WaiverSigned", WaiverSigned);
    window.localStorage.setItem("ProviderWaiverSigned", ProviderWaiverSigned);
    window.localStorage.setItem("ExternalProfileID", ExternalProfileID);
    window.localStorage.setItem("ReferralCode", ReferralCode);

    //SetDateCookie();
    return true;
}

//function SetDateCookie()
//{
//    var newDate = new Date();
//    var dateString = "";
//    var bUpdate = false;

//    // Get the month, day, and year.
//    dateString += (newDate.getMonth() + 1) + "/";
//    dateString += newDate.getDate() + "/";
//    dateString += newDate.getFullYear();

//    CookieDate = GetCookieItem("CookieDate");

//    if (CookieDate == "")
//    {
//        bUpdate = true;
//        CookieDate = dateString;
//    }

//    var dateBetween = daysBetween(dateString, CookieDate);

//    if (dateBetween > 0 || bUpdate == true)
//    {
//        UpdateCookieItem("CookieDate", dateString);
//        var userID = GetCookieItem("UserID");
//        if (gMobileVersion == true)
//        {
//            if (GetCookieItem("pushregtoken").length > 0)
//            {
//                UpdateDeviceToken(user.UserID, GetCookieItem("pushregtoken"));
//            }
//            else
//            {
//                initPushwoosh();
//            }  
//        }
//        else
//        {   RemoveCookie("pushregtoken");
//            UpdateDeviceToken(user.UserID, "");
//        }
//    }
//}

function daysBetween(date1in, date2in) {
    //Get 1 day in milliseconds
    var one_day = 1000 * 60 * 60 * 24;
    var date1 = new Date(date1in);
    var date2 = new Date(date2in);

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;

    // Convert back to days and return
    return Math.round(difference_ms / one_day);
}
//-------------------------
// Checkout Routine
//-------------------------
function LoadUserObject(bOnlyLoadUserObject) {

    if (typeof bOnlyLoadUserObject == "undefined") {
        bOnlyLoadUserObject = false;
    }

    user.LastName = (window.localStorage.getItem("LastName") == null ? "" : window.localStorage.getItem("LastName"));
    user.FirstName = (window.localStorage.getItem("FirstName") == null ? "" : window.localStorage.getItem("FirstName"));
    user.WaiverSigned = (window.localStorage.getItem("WaiverSigned") == null ? "" : window.localStorage.getItem("WaiverSigned"));
    user.Validated = (window.localStorage.getItem("Validated") == null ? "" : window.localStorage.getItem("Validated"));
    user.Persona = (window.localStorage.getItem("Persona") == null ? "" : window.localStorage.getItem("Persona").toString().toLowerCase());
    user.UserID = (window.localStorage.getItem("UserID") == null ? "0" : window.localStorage.getItem("UserID"));

    user.ProviderWaiverSigned = (window.localStorage.getItem("ProviderWaiverSigned") == null ? "" : window.localStorage.getItem("ProviderWaiverSigned"));
    user.ExternalProfileID = (window.localStorage.getItem("ExternalProfileID") == null ? "0" : window.localStorage.getItem("ExternalProfileID"));
    user.ReferralCode = (window.localStorage.getItem("ReferralCode") == null ? "" : window.localStorage.getItem("ReferralCode"));

    if (user.UserID == "0") {
        RemoveCookie("pushregtoken");
        RemoveCookie("CookieDate");
        return false;
    }

    // No need to go any further - will redirect...
    if (bOnlyLoadUserObject == true) {
        return true;
    }

    if (user.Persona == "provider") {
        if (GetCookieItem("providercommand") == "bidonjob") {
            //setInterval("SetupDashboard(true, false)", gSettingReportRefreshPollInterval);
        }
    } else {
        RemoveCookie("providercommand");
    }

    //GetVersion();

    //---------------------
    // Do we need to refresh
    // user logging
    //---------------------
    var newDate = new Date();
    var dateString = "";
    var bUpdate = false;

    // Get the month, day, and year.
    dateString += (newDate.getMonth() + 1) + "/";
    dateString += newDate.getDate() + "/";
    dateString += newDate.getFullYear();

    CookieDate = GetCookieItem("CookieDate");

    if (CookieDate == "") {
        bUpdate = true;
        CookieDate = dateString;
    }

    var dateBetween = daysBetween(dateString, CookieDate);

    if (dateBetween > 0 || bUpdate == true) {
        UpdateCookieItem("CookieDate", dateString);

        if (gMobileVersion == true) {
            if (GetCookieItem("pushregtoken").length > 0) {
                UpdateDeviceToken(user.UserID, GetCookieItem("pushregtoken"));
            }
            //  else {
            //      initPushwoosh();
            //  }
        } else {
            RemoveCookie("pushregtoken");
            UpdateDeviceToken(user.UserID, "");
        }
    }
    //--------------------------------
    // Turn off/on Location Stuff
    //--------------------------------
    // for providers, turn on the poll
    // if we need to...
    //---------------------------------

    if (user.Persona == "provider") {
        if (gLocationIntervalID == null) {
            //getLocation("updateLocationInfo();");
            StartLocationPoll();
        }
    } else {
        //////// ---------------------------------------------
        //////// for other types of users, we will only get the 
        //////// data each time they hit the page
        //////// this may be excessive
        ////////--------------------------------------------------
        //////var lat = GetCookieItem("my_lat");
        //////var long = GetCookieItem("my_lng");

        //////if (lat.toString().length == 0 || long.toString().length == 0) {
        //////    getLocation("updateLocationInfo();");
        //////}
        //////else {

        //////}
    }

    StartNotificationPoll();

    return true;
}

function getWebRoot() {

    "use strict";

    var path = window.location.href;

    path = path.substring(0, path.lastIndexOf('/'));

    return path;

}

function GetVersion() {

    var gPath = "../";

    if (gMobileVersion == true) {
        gPath = getWebRoot() + "/";
    }
    // Create a connection to the file.
    var Connect = new XMLHttpRequest();
    // Define which file to open and
    // send the request.

    try {

        Connect.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                var xmlDoc = this.responseXML;
                LoadVersion(xmlDoc);
            }
        };

        var url = gPath + "config.xml";

        Connect.open("GET", url, true);
        Connect.setRequestHeader("Content-Type", "text/xml");
        Connect.send(null);

    } catch (err) {
        UpdateCookieItem("AppVersion", "?");
        return;
    }
}

function LoadVersion(xmlDoc) {

    if (typeof xmlDoc.documentElement == "undefined") {
        UpdateCookieItem("AppVersion", "?");
        return;
    }
    var x = xmlDoc.documentElement.getAttribute('version');
    UpdateCookieItem("AppVersion", x);
}

function CheckLogin() {

    if (LoadUserObject() == true) {
        if (user.UserID == "0") {
            window.location = "../index.html";
            return false;
        } else {
            $("#divUserName").html(user.FirstName + " " + user.LastName);
            return true;
        }
    }
}

//----------------------------
// Logout Routines
//----------------------------
function SilentLogout() {
    return Logout(false);
}

function sureLogout() {


    KillUserCookies();
    window.location.href = "../account/logout.html";

}

function KillUserCookies() {

    RemoveCookie("UserID");
    ResetCookie();
    RemoveCookie("cUserCCList");
    RemoveCookie("cUserAddressList");
    RemoveCookie("ServiceID");
    RemoveCookie("Cart");
    RemoveCookie("LocationSaved");
}

function Logout(warnUser) {


    if (warnUser == null) {
        warnUser = true;
    }

    if (warnUser == true) {
        //showConfirm('Are you sure you want to logout?', 'Yes!', 'No', 'sureLogout();');
        sureLogout();
    } else {
        ResetCookie();
    }

    return true;
}

//----------------------------
// Functional SPAPP routines
//----------------------------
function LoggedInRedirector() {
    return AccountPageRedirector(false);
}

function AccountCreationRedirector() {
    return AccountPageRedirector(true);
}

function StartBAS() {

    RemoveCookie("cart");
    RemoveCookie("enteredDiscountCode");
    //RemoveCookie("ServiceID");
    window.location.href = gCustomerHomePage + "?providerentry=" + (user.Persona == "provider" ? "y" : "n");
}

function ForceUserHome() {
    if (user.Persona == "provider") {
        window.location.href = gProviderHomePage;
    } else {
        window.location.href = gCustomerHomePage;
    }
}

function SendUserHome() {

    //window.location = "../account/preview.html";
    //return;


    //alert(1);
    if (GetCookieItem("ServiceID").length > 0) {
        //window.location = "../cart/what.html";
        window.location = gCustomerHomePage;
    } else {
        // We are already here...get out...
        if (typeof LoadHomePage != "undefined") {
            return;
        }

        if (user.Persona == "provider") {
            window.location.href = gProviderHomePage;
        } else {
            window.location.href = gCustomerHomePage;
        }
    }
}

function AccountPageRedirector(duringSignup) {

    //-----------------------
    // Only reload user object
    // true as parameter
    //-----------------------
    var myLastName = (window.localStorage.getItem("LastName") == null ? "" : window.localStorage.getItem("LastName"));
    var myFirstName = (window.localStorage.getItem("FirstName") == null ? "" : window.localStorage.getItem("FirstName"));
    var myWaiverSigned = (window.localStorage.getItem("WaiverSigned") == null ? "" : window.localStorage.getItem("WaiverSigned"));
    var myValidated = (window.localStorage.getItem("Validated") == null ? "" : window.localStorage.getItem("Validated"));
    var myPersona = (window.localStorage.getItem("Persona") == null ? "" : window.localStorage.getItem("Persona").toString().toLowerCase());
    var myUserID = (window.localStorage.getItem("UserID") == null ? "0" : window.localStorage.getItem("UserID"));

    var myProviderWaiverSigned = (window.localStorage.getItem("ProviderWaiverSigned") == null ? "" : window.localStorage.getItem("ProviderWaiverSigned"));
    var myExternalProfileID = (window.localStorage.getItem("ExternalProfileID") == null ? "0" : window.localStorage.getItem("ExternalProfileID"));

    var IsThisComingFromSignup = (duringSignup == null ? false : duringSignup);

    if (myUserID == "" || myUserID == "0") {
        return;
    }

    // Must add waive to this Validation

    if (myWaiverSigned != "true") {
        window.location.href = "../account/waiver.html";
        return false;
    }
    //else if (myPersona == "provider" && myProviderWaiverSigned != "true") {
    //    window.location.href = "../account/waiver.html?provider=true";
    //    return false;
    //}
    else if (myValidated == "false") {
        if (IsThisComingFromSignup == true) {

            window.location.href = "../index.html";
            return false;
        } else {
            window.location.href = "../account/notvalidated.html";
            return false;
        }
    } else {
        if (myPersona == "") {
            window.location.href = "../profile/selectpersona.html";
            return false;
        } else {

            var url = window.location.toString().toLowerCase();

            if (IsThisComingFromSignup == true || (typeof LoadHomePage == "undefined")) {
                GetCookieItem("ServiceID")
                if (GetCookieItem("ServiceID").length > 0 && GetCookieItem("ServiceID") != "-1") {
                    //                    window.location = "../cart/what.html";
                    window.location = gCustomerHomePage;
                } else {
                    if (myPersona == "provider") {
                        // Make sure not to loop - already there...
                        if (url.indexOf(gProviderHomePage) < 0) {
                            window.location.href = gProviderHomePage;
                        }
                    } else {
                        // Make sure not to loop - already there...
                        if (url.indexOf(gCustomerHomePage) < 0) {
                            window.location.href = gCustomerHomePage;
                        }
                    }
                }
            }

        }
    }


}

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}
//------------------------
// Password Functions
//------------------------

function ValidatedPassword(password, confirmedpassword) {

    password = $.trim(password);
    confirmedpassword = $.trim(confirmedpassword);

    if (password != confirmedpassword) {
        showAlert('passwords do not match');
        return false;
    }

    var failedmsg = "password must have at least 7 characters and a number";

    if (password.length < 7) {
        showAlert(failedmsg);
        return false;
    }

    //if (charcount(password, "upper") == 0) {
    //    showAlert(failedmsg);
    //    return false;
    //}
    if (charcount(password, "number") == 0) {
        showAlert(failedmsg);
        return false;
    }
    //if (charcount(password, "special") == 0) {
    //    showAlert(failedmsg);
    //    return false;
    //}



    return true;
}

//------------------------------
// Provider Work Status
//------------------------------
function UpdateStatusUIIcon() {

    var ColStatus = (gAvailableForWork == true ? 'green' : 'red');
    $('#workstatus').css('background-color', ColStatus);

}

//----------------------------
// Carts
//----------------------------

function BuildCartInputObject(cart) {
    // build Address Object
    var AddressObject = new Object();
    if (cart.locationID == null) {
        cart.locationID = "-1";
    }
    if (cart.locationID.length > 1) {
        AddressObject = {
            AddressID: cart.locationID
        }
    }
    // build Cart Object
    var CreditCardObject = new Object();
    if (cart.creditCardID.length > 1) {
        CreditCardObject = {
            CreditCardID: cart.creditCardID
        }
    }
    // build Offering Object and add 
    // to the array
    var OfferingObject = new Object();
    var OfferingArray = new Array();

    for (var i = 0; i < cart.cartItems.length; i++) {
        OfferingObject = new Object();
        OfferingObject = {
            CartOfferingID: cart.cartItems[i].itemID,
            CartSubOfferingID: cart.cartItems[i].itemSubID,
            CartOfferingType: cart.cartItems[i].itemType,
            CartServiceID: cart.cartItems[i].itemServiceID,
            CartDiscountApplied: cart.cartItems[i].itemDiscountApplied,
            CartDiscountCodeID: cart.cartItems[i].itemDiscountCodeID
        }
        OfferingArray.push(OfferingObject);
    }
    // build Offering Object and add 
    // to the array
    var AdditionalQuestionObject = new Object();
    var AdditionalQuestionArray = new Array();

    if (cart.additionalQuestions != null) {

        for (var i = 0; i < cart.additionalQuestions.length; i++) {
            AdditionalQuestionObject = new Object();
            AdditionalQuestionObject = {
                AdditionalQuestionID: cart.additionalQuestions[i].ID,
                AdditionalQuestionAnswer: cart.additionalQuestions[i].answer
            }
            AdditionalQuestionArray.push(AdditionalQuestionObject);
        }
    }

    var dt = new Date();
    //dt = Date.now();

    var data = {
        cartinput: {
            FirstName: cart.FirstName,
            LastName: cart.LastName,
            UserMobile: cart.UserMobile,
            Status: "",
            Message: "",
            CartItems: OfferingArray,
            CartAddress: AddressObject,
            CartCreditCard: CreditCardObject,
            UserID: user.UserID,
            JobStatus: 'init',
            ProviderUserID: cart.ProviderUserID,
            ReviewID: 0,
            ProviderReviewID: 0,
            GratuityCartID: 0,
            TransactionDateDisplay: dt.toDateString() + " " + dt.toTimeString(),
            TransactionDateUTC: dt.toUTCString(),
            CartAdditionalQuestion: AdditionalQuestionArray,
            JobNote: cart.Note,
            DiscountCode: cart.discountCode,
            TipAmount: cart.tipAmount,
            MarketingLinkID: cart.MarketingLinkID,
            RebookJobID: cart.RebookJobID,
            //Procart.ProviderUserID = RemoveTags(PreferredProviderID);
        }
    };
    return data;
}
var gCartReadOnly = false;

function LoadCartDisplay(cart, readonly, htmlObject) {
    gCartReadOnly = readonly;
    gHTMLObject = htmlObject;
    var uri = ServicePrefix + "/api/GetCartDisplay/";

    var data = BuildCartInputObject(cart);

    $.ajax({
        data: data,
        dataType: "json",
        url: uri,
        method: "POST",
        //success: LoadCartDisplaySuccess,
        error: LoadCartDisplayFailure
    }).done(function(result) {
        LoadCartDisplaySuccess(result);
    });

}

function LoadCartDisplaySuccess(result) {

    if (result == null) {
        showAlert('returned no data');
        return;
    }

    if (result.Status != null) {
        if (result.Status != "SUCCESS") {
            showAlert(result.Message);
            return;
        } else {
            if (result.Results.length > 0) {
                LoadCartUIResults(result, gCartReadOnly);
            } else {
                return;
            }
        }
    } else {
        return;
    }
}

function LoadCartDisplayFailure(jqXHR, textStatus, err) {
    showAlert(textStatus);
    return false;
}

function showlongdescription(bShow) {
    if (bShow == true) {
        $("#divCartOfferingDetailsLess").hide();
        $("#divCartOfferingDetailsMore").show();
    } else {
        $("#divCartOfferingDetailsLess").show();
        $("#divCartOfferingDetailsMore").hide();

    }
}

function LoadCartUIResults(dbResults, readonly) {



    var work = "";

    var obj = dbResults.Results[0];

    work = work + "<div style='font-size:smaller;width:100%'>";

    var totalCost = 0.00;
    var changeLink = "";
    gTotalCost = 0;

    // WHAT
    work = work + "<div class='row' style='font-size:14px;font-weight:100;padding-top:8px;padding-bottom:3px;margin-bottom:5px;border-bottom:silver 1px solid;font-family:ITCAvantGardePro-Bold'>SERVICE</div>";
    //if (readonly == false) {
    //    //changeLink = '<span style="font-weight:100"><button type="button" class="btn btn-xs btn-primary"  id="lnkChangeWhat" onclick="ChangeCartItem(\'' + 'what.html?upd=y' + '\')">change</button></span>';
    //    changeLink = '<span style="font-weight:100"><button type="button" class="btn btn-xs btn-primary"  id="lnkChangeWhat" onclick="ChangeCartWhatItem(\'' + 'index.html?upd=y' + '\')">change</button></span>';
    //    work = work + "<div style='font-weight:800;padding-top:5px'>" + changeLink + "</div>";
    //}

    //work = work + "<div class='row' style='margin-left:0px;margin-right:0px; font-weight:800'><div class='col-xs-12'>" + obj.Service + "</div></div>";

    for (var i = 0; i < obj.CartItems.length; i++) {
        work = work + "<div class='row noPadding' style='margin-left:0px;margin-right:0px'>";


        var leftpad = "";
        if (obj.CartItems[i].CartOfferingType.toLowerCase() == "serviceoffering") {
            leftpad = "";
        } else {
            leftpad = " - ";
        }

        cart.cartItems[i].itemCost = obj.CartItems[i].CartOfferingCost;

        var shortdesclen = 150;

        totalCost = totalCost + parseFloat(obj.CartItems[i].CartOfferingCost);

        work = work + "<div class='col-xs-9 noPadding' style='margin-left:0px;margin-right:0px;font-size:" + (obj.CartItems[i].CartOfferingType.toLowerCase() == "serviceoffering" ? "22px" : "14px") + ";color:" + gColors.PeacefulGray + "'class='col-xs-9 noPadding' >" + leftpad + obj.CartItems[i].CartOfferingDescription
        work = work + "</div>";
        work = work + "<div class='col-xs-3 noPadding'  style='margin-left:0px;margin-right:0px;text-align:right;color:" + gColors.Turquoise + ";font-size:14px;font-family:ITCAvantGardePro-Bold' class='col-xs-3'>" + (obj.CartItems[i].CartOfferingCost == 0 ? "" : "$" + obj.CartItems[i].CartOfferingCost.toFixed(2)) + "</div>";

        work = work + "</div>";

        if (obj.CartItems[i].CartOfferingType.toLowerCase() == "serviceoffering") {
            work = work + "<div class='row noPadding' style='margin-left:0px;margin-right:0px'>";

            work = work + "<div id='divCartOfferingDetailsLess'>";

            work = work + "<div class='col-xs-12 noPadding'  style='color:" + gColors.PeacefulGray + ";font-size:14px;padding-left;0px;'>";
            work = work + (obj.CartItems[i].CartOfferingLongDescription.length > shortdesclen ?
                    obj.CartItems[i].CartOfferingLongDescription.substring(0, shortdesclen) + "..." :
                    obj.CartItems[i].CartOfferingLongDescription) +
                (obj.CartItems[i].CartOfferingLongDescription.length > shortdesclen ?
                    "<a href='#' style='color:#00A499' onclick='showlongdescription(true)'>&nbsp;More</a>" :
                    "</div>");
            work = work + "</div>";
            work = work + "</div>";

            work = work + "<div id='divCartOfferingDetailsMore' style='display:none'>";

            work = work + "<div class='col-xs-12 noPadding' style='color:" + gColors.PeacefulGray + ";font-size:14px;padding-left;0px;'>";
            work = work + obj.CartItems[i].CartOfferingLongDescription;
            work = work + (obj.CartItems[i].CartOfferingLongDescription.length > shortdesclen ?
                "<a href='#'  style='color:#00A499' onclick='showlongdescription(false)'>&nbsp;Less</a>" :
                "</div>");
            work = work + "</div>";
            work = work + "</div>";


            work = work + "</div>";
        }
    }

    gTotalDiscountableCost = totalCost;

    totalCost = totalCost - gDiscountDollars;

    // Discounts
    var discountDisplay = (gDiscountDollars > 0 ? '' : ';display:none');

    work = work + "<div id='divDiscountRow' class='row noPadding' style='margin-left:0px;margin-right:0px" + discountDisplay + "'>";
    work = work + "<div style='font-size:14px;margin-left:0px;margin-right:0px;color:red'class='col-xs-9 noPadding' >Discount</div>";
    work = work + "<div style='margin-left:0px;margin-right:0px;text-align:right;color:red;font-size:14px;font-family:ITCAvantGardePro-Bold;' class='col-xs-3 noPadding' id='divDiscountDollars'>" + (gDiscountDollars == 0 ? "" : "$" + gDiscountDollars) + "</div>";
    work = work + "</div>";

    gTotalCost = totalCost;

    UpdateCookieItem("CartCost", "$" + totalCost.toFixed(2).toString());

    // Pulls Pct
    CartgenerateTip(totalCost);

    gTotalDiscountableSubCost = totalCost;

    //// Sub Total
    //if (gPreTip > 0) {
    //    work = work + "<div id='divSubTotal' class='row'style='" + (gPreTip == 0 ? 'display:none;' : '') + "margin-left:0px;margin-right:0px;margin-bottom:5px'>";
    //    work = work + "<div class='col-xs-9' style='margin-left:0px;margin-right:0px;'>SUB-TOTAL</div>";
    //    work = work + "<div class='col-xs-3' style='margin-left:0px;margin-right:0px;text-align:right'>$<span id='SubtotalCost'>" + totalCost.toFixed(2) + "</span></div>";
    //    work = work + "</div>";
    //}


    // Pre Tip
    work = work + "<div id='preTip' class='row noPadding'style='" + (gPreTip == 0 ? 'display:none;' : '') + "margin-left:0px;margin-right:0px'>";
    work = work + "<div class='col-xs-9 noPadding' style='font-size:14px;margin-left:0px;margin-right:0px;color:" + gColors.PeacefulGray + ";'>TIP</div>";
    work = work + "<div class='col-xs-3 noPadding' style='margin-left:0px;margin-right:0px;text-align:right;color:" + gColors.Turquoise + ";font-size:14px;font-family:ITCAvantGardePro-Bold'>$<span id='spnpreTip' >" + gPreTip + "</span></div>";
    work = work + "</div>";

    var tCost = parseFloat(gPreTip) + parseFloat(gTotalCost);



    // WHERE


    if (cart.locationID == -1) {

        obj.CartAddress.AddressLine1 = GetCookieItem("my_address") + " " + GetCookieItem("my_address2");
        obj.CartAddress.City = GetCookieItem("my_city");
        obj.CartAddress.State = GetCookieItem("my_state") + " ";
        obj.CartAddress.ZipCode = GetCookieItem("my_zip");
        obj.CartAddress.Country = GetCookieItem("my_country");

        // Load UI
        LoadUIInputs();

        cart.locationLat = GetCookieItem("my_lat");
        cart.locationLng = GetCookieItem("my_lng");
    }

    if (cart.locationID != 0) {
        changeLink = "";

        if (readonly == false) {

            if (cart.locationID == -1) {
                changeLink = '<button id="lnkChangeWhere" type="button" class="btn btn-xs btn-success" style="border-radius:0%;background-color:transparent!important;border:none" onclick="ShowGeoAddress()"><img src="../assets/common/images/arrow-down-silver.png" /></button>';
            } else {
                changeLink = '<button id="lnkChangeWhere" type="button" class="btn btn-xs btn-success" style="border-radius:0%;background-color:transparent!important;border:none"onclick="ChangeCartWhatItem(\'' + 'index.html?upd=y' + '\')"><img src="../assets/common/images/arrow-down-silver.png" /></button>';
            }

            work = work + "<div class='row noPadding' style='font-size:14px;padding-top:15px;padding-bottom:3px;font-weight:800;border-bottom:#808080 1px solid;'>";
            work = work + "<div class='col-xs-12 noPadding' style='vertical-align:bottom;padding-right:5px;font-size:14px;font-weight:100;font-family:ITCAvantGardePro-Bold'>LOCATION</div>";
            //work = work + "<div style='display:table-cell'>" + changeLink + "</div>";
            work = work + "</div>";
            work = work + "</div>";


            //work = work + "<div class='row noPadding'>";
            //work = work + "<div class='col-xs-11' style='padding-top:0px;font-weight:800'>"  + (obj.CartAddress.AddressLine1 != null ? "" : "<span style='color:red'>&nbsp;!!!&nbsp;<span>") + "</div>";
            //work = work + "<div class='col-xs-1' >" + changeLink + "</div>";
            //work = work + "</div>";
        } else {
            work = work + "<div class='row' style='font-size:14px;padding-top:15px;font-weight:800;border-bottom:#808080 1px solid'>";

            work = work + "<div style='display:table-cell;vertical-align:bottom;padding-right:5px;font-size:14px;font-weight:800;font-family:ITCAvantGardePro-Bold'>LOCATION</div>";
            work = work + "<div style='display:table-cell'>" + changeLink + "</div>";

            work = work + "</div>";
        }


        if (obj.CartAddress.AddressLine1 != null) {
            work = work + "<div class='row noPadding' style='padding-top:0px;" + gColors.PeacefulGray + "'>";

            gCustomerToAddressForReview = obj.CartAddress.AddressLine1 + " " + obj.CartAddress.City + ', ' + obj.CartAddress.State + ' ' + obj.CartAddress.ZipCode;

            work = work + "<div class='col-xs-11 noPadding'>";
            work = work + "<span id='sAddress1' style='color:" + gColors.PeacefulGray + ";font-size:14px'>" + obj.CartAddress.AddressLine1 + '</span>';
            work = work + "<span id='sAddress2' style='color:" + gColors.PeacefulGray + ";font-size:14px'>" + (!obj.CartAddress.AddressLine2 ? "" : ", " + obj.CartAddress.AddressLine2) + "</span>";
            work = work + "</div>";
            work = work + "<div class='col-xs-1 noPadding'>" + changeLink + "</div>";
            work = work + "</div>";

            work = work + "<div class='row noPadding' style='padding-top:0px;'>";
            work = work + "<div class='col-xs-11 noPadding'><span id='sCity' style='color:" + gColors.PeacefulGray + ";font-size:14px'>" + obj.CartAddress.City + "</span>,&nbsp;<span style='color:" + gColors.PeacefulGray + ";font-size:14px' id='sState'>" + obj.CartAddress.State + "</span>&nbsp;<span style='color:" + gColors.PeacefulGray + ";font-size:14px' id='sZipCode'>" + obj.CartAddress.ZipCode + "</span></div>";

            if (typeof updatelocationdisplayWithProviders != "undefined") {
                gToLat = cart.locationLat;
                gToLng = cart.locationLng;
                updatelocationdisplayWithProviders(gCustomerToAddressForReview, gZoom);
            }
            work = work + "<div class='col-xs-1 noPadding'>&nbsp;</div>";
            work = work + "</div>";

        }

    }


    //////{
    //////    //changeLink = "";
    //////    //if (readonly == false) {
    //////    //    changeLink = '<span style="font-weight:100"><button type="button" class="btn btn-xs btn-primary" id="lnkChangeWhen" onclick="ChangeCartItem(\'' + 'when.html?upd=y' + '\')">change</button></span>';
    //////    //    work = work + "<div style='padding-top:5px;font-weight:800'>" + changeLink + "</div>";
    //////    //}
    //////    //else {
    //////        work = work + "<div class='row' style='padding-top:5px;font-weight:800;'>When</div>";
    //////    //}


    //////    work = work + "<div class='col-xs-12'>" + cart.serviceDeliveryDateTime + "</div>";


    //////}



    //work = work + "</div>";
    var gTotalLine = ""

    if (obj.CartItems.length > 0) {
        gTotalLine = gTotalLine + "<div class='row noPadding' style='height:21px;background:rgba(0,0,0,0.15);margin-left:0px;margin-right:0px;margin-top:0px;margin:0 auto;border-bottom:white 1px solid'>";

        gTotalLine = gTotalLine + "<div class='col-xs-12 noPadding' style='font-family:ITCAvantGardePro-Bold;color:#5B6770;background-color:transparent!important;padding-top:0px;padding-bottom:0px;margin-left:0px;margin-right:0px;text-align:center;font-size:14px'>Total</div>";
        gTotalLine = gTotalLine + "</div>";


        gTotalLine = gTotalLine + "<div class='row noPadding'style='height:21px;color:black;background-color:rgba(0,0,0,0.15);margin-left:0px;margin:0px 0px 0px 0px;'>";


        gTotalLine = gTotalLine + "<div class='col-xs-6 noPadding'  style='font-size:14px;height:21px;background-color:transparent!important;border-right:white solid 1px;margin:0px 0px 0px 0px;text-align:center;padding-top:0px;padding-bottom:0px;color:#5B6770;font-family:ITCAvantGardePro-Bold'><span id='totalCost' style='font-family:ITCAvantGardePro-Bold'>$" + tCost.toFixed(2) + "</span></div>";

        gTotalLine = gTotalLine + "<div class='col-xs-6 noPadding' style='font-size:14px;height:21px;background-color:transparent!important;padding-top:0px;padding-bottom:0px;margin:0px 0px 0px 0px;text-align:center;color:#5B6770;'>";


        // PAYMENT
        changeLink = "";
        changeLink = '<div style="font-weight:100;font-size:14px;padding-top:0px;padding-left:5px;display:inline-block;">';
        changeLink = changeLink + '<button id="lnkChangePayment" type="button" class="btn btn-xs btn-success" style="margin-top:0px;border-radius:0%;background-color:transparent!important;border:none"  onclick="ChangeCartItem(\'' + 'payment.html?upd=y' + '\')"><img src="../assets/common/images/arrow-down-grey.png" style="vertical-align:top;margin-top:5px" /></button></div>';

        if (obj.CartCreditCard.CreditCardNumber != null || (!cart.creditCardID)) {
            gCCEXMM = parseInt(obj.CartCreditCard.CreditCardExpMM);
            gCCEXYYYY = parseInt(obj.CartCreditCard.CreditCardExpYYYY);
            gTotalLine = gTotalLine + '<div style="font-weight:100;font-size:14px;padding-top:0px;display:inline-block;">' + obj.CartCreditCard.CreditCardNumber.slice(-4) + " " + obj.CartCreditCard.CreditCardExpMM + "-" + obj.CartCreditCard.CreditCardExpYYYY.slice(-2) + "</div>";
            gTotalLine = gTotalLine + " " + changeLink;
        } else {
            gTotalLine = gTotalLine + "<div style='display:inline-block;color:red'> !!! </div>" + changeLink;
            cart.creditCardID = "-1";
            UpdateCookieItem("cart", JSON.stringify(cart));
        }


        gTotalLine = gTotalLine + "</div>";
        $("#gTotalLine").html(gTotalLine);


        //work = work + "</div>";


        work = work + "</div>";

    }

    UpdateCookieItem("cart", JSON.stringify(cart));

    // Manually entered will win
    if (GetCookieItem("enteredDiscountCode").length > 0) {
        CheckDiscountCode(GetCookieItem("enteredDiscountCode"), true);
    } else if (GetCookieItem("autoapplyDiscountCode").length > 0) {

        CheckDiscountCode(GetCookieItem("autoapplyDiscountCode"), true);
    }

    // Get Provider List only - NO MORE MAPSSSS
    if (typeof updatelocationdisplay != "undefined") {
        updatelocationdisplay();
    }


    if (gHTMLObject.length > 0) {
        $("#" + gHTMLObject).html(work);
        ReleasePage();
    } else {
        showAlert(work, 'na', "Done");
    }
}



function CartgenerateTip(totalCost) {


    gPreTip = (totalCost * gPreTipPct);

    gPreTip = gPreTip.toFixed(2);
    $("#page2Tip").html(gPreTip);

}

function LoadCart() {
    return JSON.parse(GetCookieItem('cart'));
}

function GetOfferingDescription(itemID, itemType) {
    var uri = "";

    if (itemType.toLowerCase == "serviceoffering") {
        uri = ServicePrefix + "/api/GetServiceOfferingInfo/?serviceofferingid=" + itemID;
    } else {
        uri = ServicePrefix + "/api/GetServiceSubOfferingInfo/?servicesubofferingid=" + itemID;
    }

    $.get(uri).then(function(result) {
        if (!result) {
            showAlert('returned no data');
            return;
        }

        if (result.Status != "SUCCESS") {
            showAlert(result.Message);
            return;
        }

        if (result.Results.length > 0) {

            if (itemType.toLowerCase() == "serviceoffering") {
                return result.Results[0].ServiceOfferingName;
            } else {
                return result.Results[0].ServiceSubOfferingName;
            }
        }

    });

}

function ChangeCartWhatItem(file) {

    window.location = "../customer/" + file;

}

function ChangeCartItem(file) {

    window.location = "../cart/" + file;

}
//-----------------------
// Access Area
//-----------------------
function ProviderAccess() {
    if (user.Persona.toLowerCase() != "provider") {
        showAlert('You do not have access to this area', 'SendUserHome();');
        return false;
    } else {
        return true;
    }
}

//-----------------------
// Common UI
//------------------------

function ResetMenuItems() {

    $("#lnkDashboard").prop("href", gProviderHomePage);

    $("#lnkBASProvider").prop("href", gCustomerHomePage);

    $("#lnkBASCustomer").prop("href", gCustomerHomePage);
}


function CheckDoNotDisturbSetting() {


    var cDate = new Date();
    var cDay = cDate.getDay();


    var dndDay = GetCookieItem("dndDay");
    ////LogIt(dndDay);

    // Has it been set
    if (dndDay.length == 0) {
        GetDoNotDisturbSetting(cDay);
        return;
    }

    // Is it a new day

    if (cDay.toString() != dndDay) {
        GetDoNotDisturbSetting(cDay);
        return;
    }

    var cHour = cDate.getHours();
    var cMinutes = cDate.getMinutes();
    var cDateTime = (cHour * 100) + cMinutes;

    var dndFrom = GetCookieItem("dndFrom");
    var dndTo = GetCookieItem("dndTo");
    ////LogIt(dndFrom);
    ////LogIt(dndTo);
    ////LogIt(cDateTime);

    if (dndFrom.toString().length == 0) {
        GetDoNotDisturbSetting(cDay);
        return;
    }

    if (dndTo.toString().length == 0) {
        GetDoNotDisturbSetting(cDay);
        return;
    }

    if (cDateTime >= parseInt(dndFrom) && cDateTime <= parseInt(dndTo)) {
        UpdateCookieItem("ProviderActive", true);

        $("#dndCircle").css("background-color", "green");
    } else {
        UpdateCookieItem("ProviderActive", false);
        $("#dndCircle").css("background-color", "red");
    }
    ////LogIt(GetCookieItem("ProviderActive"));
    //    // check dnddate cookie with today
    ///*
    //if different go get new api setting

    //if empty go get api setting

    //if in window set active provider cookie else shut it
    //*/
}

function GetDoNotDisturbSetting(cDay) {

    UpdateCookieItem("dndDay", cDay);

    UpdateCookieItem("dndFrom", 800);
    UpdateCookieItem("dndTo", 2000);



    var uri = ServicePrefix + '/api/GetProviderDoNotDisturbSetting/?userid=' + GetCookieItem("UserID") + "&day=" + cDay;;

    $.get(uri).then(function(result) {
        if (result == null) {
            showAlert('returned no data');
            return;
        }

        if (result.Status != null) {
            if (result.Status != "SUCCESS") {
                showAlert(result.Message);
                return;
            } else {

                if (result.Results.length > 0) {
                    var FromHour = result.Results[0].DoNotDisturbSettings.ProviderDoNotDisturbFromHour;
                    var FromMunutes = result.Results[0].DoNotDisturbSettings.ProviderDoNotDisturbFromMinute;
                    var FromAM = result.Results[0].DoNotDisturbSettings.ProviderDoNotDisturbFromAM;
                    var ToHour = result.Results[0].DoNotDisturbSettings.ProviderDoNotDisturbToHour;
                    var ToMinutes = result.Results[0].DoNotDisturbSettings.ProviderDoNotDisturbToMinute;
                    var ToAM = result.Results[0].DoNotDisturbSettings.ProviderDoNotDisturbToAM;
                    //LogIt(ToHour);
                    //LogIt(ToMinutes);

                    UpdateDoNotDisturbFromToCookie(FromHour, FromMunutes, FromAM, ToHour, ToMinutes, ToAM);

                }

            }
        } else {}
    });


}

function UpdateDoNotDisturbFromToCookie(FromHour, FromMinutes, FromAM, ToHour, ToMinutes, ToAM) {

    var api_dndFrom = parseInt(FromHour) * 100;
    api_dndFrom = api_dndFrom + parseInt(FromMinutes);

    if (FromAM == false && (FromHour != 0)) {
        api_dndFrom = api_dndFrom + 1200;
    }


    var api_dndTo = parseInt(ToHour) * 100
    api_dndTo = api_dndTo + parseInt(ToMinutes);


    ////if (ToAM == false && (ToHour != 0)) {
    ////    api_dndTo = api_dndTo + 1200;
    ////}

    if (api_dndFrom == api_dndTo) {
        api_dndFrom = 800;
        api_dndTo = 2000;
    }



    UpdateCookieItem("dndFrom", api_dndFrom);
    UpdateCookieItem("dndTo", api_dndTo);

}

function LoadAddThis() {
    // Add This to the Body
    var file = "//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-57f661f5f31e9420";
    file = "//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-57f661f5f31e9420&async=1";

    var d = document,
        h = d.getElementsByTagName('body')[0],
        s = d.createElement('script');
    s.type = 'text/javascript';
    s.async = false;
    s.src = file;
    h.appendChild(s);

    initAddThis();


}

function initAddThis() {
    if (typeof addthis == "undefined") {
        setTimeout(initAddThis, 3000);
        return;
    } else {
        addthis.init();
        //addthis.layers.refresh();
    }
}

function BuildCommonUI() {

    // -------------------------------------
    // Header build
    // -------------------------------------

    //BuildHeader();

    // -------------------------------------
    // Menu
    //--------------------------------------

    // -----------------------------
    // function for the siderbar
    // -----------------------------
    $(document).ready(function() {

        if (GetCookieItem("Persona").toString().toLowerCase() == "provider") {
            CheckDoNotDisturbSetting();
            setInterval(CheckDoNotDisturbSetting, gDoNotDisturbPollInterval);
        }

        appPush.initialize();

        var animateSpeed = 300;
        // Set View Port...
        //document.getElementById('metaViewport').setAttribute("content", "user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height");
        var windowmax = 600;
        var menuPct = .75;

        var w = window.innerWidth;
        var menuMax = parseInt(windowmax * menuPct);

        // Calc Menu Width
        w = parseInt(w * .75);

        if (w > menuMax) {
            w = menuMax;
        }


        //LogIt('width');
        //LogIt(w);
        //LogIt('width');
        $("#spa-menu-list span").css("font-family", "Zapf Dingbats");

        if (user.Persona == "provider") {
            $("#spa-menu-list  li").css("padding", "9px 5px 8px 9px");
        } else {
            $("#spa-menu-list li").css("padding", "12px 5px 8px 12px");
        }

        $("#spa-menu-list").css("width", '' + w + 'px');
        //$("#spa-menu-list").addClass("grad");


        $("#spa-menu-wrap, #spa-menu-container").css('width', $("#spa-menu-wrap").css("width"));

        $("#spa-menu-container").attr("class", "spa-menu-container");

        $("#spa-menu-container").css("left", '-' + w + 'px');

        $("#spa-menu-container").attr("spa-menustatus", "");

        $("#btnOpenMenu, #divUserName, #cover, #spa-menu-list").click(function(event) {
            disabledEventPropagation(event);
            $("#spa-menu-wrap, #spa-menu-container, #spa-menu-list").css('height', $("#spa-menu-container").css("height"));

            if ($("#spa-menu-container").attr("spa-menustatus") == "") {
                $("#spa-menu-container").attr("spa-menustatus", "open");

                $("#spa-menu-container").animate({
                    marginLeft: '+=' + w + 'px'
                }, animateSpeed);
                $("#cover").show();
            } else {

                $("#cover").hide();
                $("#spa-menu-container").animate({
                    marginLeft: '-=' + w + 'px'
                }, animateSpeed);

                $("#spa-menu-container").attr("spa-menustatus", "");
            }
        });

        //$("#spa-menu-container").click(function () {

        //    if (!$("#spa-menu-container").attr("spa-menustatus") == "") {
        //        $("#spa-menu-container").animate({
        //            marginLeft: '-=' + w + 'px'
        //        }, animateSpeed);
        //        $("#spa-menu-container").attr("spa-menustatus", "");
        //    }
        //});
        //setFormHeight();
    });
    $(".list-unstyled").html("");
    $(".list-unstyled").append("<div style='height:89px;padding-top:35px;padding-left:32px;border-bottom:solid 1px white;margin-bottom:10px'class='headerPadding'  id='divUserName'>" + (user.FirstName.length > 0 ? user.FirstName : "Welcome") + "</div>");

    if (user.Persona.toLowerCase() == "provider") {
        $(".list-unstyled").append(BuildMenuItemHTML("lnkDashboard", "../provider/providertools.html", "artisttools", "Artist Tools"));
        $(".list-unstyled").append(BuildMenuItemHTML("lnkBASProvider", gCustomerHomePage + "?providerentry=Y", "book", "Treatment"));
    }

    // ----------------------
    // Standard Entries
    //-----------------------
    if (gMobileVersion == true) {
        $(".list-unstyled").append(BuildMenuItemHTML("lnkTellAFriend", "../profile/tellafriend.html", "tellafriend", "Tell my Friends"));
    }

    $(".list-unstyled").append(BuildMenuItemHTML("lnkBookingHistory", "../cart/jobs.html?jobid=0&provider=false&statusgroup=history", "history", "History"));
    $(".list-unstyled").append(BuildMenuItemHTML("lnkPayments", "../profile/profilecreditcardmanager.html", "payments", "Payments"));
    $(".list-unstyled").append(BuildMenuItemHTML("lnkAddresses", "../profile/profileaddressmanager.html", "addresses", "Addresses"));
    $(".list-unstyled").append(BuildMenuItemHTML("lnkHelp", "../profile/help.html", "support", "Can we help?"));
    $(".list-unstyled").append(BuildMenuItemHTML("lnkEditProfile", "../profile/editprofile.html", "editprofile", "Edit Profile"));

    // Create our logout row;

    var lor = "";
    lor = lor + '<a id="lnkLogout" href="#" onclick="Logout(true);"><li class="menudetail"><div style="padding-top:5px">' + MenuIcon('logout') + '<div style="display:inline-block">' + 'Logout' + '</div><div style="display:inline-block;padding-right:33px;float:right">' + GetCheckMark(12, "rightarrow") + '</div></div></li></a>';
    $(".list-unstyled").append(lor);

    // Create our logout row;

/*    var lor = "";
    lor = lor + '<div class="footer-auto" style="width:100%;height:48px;padding-top:8px;background:rgba(0,0,0,0.20)">';
    lor = lor + '<a id="lnkLogout" href="#" onclick="Logout(true);">';
    lor = lor + '<div class="menudetailfooter col-xs-9 noPadding" style="display:inline-block;margin-top:auto;margin-bottom:auto">' + MenuIcon('logout') + 'Logout</div></a>';   
    lor = lor + " </div>";
    $("#spa-menu-list").after(lor);*/

    updateMarketingInfoAppLocation();

    // -------------
    // Create a hidden modal for alert
    // -------------

    var divmodal = document.createElement("div");

    //var divmodalid = document.createAttribute("id");
    divmodal.setAttribute("id", "modalalert");

    //var divmodalclass = document.createAttribute("class");
    divmodal.setAttribute("class", "modal ");

    //var divtabindex = document.createAttribute("tabindex");
    divmodal.setAttribute("tabindex", "-1");

    //var divrole = document.createAttribute("role");
    divmodal.setAttribute("role", "dialog");

    var divvertical = document.createElement("div");
    //var divverticalclass = document.createAttribute("class");
    divvertical.setAttribute("class", "vertical-alignment-helper");

    var divdialog = document.createElement("div");
    //var divdialogclass = document.createAttribute("class");
    divdialog.setAttribute("class", "modal-dialog vertical-align-center modal-sm");

    //var divdialogAllSet = document.createElement("div");
    ////var divdialogclass = document.createAttribute("class");
    //divdialog.setAttribute("class", "AllSet");
    //divdialogAllSet.setAttribute("style", "font-size:32pt;color:red");
    //divdialog.appendChild(divdialogAllSet);


    var divdialogcontent = document.createElement("div");
    //var divdialogcontentclass = document.createAttribute("class");
    divdialogcontent.setAttribute("class", "modal-content");

    var divdialogbody = document.createElement("div");
    //var divdialogbodyid = document.createAttribute("id");
    divdialogbody.setAttribute("id", "modalbody");
    //var divdialogbodyclass = document.createAttribute("class");
    divdialogbody.setAttribute("class", "modal-body");

    var divdialogfooter = document.createElement("div");
    //var divdialogfooterid = document.createAttribute("id");
    divdialogfooter.setAttribute("id", "modalfooter");
    //var divdialogfooterclass = document.createAttribute("class");
    divdialogfooter.setAttribute("class", "modal-footer");
    divdialogcontent.appendChild(divdialogfooter);
    divdialogcontent.appendChild(divdialogbody);

    divdialog.appendChild(divdialogcontent);
    divvertical.appendChild(divdialog);
    divmodal.appendChild(divvertical);

    document.body.appendChild(divmodal);

    ////-----------------------------------------//
    //// Add marketing list
    ////-----------------------------------------//
    //var x = document.getElementsByClassName("appcontainer");

    //if (x.length > 0) {
    //    x[0].insertAdjacentHTML('afterbegin', '<div id="divMarketingList" class="marketinglist"></div>');
    //}




}

function BuildMenuItemHTML(id, url, icon, label) {
    return '<a id="' + id + '" href="' + url + '"><li class="menudetail"><div style="padding-top:5px">' + MenuIcon(icon) + '<div style="display:inline-block">' + label + '</div><div style="display:inline-block;padding-right:33px;float:right">' + GetCheckMark(12, "rightarrow") + '</div></div></li></a>'
}

function MenuIcon(input) {
    var m = '';
    var sty = 'width:17px;height:18px;max-width:24px;';

    //if (typeof input == "undefined") {
    //    input = "default";
    //}

    switch (input) {

        case 'history':
            m = 'history-icon@3x.png';
            sty = 'width:21px;height:17px;';
            break;
        case 'logout':
            sty = 'width:11px;height:11px;margin-bottom:2px;';
            m = 'logout-icon@3x.png';
            break;
        case 'addresses':
            sty = 'width:18px;height:19px;';
            m = 'addresses-icon@3x.png';
            break;
        case 'payments':
            m = 'payment-icon@3x.png';
            sty = 'width:17px;height:15px;';
            break;
            //case 'history':
            //    m = 'addresses-icon@3x.png';
            //    sty = 'width:21px;height:17px;';
            //    break;
        case 'artisttools':
            m = 'artisttools@3x.png';
            break;
        case 'tellafriend':
            m = 'friend-icon@3x.png';
            sty = 'width:25px;height:17px;';
            break;
        case 'editprofile':
            m = 'settings-icon@3x.png';
            sty = 'width:20px;height:20px;';
            break;
        case 'support':
            sty = 'width:20px;height:18px;';
            m = 'support-icon@3x.png';
            break;
        case 'book':
            m = 'book-icon@3x.png';
            break;
        default:
            break;
    }
    var work = "";

    if (m.length > 0) {
        if (input == "logout") {
            work = '<div style="width:55px;display:inline-block"><img src="../assets/common/images/' + m + '" style="' + sty + 'margin-left:20px;" /></div>';
        } else {
            work = '<div style="width:55px;display:inline-block"><img src="../assets/common/images/' + m + '" style="' + sty + 'margin-left:20px;" /></div>';

        }


    } else {
        work = "<span class='checkmarkfont' style='display-table:cell;height:24px;width:24px;margin-left:7px;margin-right:23px;'>" + GetCheckMark(23) + "</span>";
    }
    return work;
}



function mnuLogin() {
    window.location = "../account/login.html";
}

function mnuLookAround() {
    window.location = gCustomerHomePage;
}

function mnuForgotPassword() {
    window.location = "../profile/forgotpassword.html";
}

function mnuRegister() {
    window.location = "../account/register.html";
}

function BuildHeader() {
    //if (user.UserID <= 0) {
    //    loggedin = false;
    //}
    //else {
    //    loggedin = true;
    //}

    // -------------------------------------
    // Header
    //--------------------------------------
    var work = "";

    if (document.getElementById("spaheader")) {

        work = "";

        work = work + "<div class='row form-signin-heading' style='height:70px'><div class='spaheader col-sm-3 col-xs-3' >&nbsp;</div>";

        work = work + "<div class='spaheader col-sm-6 col-xs-6 text-center'>";
        work = work + "<h2 onclick='showVersion();' class='form-signin-heading' style='margin-top:25px;margin-bottom:0px'>Joiful</h2>";
        work = work + "</div>";

        work = work + "<div class='spaheader col-sm-3 col-xs-3' style='text-align:right;height:70px'>";

        work = work + '<button style="background-color: transparent; margin-top: 25px; border-style:none;color:white" id="btnOpenMenu" type="button" class="btn" aria-label="Right Align">';
        work = work + '<span class="glyphicon glyphicon-align-justify" aria-hidden="true" style="outline:none;border-style:none;color:white"></span>';
        work = work + '</button>';

        work = work + "</div></div>";

        document.getElementById("spaheader").innerHTML = work;
    }

}

function showVersion() {
    if (GetCookieItem("AppVersion").length > 0) {
        showAlert("Version: " + GetCookieItem("AppVersion"));
    }
}

//-----------------------
// UI Notifications
//--------------------
var NotificationIntervalID = null;

function InitNotificationPoll() {
    var cAvailableForWork = true;

    //if (user.Persona.toLowerCase() == "provider") {
    //    cAvailableForWork = (GetCookieItem("AvailableForWork") == "true" ? true : false);
    //}

    if (cAvailableForWork) {
        StartNotificationPoll();
    }
}

function StartNotificationPoll() {
    if (gMobileVersion == true) {
        return;
    }

    if (NotificationIntervalID == null) {

        CheckForMessage();
        NotificationIntervalID = setInterval(CheckForMessage, gSettingNotificationPollInterval);
    }
}

function EndNotificationPoll() {
    if (gMobileVersion == true) {
        return;
    }

    clearInterval(NotificationIntervalID);
    NotificationIntervalID = null;

}

function CheckForMessage() {

    // Insurance...
    if (gMobileVersion == true) {
        return;
    }

    var UserID = user.UserID;

    if (UserID == "0" || gNotificationPollPaused == true) {
        return;
    }

    var uri = ServicePrefix + "/api/GetNotification/?userid=" + UserID + "&notificationtype=ui";

    $.get(uri).then(function(result) {
        if (result == null) {
            showAlert('returned no data');
            return;
        }

        if (result.Status != null) {
            if (result.Status != "SUCCESS") {
                showAlert(result.Message);
                return;
            } else {
                if (result.Notification.length > 0) {

                    CheckForMessageSuccess(result.Notification);
                } else {
                    return;
                }
            }
        } else {
            return;
        }
    });

}

function CheckForMessageSuccess(message) {

    if (gMobileVersion == true) {
        return;
    }

    EndNotificationPoll();

    var bContainsRedirect = false;

    if (message.indexOf('.html') > -1) {
        bContainsRedirect = true;
    }
    if (message.indexOf('onclick') > -1) {
        bContainsRedirect = true;
    }
    // message = "<div style='border-radius:10%;border: 1px solid silver;background-color:#808080'>" + message + "</div>";

    if (bContainsRedirect == true) {
        showAlert(message, null, 'na');
    } else {
        showAlert(message, "StartNotificationPoll()");
    }

    //    $('#popupmessage').html(message);
    //    $('#notification').toggleClass('in');

}

//---------------------------------------------
// Get User Info
//---------------------------------------------
function GetUserInfo(userID, persona, bRedirect) {

    if (typeof bRedirect == "undefined") {
        bRedirect = true;
    }


    if (GetCookieItem("MobileNumber") == "" || GetCookieItem("Gender") == "") {

        var uri = ServicePrefix + "/api/GetUserInfo/?userid=" + userID;

        $.get(uri).then(function(result) {

            if (result == null) {
                showAlert('returned no data');
                return;
            }

            if (result.Status != null) {
                if (result.Status != "SUCCESS") {
                    showAlert(result.Message);
                    return;
                } else {

                    UpdateCookieItem("MobileNumber", result.MobileNumber);

                    // only used on review page...
                    var MobileNumber = GetCookieItem("MobileNumber");

                    if (MobileNumber.length == 10) {
                        $("#txtMobileNumber").val("(" + MobileNumber.substr(0, 3) + ") " + MobileNumber.substr(3, 3) + "-" + MobileNumber.substr(6, 4));
                    } else {
                        $("#txtMobileNumber").val(MobileNumber);
                    }
                    // only used on review page...

                    UpdateCookieItem("Gender", result.Gender);

                    if (persona == "provider") {
                        if (GetCookieItem("MobileNumber") == "") {
                            if (bRedirect == true) {
                                showAlert("Please enter your mobile number", "../profile/editprofile.html");
                            }
                        }
                        if (GetCookieItem("Gender") == "") {
                            if (bRedirect == true) {
                                showAlert("Please select your gender", "../profile/editprofile.html");
                            }
                        }

                    } else {

                        $("#divProfileReminder").hide();

                        if (GetCookieItem("CreditCardCount") == "0") {
                            $("#spnProfileReminder").html("You do not have a Credit Card setup! Would you like to do it now?");
                            var onclick = "window.location='../profile/profilecreditcardeditor.html?creditcardid=0';";
                            $('#btnProfileReminder').removeAttr('onclick');
                            $('#btnProfileReminder').attr('onclick', onclick);
                            $("#divProfileReminder").show();
                        } else if (GetCookieItem("MobileNumber").length < 10) {
                            var onclick = "window.location='../profile/editprofile.html';";
                            $('#btnProfileReminder').removeAttr('onclick');
                            $('#btnProfileReminder').attr('onclick', onclick);

                            $("#spnProfileReminder").html("You do not have a Mobile Number setup. <br>This will help when it comes to booking a treatment! Would you like to do it now?");
                            $("#divProfileReminder").show();
                        }
                    }

                    return;
                }
            } else {
                return;
            }
        });

    }

    if (GetCookieItem("CreditCardCount") == "" || GetCookieItem("CreditCardCount") == "0") {
        if (GetCookieItem("cUserCCList").length == 0) {
            var uri = ServicePrefix + "/api/GetUserCreditCardList/?userid=" + userID;
            $.get(uri).then(function(result) {
                if (!result) {
                    showAlert('returned no data');
                    return;
                }

                if (result.Status != "SUCCESS") {
                    showAlert(result.Message);
                    return;
                }

                UpdateCookieItem("CreditCardCount", result.Results.length);
                if (result.Results.length > 0) {
                    UpdateCookieItem("cUserCCList", JSON.stringify(result.Results));
                }
            });
        } else {
            var ccList = JSON.parse(GetCookieItem("cUserCCList"));
            UpdateCookieItem("CreditCardCount", ccList.length);
        }

    }



}

function GoToEditor() {
    window.location = "../profile/editprofile.html";

}

//---------------------------
// Custom Alerts
//----------------------------

function showAlert(text, url, btnText, hideButton) {
    if (document.getElementById("modalbody") === null) {
        // show default alert if fancy alert not loaded
        alert(text);
        return;
    }

    var closeTimeout = 5000;

    if (text == null || text.length == 0) {
        closeTimeout = -1;
    }

    var bNoButtonExit = false;

    if (btnText == null) {
        btnText = "OK";
    }
    var bHideButton = false;

    if (typeof hideButton == "undefined") {
        bHideButton = false;
    } else {
        bHideButton = hideButton;
    }

    var myButtonText = "OK";

    if (typeof btnText === 'undefined') {
        myButtonText = "OK";
    } else {
        myButtonText = btnText;
    }

    // NEVER SHOW THIS
    if (myButtonText.toUpperCase() == "OK") {
        bNoButtonExit = true;
    }

    var bCheckMark = false;

    if (myButtonText.toLowerCase().indexOf('ok') > -1) {
        bCheckMark = true;
        myButtonText = GetCheckMark(50);
    }

    //document.getElementById("modalbody").setAttribute("onclick", "printWorking()");

    if (btnText == "na") {
        $("#modalfooter").hide();
    } else {

        if ((typeof url === 'undefined') || (url == 'na') || (url == null)) {
            // if no url close window
            document.getElementById("modalfooter").innerHTML = "<button id='btnAlertOk' type='button' class='btn btn-lg " + (bCheckMark == false ? " btn-round-alert " : " btn-round-alert-noborder ") + " checkmarkfont' " + (bCheckMark == false ? "style='background-color:transparent!important;border:solid " + gColors.Turquoise + " 1px;color:" + gColors.Turquoise + "'" : "") + " onclick='closeAlert();'>" + myButtonText + "</button>";

            if (bHideButton == false) {
                document.getElementById("modalbody").setAttribute("onclick", "closeAlert()");

                if (closeTimeout != -1) {
                    setTimeout(closeAlert, closeTimeout);
                }
            }
        } else {
            // redirect to url 
            document.getElementById("modalfooter").innerHTML = "<button id='btnAlertOk' type='button' class='btn btn-lg " + (bCheckMark == false ? " btn-round-alert " : " btn-round-alert-noborder ") + " checkmarkfont' " + (bCheckMark == false ? "style='background-color:transparent!important;border:solid " + gColors.Turquoise + " 1px;color:" + gColors.Turquoise + "'" : "") + " onclick='sendAlert(\"" + url + "\");'>" + myButtonText + "</button>";

            if (bHideButton == false) {

                document.getElementById("modalbody").setAttribute("onclick", 'sendAlert(\"" + url + "\");');

                if (closeTimeout != -1) {
                    setTimeout("sendAlert('" + url + "');", closeTimeout);
                } else {
                    sendAlert(url, false);
                }
            }
        }
        $("#modalfooter").show();
    }


    $(".modal-content").css("border", "none");

    if (bHideButton == false) {
        $(".modal-content").css("border-radius", "10px");
    } else {
        $(".modal-content").css("border-radius", "0%");
    }

    $(".modal-content").css("background", "transparent");

    if (url == "scroll") {
        $(".modal-content").css("max-height", "400px");
        $(".modal-content").addClass("scrollme");
        $("#modalbody").css("font-size", "10pt");
        $("#modalbody").css("padding", "5px 5px 5px 5px");

    }

    if ($("#workarea").is(":visible") == false) {
        $("#modalalert").css("background", "rgba(0,0,0,0.5)");
        $(".modal-content").css("background", "rgba(0,0,0,0.5)");
    } else {
        $(".modal-content").css("background", "rgba(0,0,0,0.9)");
    }

    $(".modal-content").css("box-shadow", "none");

    document.getElementById("modalfooter").style.textAlign = "center";
    document.getElementById("modalfooter").style.borderTop = "none";
    document.getElementById("modalfooter").style.backgroundColor = "transparent";
    document.getElementById("modalfooter").style.color = "white";

    document.getElementById("modalbody").style.color = "white";
    document.getElementById("modalbody").style.textAlign = "center";
    document.getElementById("modalbody").innerHTML = text;

    if (url != "scroll") {
        document.getElementById("modalbody").style.fontSize = "14pt";
    }

    $("#modalfooter").show();
    $("#modalbody").css("padding", "0px");

    if (bNoButtonExit == true) {

        $("#modalfooter").hide();
        if (bHideButton == false) {
            $("#modalbody").css("padding", "40px 20px 40px 20px");
        }
    } else if (bHideButton == true) {
        $("#modalfooter").hide();
        $("#modalbody").css("padding", "0px");
    } else {
        $("#modalfooter").show();
        $("#modalbody").css("padding", "15px");
    }

    if (text != null && text.length > 0) {
        document.getElementById("modalalert").style.display = "block";
    } else {
        document.getElementById("modalalert").style.display = "none";
    }

    unblockUI();
}

function showConfirm(text, truebuttontxt, falsebuttontxt, truecall, falsecall) {


    unblockUI();

    //------------------------------------------------  
    //  User callbacks as strings, example bellow:
    //  <button onclick="showConfirm('Are you sure?', 'Yep!', 'Not really', 'alert(1);', 'alert(0);')">Click here</button>
    //------------------------------------------------

    if (document.getElementById("modalbody") === null) {
        // show default confirm if fancy confirm not loaded
        if (confirm(text)) {
            eval(truecall);
        } else {
            if (typeof falsecall === 'undefined') {
                eval(falsecall);
            }
        }
    } else {

        var falsebutton = "";

        var bCheckMark = false;
        if ((truebuttontxt.toLowerCase().indexOf("yes") > -1 || truebuttontxt.toLowerCase().indexOf("ok") > -1)) {
            bCheckMark = true;
            truebuttontxt = GetCheckMark(50);
        }


        var truebutton = "<button id='btnConfirmYes' type='button' class='btn btn-lg " + (bCheckMark == false ? " btn-round " : " btn-round-noborder ") + " checkmarkfont' " + (bCheckMark == false ? " style='border:solid " + gColors.Turquoise + " 1px!important;color:" + gColors.Turquoise + "!important'" : "") + " onclick='" + truecall + "'>" + ((truebuttontxt.toLowerCase().indexOf("yes") > -1 || truebuttontxt.toLowerCase().indexOf("ok") > -1) ? GetCheckMark(50) : truebuttontxt) + "</button>";

        if (typeof falsecall === 'undefined') {
            falsebutton = "<button id='btnConfirmNo' type='button' class='btn btn-lg  " + (bCheckMark == false ? " btn-round " : " btn-round-noborder ") + "  checkmarkfont' onclick='closeConfirm();'>" + (falsebuttontxt.toLowerCase().indexOf("no") > -1 ? GetCheckMark(20, "close-white-circle") : falsebuttontxt) + "</button>";
        } else {
            falsebutton = "<button id='btnConfirmNo' type='button' class='btn btn-lg  " + (bCheckMark == false ? " btn-round " : " btn-round-noborder ") + "  checkmarkfont' onclick='" + falsecall + "'>" + (falsebuttontxt.toLowerCase().indexOf("no") > -1 ? GetCheckMark(20, "close-white-circle") : falsebuttontxt) + "</button>";
        }

        $(".modal-content").css("border", "none");
        $(".modal-content").css("border-radius", "0%");


        if ($("#workarea").is(":visible") == false) {
            $("#modalalert").css("background", "rgba(0,0,0,0.5)");
        }
        $(".modal-content").css("background", "transparent");
        $(".modal-content").css("box-shadow", "none");
        $(".modal-content").css("background", "rgba(0,0,0,0.5)");



        document.getElementById("modalbody").style.color = "white";
        document.getElementById("modalbody").style.textAlign = "center";
        document.getElementById("modalbody").innerHTML = text;
        document.getElementById("modalbody").style.fontSize = "14pt";


        document.getElementById("modalfooter").style.display = "";
        document.getElementById("modalfooter").style.borderTop = "none";
        document.getElementById("modalfooter").style.backgroundColor = "transparent";
        document.getElementById("modalfooter").style.color = "white";
        document.getElementById("modalfooter").style.textAlign = "center";
        document.getElementById("modalfooter").style.borderTop = "none";
        document.getElementById("modalfooter").innerHTML = truebutton + " " + falsebutton;

        document.getElementById("modalbody").innerHTML = text;



        document.getElementById("modalalert").style.display = "block";
    }
}

function redirectTo(url) {
    closeAlert();
    window.location = url;
}

function sendAlert(url, bFade) {
    if (typeof bFade == "undefined") {
        bFade = true;
    }

    if (url.indexOf('.html') > -1) {

        var callback = "GoThere";

        if (bFade == true) {
            $("body").fadeOut(1000, function() {
                window.location = url;
            });
        } else {
            window.location = url;
        }

    } else {
        eval(url);
        closeAlert();
    }
}

function closeAlert() {
    $("#modalalert").fadeOut();
    //document.getElementById("modalalert").style.display = "none";
    setTimeout(ForceClose, 3000);
}

function closeConfirm() {
    $("#modalalert").fadeOut();
    setTimeout(ForceClose, 3000);
    //document.getElementById("modalalert").style.display = "none";
}

function ForceClose() {
    document.getElementById("modalalert").style.display = "none";
}

function DoneWithMessage() {
    gNotificationPollPause = false;
    //$('#notification').removeClass('in');
    NotificationIntervalID = null;

    setInterval(StartNotificationPoll, 3000);
}

function loc_DoneWithMessage() {
    $('#loc_notification').removeClass('in');
}

//--------------------------------------------
// GEO functions
//--------------------------------------------
// function: getLocation
//--------------------------------------------
// This function pulls location and saves it 
// to storage in my_lat and my_lng
//--------------------------------------------
function getLocation(callback) {

    var where = window.location.toString().toLowerCase();

    if (user.Persona == "provider") {
        if (where.indexOf("jobdetail")) {

        }
    }

    if (gMobileVersion == true) {
        var appPhoneGap = {
            initialize: function() {
                this.bindEvents();
            },
            bindEvents: function() {
                document.addEventListener('deviceready', this.onDeviceReady, false);
            },
            onDeviceReady: function() {
                if (navigator.geolocation) {
                    var latt = localStorage.getItem('my_lat');
                    if(!latt){
                        var timeoutVal = 10 * 1000 * 1000;
                        navigator.geolocation.getCurrentPosition(displayPosition, displayError, {
                            enableHighAccuracy: true,
                            timeout: timeoutVal,
                            maximumAge: 0
                        });
                    }
                } else {
                    RemoveCookie("my_lat");
                    RemoveCookie("my_lng");
                    showAlert("Geo Location is not supported by this browser");
                }
            }
        };
        appPhoneGap.initialize();

    } else /*{
        // To Force update if 
        // data is 
        if (GetCookieItem("LocationSaved" != "true")) {
            LogIt('updateLocationInfo');
            updateLocationInfo();
        }

        if (navigator.geolocation) {
            var latt = localStorage.getItem('my_lat');
            if(!latt){
                var timeoutVal = 10 * 1000 * 1000;
                LogIt('getCurrentPosition');
                navigator.geolocation.getCurrentPosition(displayPosition, displayError, {
                    enableHighAccuracy: true,
                    timeout: timeoutVal,
                    maximumAge: 0
                });
            }
        } else {
            RemoveCookie("my_lat");
            RemoveCookie("my_lng");
            showAlert("Geo Location is not supported by this browser");
        }
    }*/{
        // To Force update if 
        // data is 
        if (GetCookieItem("LocationSaved" != "true")) {
            LogIt('updateLocationInfo');
            updateLocationInfo();
        }

        $(function(){
            document.addEventListener("deviceready", onDeviceReady, false);
        });
        function onDeviceReady() {
            if (navigator.geolocation) {
               // var latt = localStorage.getItem('my_lat');
                //if(!latt){
                    var timeoutVal = 10 * 1000 * 1000;
                    LogIt('getCurrentPosition');
                    navigator.geolocation.getCurrentPosition(displayPosition, displayError, {
                        enableHighAccuracy: true,
                        timeout: timeoutVal,
                        maximumAge: 0
                    });
               // }
            }else {
                RemoveCookie("my_lat");
                RemoveCookie("my_lng");
                showAlert("Geo Location is not supported by this browser");
            }
        }
    }

    function displayPosition(position) {

        unblockUI();
        LogIt('displayPosition');
        UpdateCookieItem("my_lat", position.coords.latitude);
        UpdateCookieItem("my_lng", position.coords.longitude);

        var lat = GetCookieItem("my_lat");
        var lng = GetCookieItem("my_lng");

        gToLat = lat;
        gToLng = lng;

        ////////if (typeof GetMarketingList != 'undefined') {
        ////////    GetMarketingList();
        ////////}

        eval(callback);
    }

    function displayError(error) {

        var errors = {
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
        };
        //showAlert("Error: " + errors[error.code]);
    }
}

function getAddress(lat, lng, localvalue) {

    // Getting the Address by LAT/LONG
    LogIt('Getting the Address by LAT/LONG');

    var address;

    UpdateCookieItem(localvalue + "_lat", lat);
    UpdateCookieItem(localvalue + "_lng", lng);

    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=" + GetCookieItem('googleserver'),
        cache: false,
        dataType: "json",
        async: false
    }).done(function(html) {
        $.each(html.results, function(attr, val) {
            if (attr == 0) {
                if (val.formatted_address.length > 0) {
                    // Pull full Address
                    UpdateCookieItem(localvalue + "_fulladdress", val.formatted_address);

                    // Split it based on comma
                    var splitaddress = val.formatted_address.split(", ");

                    // Get Address Line 1
                    if (splitaddress.length > 0 && splitaddress[0]) {
                        UpdateCookieItem(localvalue + "_address", splitaddress[0]);
                    } else {
                        UpdateCookieItem(localvalue + "_address", "");
                    }


                    // Get City
                    if (splitaddress.length > 1 && splitaddress[1]) {
                        UpdateCookieItem(localvalue + "_city", splitaddress[1]);
                    } else {
                        UpdateCookieItem(localvalue + "_city", "");
                    }

                    // Get Zip Code
                    if (splitaddress.length > 2 && splitaddress[2]) {
                        var splitstatezip = splitaddress[2].split(" ");
                        UpdateCookieItem(localvalue + "_zip", splitstatezip[1]);
                    } else {
                        UpdateCookieItem(localvalue + "_zip", "");
                    }

                    $("#radAddress0").html(GetCookieItem("my_address") + " " + GetCookieItem("my_city") + " " + GetCookieItem("my_zip"));

                    if (typeof LoadAddressDialog != "undefined") {
                        LoadAddressDialog();
                    }

                }

                $.each(val.address_components, function(attr2, val2) {
                    if (val2.types[0] == "administrative_area_level_1") {
                        if (val2.short_name.length > 0) {
                            UpdateCookieItem(localvalue + "_state", val2.short_name);
                            $("#radAddress0").html(GetCookieItem("my_address") + " " + GetCookieItem("my_city") + ", " + GetCookieItem("my_state") + " " + GetCookieItem("my_zip"));
                        }
                    }

                    if (val2.types[0] == "country") {
                        if (val2.short_name.length > 0) {
                            UpdateCookieItem(localvalue + "_country", val2.short_name);
                        }
                    }
                });
            }
        });
    });
}

function AddressToGPS(address, localvalue, callback) {

    var lat = "";
    var long = "";

    if (localvalue == "") {
        lat = "lat";
        lng = "lng";
    } else {
        lat = localvalue + "_lat";
        lng = localvalue + "_lng";
    }

    UpdateCookieItem(lat, "");
    UpdateCookieItem(lng, "");

    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&region=us&key=" + GetCookieItem('googleserver'),
        cache: false,
        dataType: "json"
    }).done(function(html) {
        unblockUI();

        $.each(html.results, function(attr, val) {

            if (attr == 0) {
                if (val.geometry.location.lat) {

                    UpdateCookieItem(lat, val.geometry.location.lat);
                    UpdateCookieItem(lng, val.geometry.location.lng);


                    gToLat = GetCookieItem(lat);
                    gToLng = GetCookieItem(lng);

                    //--------------------------------------
                    // Conditional updates of 
                    // variables
                    //--------------------------------------
                    if (typeof gToLat != "undefined") {
                        gToLat = val.geometry.location.lat;
                    }
                    if (typeof gToLat != "undefined") {
                        gToLng = val.geometry.location.lng;
                    }


                    if (typeof cart != "undefined") {
                        if (typeof cart.locationLat != "undefined") {
                            cart.locationLat = val.geometry.location.lat;
                        }
                        if (typeof cart.locationLng != "undefined") {
                            cart.locationLng = val.geometry.location.lng;
                        }
                    }




                }
            }
        });

        eval(callback);
    });
}

function getDistance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * (lat1 / 180);
    var radlat2 = Math.PI * (lat2 / 180);
    var theta = lon1 - lon2;
    var radtheta = Math.PI * (theta / 180);

    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;

    if (unit == "K") {
        dist = dist * 1.609344;
    }

    if (unit == "N") {
        dist = dist * 0.8684;
    }

    return dist.toFixed(1);
}

function travelTimeWithTraffic(fromAddress, toAddress, callback, prefix) {

    if (!prefix) {
        var prefix = "my";
    }

    UpdateCookieItem(prefix + "_address1", fromAddress); // from
    UpdateCookieItem(prefix + "_address2", toAddress); // to

    $.ajax({
        url: "https://www.mapquestapi.com/directions/v2/route?key=" + GetCookieItem('mapquest') + "&from=" + fromAddress + "&to=" + toAddress,
        dataType: 'html'
    }).done(function(html) {

        var obj = jQuery.parseJSON(html);

        UpdateCookieItem(prefix + "_traveltime", Math.round(obj.route.realTime / 60)); // in minutes
        UpdateCookieItem(prefix + "_traveldistance", parseFloat(obj.route.distance).toFixed(1)); // in miles

        eval(callback);

    }).fail(function() {
        return;
    });

}

function middleoftwopoints(tempdata) {
    var coords = tempdata;

    var filteredtextCoordinatesArray = coords.split('|');

    centerLatArray = [];
    centerLngArray = [];


    for (i = 0; i < filteredtextCoordinatesArray.length; i++) {

        var centerCoords = filteredtextCoordinatesArray[i];
        var centerCoordsArray = centerCoords.split(',');

        if (isNaN(Number(centerCoordsArray[0]))) {} else {
            centerLatArray.push(Number(centerCoordsArray[0]));
        }

        if (isNaN(Number(centerCoordsArray[1]))) {} else {
            centerLngArray.push(Number(centerCoordsArray[1]));
        }

    }

    var centerLatSum = centerLatArray.reduce(function(a, b) {
        return a + b;
    });
    var centerLngSum = centerLngArray.reduce(function(a, b) {
        return a + b;
    });

    var centerLat = centerLatSum / filteredtextCoordinatesArray.length;
    var centerLng = centerLngSum / filteredtextCoordinatesArray.length;

    ////LogIt(centerLat);
    ////LogIt(centerLng);

    var mapOpt = {
        zoom: 8,
        center: {
            lat: centerLat,
            lng: centerLng
        }
    };

    return mapOpt;

}
var mapdisplay = 600;

function getmapzoom(minlat, minlng, maxlat, maxlng, ctrlat, ctrlng) {


    var interval = 0;

    if ((maxlat - minlat) > (maxlng - minlng)) {
        interval = (maxlat - minlat) / 2;
        minlng = ctrlng - interval;
        maxlng = ctrlng + interval;
    } else {
        interval = (maxlng - minlng) / 2;
        minlat = ctrlat - interval;
        maxlat = ctrlat + interval;
    }

    var dist = (6371 * Math.acos(Math.sin(minlat / 57.2958) * Math.sin(maxlat / 57.2958) + (Math.cos(minlat / 57.2958) * Math.cos(maxlat / 57.2958) * Math.cos((maxlng / 57.2958) - (minlng / 57.2958)))));

    var tzoom = 0;

    tzoom = Math.floor(8 - Math.log(1.6446 * dist / Math.sqrt(2 * (mapdisplay * mapdisplay))) / Math.log(2));

    return tzoom;
}

function formatTime(minutes) {
    if (minutes > 59) {
        if (minutes == 60) {
            return "1h"
        } else {
            return Math.floor(minutes / 60) + "h " + minutes % 60 + " min";
        }
    } else {
        return minutes + " min";
    }
}


function LoadGoogleAnalyticsLib() {



    var GoogleAnalyticsKeyFromCookie = "";
    // GoogleAnalytics
    if (gMobileVersion == false) {

        GoogleAnalyticsKeyFromCookie = GetCookieItem("GoogleAnalytics").toString();

        if (GoogleAnalyticsKeyFromCookie.length > 0) {
            str = "<script>";
            str = str + "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create', '" + GoogleAnalyticsKeyFromCookie + "', 'auto');ga('send', 'pageview');";
            str = str + "</script>";

            $('html').append(str);
        }

    } else {
        GoogleAnalyticsKeyFromCookie = GetCookieItem("GoogleAnalyticsMobile").toString();

        if (GoogleAnalyticsKeyFromCookie.length > 0) {
            str = "<script>";
            str = str + "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create', '" + GoogleAnalyticsKeyFromCookie + "', 'auto');ga('send', 'pageview');";
            str = str + "</script>";

            $('head').append(str);

        }
    }

}


// BLOCK UI
function blockUI(bIgnoreBlock) {

    $(".ajaxbtn").fadeOut();

    var myIgnoreBlock = false;

    if (typeof bIngoreBlock != "undefined") {
        myIgnoreBlock = bIgnoreBlock;
    }

    if (typeof $.blockUI != "undefined") {
        if (myIgnoreBlock == false) {
            $.blockUI({
                message: '<h4>please wait...</h4>',
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .75,
                    color: '#fff'
                }
            });
        }
    }

};

function unblockUI() {
    if (typeof $.unblockUI != "undefined") {
        $.unblockUI();
    }

    $(".ajaxbtn").fadeIn();
}


// ------------------------------------------
// -------------- MOBILE APP ----------------
// ------------------------------------------

//if(gMobileVersion==true) {
//  viewport = document.querySelector("meta[name=viewport]");
//  viewport.setAttribute('content', 'user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi');
//}

if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        ////LogIt("fast click");
        FastClick.attach(document.body);
    }, false);
}

//------------------------------------------
// Push Woosh - Notifications
//------------------------------------------
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function onPushwooshInitialized(pushNotification) {

    //if you need push token at a later time you can always get it from Pushwoosh plugin
    pushNotification.getPushToken(
        function(token) {
            //console.info('push token: ' + token);
        }
    );

    //and HWID if you want to communicate with Pushwoosh API
    pushNotification.getPushwooshHWID(
        function(token) {
            //console.info('Pushwoosh HWID: ' + token);
        }
    );

    //settings tags
    pushNotification.setTags({
            tagName: "tagValue",
            intTagName: 10
        },
        function(status) {
            //console.info('setTags success: ' + JSON.stringify(status));
        },
        function(status) {
            // console.warn('setTags failed');
        }
    );

    pushNotification.getTags(
        function(status) {
            //console.info('getTags success: ' + JSON.stringify(status));
        },
        function(status) {
            // console.warn('getTags failed');
        }
    );

    //start geo tracking.
    //pushNotification.startLocationTracking();
}

function initPushwoosh() {

    // incase we get here and shouldnot be 
    if (typeof cordova == "undefined") {
        //SendUserHome();
        //alert(' no cordova - out');
        ////LogIt('Out of Init');
        return;
    }

    var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");

    //set push notifications handler
    document.addEventListener('push-notification',
        function(event) {
            var message = event.notification.message;
            //var userData = event.notification.userdata;
            //showAlert(message);
            //document.getElementById("pushMessage").innerHTML = message + "<p>";
            //document.getElementById("pushData").innerHTML = JSON.stringify(event.notification) + "<p>";

            ////dump custom data to the console if it exists
            //if (typeof (userData) != "undefined") {
            //    //alert('user data: ' + JSON.stringify(userData));
            //}
        }
    );

    //initialize Pushwoosh with projectid: "GOOGLE_PROJECT_ID", appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
    pushNotification.onDeviceReady({
        projectid: gMobilePushProjectID,
        appid: gMobilePushAppID,
        serviceName: ""
    });

    pushregtoken = GetCookieItem("pushregtoken");

    if (pushregtoken.length == 0 && user.UserID != "0") {
        //register for push notifications
        pushNotification.registerDevice(
            function(status) {
                onPushwooshInitialized(pushNotification);
                //alert(status.pushToken);
                //document.getElementById("pushToken").innerHTML = status.pushToken + "<p>";
                UpdateDeviceToken(user.UserID, status.pushToken);
            },
            function(status) {
                var message = "|projectid:" + gMobilePushProjectID + "|appid:" + gMobilePushAppID + "|";

                LogError("failed to register: " + status + " " + message);
                UpdateCookieItem("pushregtoken", "");
            }
        );
    }
    //else
    //{
    //    //SendUserHome();
    //    return;
    //}
}

function UpdateDeviceToken(userID, pushToken) {
    UpdateCookieItem("pushregtoken", pushToken);
    UpdateDBwithToken(userID, pushToken);
}

function UpdateDBwithToken(userid, token) {
    if (userid == "0" || userid == "") {
        return;
    }

    var data = null;
    var url = ServicePrefix + '/api/updateuserdevice/';

    data = {
        userid: user.UserID,
        deviceid: token,
        mobileversion: gMobileVersion
    };

    $.ajax({
        data: data,
        dataType: "json",
        url: url,
        method: "POST",
        success: UpdateDBwithTokenSuccess,
        error: UpdateDBwithTokenError
    });

}

function UpdateDBwithTokenError(result, textStatus, err) {
    showAlert(err);
    return;
}

function UpdateDBwithTokenSuccess(result) {

    if (result == null) {
        showAlert('returned no data');
        return;
    }

    if (result.Status != "SUCCESS") {
        showAlert(result.Message);
        return;
    } else {
        //SendUserHome();
        return;
    }
}

function LogError(inMessage) {
    var errorPage = window.location.toString();
    var data = null;
    var url = ServicePrefix + '/api/senderrormessage/';

    inMessage = "USER INFO: " + JSON.stringify(user) + " ----- " + inMessage;

    data = {
        page: errorPage,
        message: inMessage
    };

    $.ajax({
        data: data,
        dataType: "json",
        url: url,
        method: "POST",
        success: LogErrorSuccess,
        error: LogErrorError
    });

}

function LogErrorSuccess() {
    return;
}

function LogErrorError() {
    return;
}
var appPush = {
    // Application Constructor
    initialize: function() {

        //if (gMobileVersion==true)
        //{
        ////LogIt('appPush.initialize');
        this.bindEvents();
        //}
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        //document.addEventListener('DOMContentLoaded', this.onDeviceReady, false);
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //document.addEventListener('documentready', this.onDeviceReady, false);

        //alert('are we there yet?');
        //this.onDeviceReady();
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'appPush.receivedEvent(...);'
    onDeviceReady: function() {

        //alert('we here');
        appPush.receivedEvent('deviceready');
        initPushwoosh();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

        //    var parentElement = document.getElementById(id);
        //    var listeningElement = parentElement.querySelector('.listening');
        //    var receivedElement = parentElement.querySelector('.received');

        //    listeningElement.setAttribute('style', 'display:none;');
        //    receivedElement.setAttribute('style', 'display:block;');

        ////LogIt('Received Event: ' + id);
    }
};

$(document).ready(function() {
    ////////$("#spa-menu-container").addClass("fadeIn");
    //////$(".container").addClass("fadeIn");
    $(".container").show();


});

var sendText = "NavigationExit();";

function StartNavigation() {

    if (gMobileVersion == false) {
        showAlert("Not available in web version", sendText);
        return;
    }

    var toAddress = gToJobAddress;

    if (typeof toAddress == 'undefined') {
        showAlert("issue with nav - toAddress undefined", sendText);
        return;
    }
    if (toAddress.length == 0) {
        showAlert("issue with nav - toAdress empty", sendText);
        return;
    }

    if (typeof launchnavigator == "undefined") {
        showAlert("Problem launching plugin", sendText);
        return;
    } else {

        try {

            var platform = GetCookieItem("DevicePlatform");

            if (platform.length == "") {
                showAlert("No Device Platform Found", sendText);
                return;
            }

            ////////if (platform == "android") {
            ////////    platform = launchnavigator.PLATFORM.ANDROID;
            ////////} else if (platform == "ios") {
            ////////    platform = launchnavigator.PLATFORM.IOS;
            ////////} else if (platform.match(/win/)) {
            ////////    platform = launchnavigator.PLATFORM.WINDOWS;
            ////////}

            if (platform == "android") {
                launchnavigator.navigate(toAddress, "", StartNavigationSuccess, StartNavigationFailure);
            } else {
                // iOS
                var ALL = GetCookieItem("ArtistLatLong");
                var CLL = GetCookieItem("CustomerLatLong");

                if (typeof cordova != "undefined") {
                    cordova.InAppBrowser.open("maps://?saddr=" + ALL + "&daddr=" + CLL, "_blank");
                    NavigationExit();
                } else {
                    showAlert("cordova not loaded yet", sendText);
                    return;
                }
            }

            NavigationExit();
        } catch (ex) {

            showAlert(err, sendText);
            return;

        }
    }
}

function NavigationExit() {
    //if (typeof GoTo != "undefined") {
    //    GoTo();
    //}
    //else {
    //    SendUserHome();
    //}
    closeConfirm();

}

function StartNavigationSuccess() {

    NavigationExit();
    return;
}

function StartNavigationFailure(error) {

    showAlert(error, sendText);
    return;
}

function LoadExternalFile(file) {

    var d = document,
        h = d.getElementsByTagName('head')[0],
        s = d.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = file;
    h.appendChild(s);

}

function HideMarketingLink(loc) {
    var currentLocation = loc.toString();

    for (var i = 0; i < gMarketingExclusionList.length; i++) {
        if (currentLocation.toLowerCase().indexOf(gMarketingExclusionList[i].toLowerCase()) > -1) {
            return true;
        }
    }
    return false;
}
var currentDot = 0;
var maxDots = 0;

function GetMarketingList() {
    LogIt('GetMarketingList');
    //if (gGetMarketingLinks == false)
    //{
    //    if (typeof GetMap != "undefined") {
    //        //LogIt('GetMAp Pre-Marketing list')
    //        GetMap();
    //        return;
    //    }
    //}

    var lat = gToLat; // GetCookieItem("my_lat");
    var lng = gToLng; //GetCookieItem("my_lng");



    //if (lat.length == 0 || lng.length == 0)
    //{
    //    lat = GetCookieItem("my_lat");
    //    lng = GetCookieItem("my_lng");
    //}

    if (lat.length == 0 || lng.length == 0) {
        if (typeof GetMap != "undefined") {
            //LogIt('GetMap No Lat Long');
            GetMap();
        }
        return;
    }

    if (HideMarketingLink(window.location) == true) {
        $("#message").hide();
        if (typeof GetMap != "undefined") {
            //LogIt('GetMap Early');
            GetMap();
        }
        return;
    }
    var marketinglistheight = "130px";

    var uri = ServicePrefix + "/api/GetUserMarketingList/?latitude=" + lat + "&longitude=" + lng;

    $.get(uri).then(function(result) {

        if (result == null) {
            showAlert('returned no data');
            return;
        }

        if (result.Status != null) {
            if (result.Status != "SUCCESS") {
                showAlert(result.Message);
                return;
            } else {

                maxDots = result.Results.length - 1;

                if (result.Results.length == 0) {
                    $("#message").hide();
                } else {

                    var msg = '<div id="myCarousel" class="carousel slide" data-ride="carousel" data-interval="false" data-wrap="false">\n';

                    msg = msg + '<ol style="margin-top:20px;bottom:-10px;"class="carousel-indicators">\n';
                    for (var i = 0; i < result.Results.length; i++) {
                        msg = msg + '<li style="margin-left:5px;margin-right:5px"id="dot_' + i + '" data-target="#myCarousel" onclick="HitTheDot(' + i + ');" data-slide-to="' + i.toString() + '" ' + (i == 0 ? ' class="dots active" ' : ' class="dots"') + '></li>\n';
                    }
                    msg = msg + '</ol>\n';


                    msg = msg + '<div class="carousel-inner" role="listbox">\n';
                    for (var i = 0; i < result.Results.length; i++) {
                        msg = msg + '<div class="item' + (i == 0 ? ' active' : '') + '">';
                        msg = msg + result.Results[i].MarketingListMessage;
                        msg = msg + '</div>\n';

                    }
                    msg = msg + '</div>\n';
                    //<img src="../assets/common/images/leftarrow.png" />
                    msg = msg + "<div style='width:100%'>";
                    msg = msg + '<a style="padding-top:50px;"class="left carousel-control" href="#myCarousel" onclick="PrevDot()" role="button" >';
                    msg = msg + '<span style="font-size:36px;font-weight:100;margin-left:-20px" aria-hidden="true">&lt;</span>';
                    msg = msg + '<span class="sr-only">Previous</span>';
                    msg = msg + '</a>\n';

                    msg = msg + '<a style="padding-top:50px" class="right carousel-control" href="#myCarousel" onclick="NextDot()"  role="button" >';
                    msg = msg + '<span  style="font-size:36px;font-weight:100;margin-right:-20px" aria-hidden="true">&gt;</span>';
                    msg = msg + '<span class="sr-only">Next</span>';
                    msg = msg + ' </a>\n';
                    msg = msg + '</div>\n';


                    msg = msg + '</div>\n';

                    ////LogIt(msg);

                    $("#message").html(msg);
                    $("#message").show();
                }
                if (typeof GetMap != "undefined") {
                    //LogIt('GetMap late');
                    GetMap();
                }

                $(document).ready(function() {

                    // Activate Carousel
                    $("#myCarousel").carousel({
                        interval: false
                    });

                    //// Enable Carousel Indicators
                    //$(".item").click(function () {
                    //    $("#myCarousel").carousel(0);
                    //});

                    // Enable Carousel Controls
                    //$(".left").click(function () {
                    //    $("#myCarousel").carousel("prev");
                    //});
                    //// Enable Carousel Controls
                    //$(".right").click(function () {
                    //    $("#myCarousel").carousel("next");
                    //});
                });

                // LoadMarketingList();

            }
        } else {
            return;
        }
    });


}

function PrevDot() {

    ////LogIt('newDot-prev');
    ////LogIt(currentDot);
    ////LogIt(maxDots);

    if (currentDot == 0) {
        currentDot = maxDots;
    } else {
        currentDot = currentDot - 1;
    }
    HitTheDot(currentDot);
}

function NextDot() {

    //////LogIt('newDot-next');
    //////LogIt(currentDot);
    //////LogIt(maxDots);

    if (currentDot == maxDots) {
        currentDot = 0;
    } else {
        currentDot = currentDot + 1;
    }
    HitTheDot(currentDot);
}

function HitTheDot(item) {

    if (item == maxDots) {
        $(".senduserhome").show();
    } else {
        $(".senduserhome").hide();
    }

    var slider = $(".carousel-inner");

    $(".dots").removeClass('active');
    $("#dot_" + item).addClass("active");

    currentDot = item;

    slider.carousel({
        interval: false
    });
    slider.carousel(item);

    //slider.carousel(item);
    //slider.carousel({ interval: false });
}

var LoadMarketingListID = null;

function LoadMarketingList() {

    try {
        $('.marketing-list-spinner').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000
        });

        //$("#divMarketingList").show();

        clearTimeout(LoadMarketingListID);

    } catch (ex) {

        //$("#divMarketingList").hide();
        //LogIt(ex);
        LoadMarketingListID = setTimeout(LoadMarketingList, 1000);
    }
}

function ShowDiv(div) {
    $(div).show();
}

var bSilentDiscountCodeMode = false;

function CheckDiscountCode(discountcode, silentmode) {
    RemoveCookieItem("enteredDiscountCode");

    //------------------------------------------------------------------------
    // silent mode: true - no error message, false - display error message
    // set global variable for use in callbacks...
    //------------------------------------------------------------------------
    bSilentDiscountCodeMode = silentmode;
    $("#spnDiscount").html();

    var uri = ServicePrefix + "/api/CheckDiscountCode/?discountcode=" + discountcode;

    $.get(uri).then(function(result) {

        if (result == null) {
            showAlert('returned no data');
            return;
        }

        if (result.Status != null) {
            if (result.Status != "SUCCESS") {
                showAlert(result.Message);
                return;
            } else {
                if (result.Results.length == 0) {
                    showAlert('Issue with Discount Code Check');
                    return;
                } else {
                    applyDiscountCode(result.Results[0]);

                }

            }
        } else {
            return;
        }
    });


}

function clearDiscountCode() {

}

function applyDiscountCode(result) {

    var bServiceIDRestriction = false;
    var bServiceIDMatch = false;

    var bUserIDRestriction = false;
    var bUserIDMatch = false;

    var TotalDiscountDollars = 0;

    var DiscountPct = 0.0;
    var DiscountDollars = 0.0;
    var discountCart = JSON.parse(GetCookieItem("cart"));




    // --------------------------------
    // Discount Type? Dollars win over pct
    // ---------------------------------
    if (result.DiscountDollarsValue > 0) {
        DiscountDollars = result.DiscountDollarsValue;
    } else if (result.DiscountPctValue > 0) {
        DiscountPct = result.DiscountPctValue;
    } else {
        result.DiscountCodeErrorMessage = (result.DiscountCodeErrorMessage.length > 0 ? result.DiscountCodeErrorMessage : "Invalid Promo Code - no % or $");
        DiscountPct = 0.0;
        DiscountDollars = 0.0;
        result.DiscountCodeID = 0;
    }

    //-------------------------
    // Do we have a match on Service
    //--------------------------

    if (typeof result.ItemResults != "undefined") {
        bServiceIDMatch = false;
        for (var i = 0; i < result.ItemResults.length; i++) {
            bServiceIDRestriction = true;

            for (var y = 0; y < discountCart.cartItems.length; y++) {

                if (discountCart.cartItems[y].itemServiceID == result.ItemResults[i].ID) {
                    bServiceIDMatch = true;
                    break;
                }
            }
        }
    }

    if (bServiceIDRestriction == true && bServiceIDMatch == false) {
        result.DiscountCodeErrorMessage = (result.DiscountCodeErrorMessage.length > 0 ? result.DiscountCodeErrorMessage : "Promo Code does not match specific service");
        DiscountPct = 0.0;
        DiscountDollars = 0.0;
        result.DiscountCodeID = 0;
    }

    //-------------------------
    // Do we have a match on User
    //--------------------------
    if (typeof result.UserResults != "undefined") {
        bUserIDMatch = false;
        for (var i = 0; i < result.UserResults.length; i++) {

            bUserIDRestriction = true;

            for (var y = 0; y < discountCart.cartItems.length; y++) {

                if (user.UserID == result.UserResults[i].UserID) {
                    bUserIDMatch = true;
                    break;
                }
            }
        }
    }

    if (bUserIDRestriction == true && bUserIDMatch == false) {
        result.DiscountCodeErrorMessage = (result.DiscountCodeErrorMessage.length > 0 ? result.DiscountCodeErrorMessage : "Promo Code does not match specific user");
        DiscountPct = 0.0;
        DiscountDollars = 0.0;
        result.DiscountCodeID = 0;
    }

    //--------------------------------
    // OK - lets start
    // calculating
    //--------------------------------
    for (var x = 0; x < discountCart.cartItems.length; x++) {
        if (discountCart.cartItems[x].itemCost > 0) {
            var itemDiscount = 0;

            // This is pct...
            if (DiscountPct > 0) {
                itemDiscount = parseFloat(discountCart.cartItems[x].itemCost).toFixed(2) * parseFloat(DiscountPct);
                if (itemDiscount > parseFloat(discountCart.cartItems[x].itemCost)) {
                    itemDiscount = parseFloat(discountCart.cartItems[x].itemCost);
                }
                TotalDiscountDollars = TotalDiscountDollars + itemDiscount;
            }

            // This is dollars...
            if (DiscountDollars > 0) {
                itemDiscount = parseFloat(DiscountDollars);
                if (itemDiscount > parseFloat(discountCart.cartItems[x].itemCost)) {
                    itemDiscount = parseFloat(discountCart.cartItems[x].itemCost);
                }
                DiscountDollars = DiscountDollars - itemDiscount;
                TotalDiscountDollars = TotalDiscountDollars + itemDiscount;
            }

            discountCart.cartItems[x].itemDiscountApplied = itemDiscount;
            discountCart.cartItems[x].itemDiscountCodeID = result.DiscountCodeID;
        }
    }


    // -------------------------
    // Final Calcs and UI updates
    //----------------------------
    gDiscountDollars = TotalDiscountDollars;

    var SubtotalCost = gTotalDiscountableSubCost;
    var totalCost = gTotalDiscountableCost;

    SubtotalCost = SubtotalCost - gDiscountDollars;
    totalCost = totalCost - gDiscountDollars;


    //LogIt(JSON.stringify(discountCart.cartItems));

    if (gDiscountDollars > 0) {
        $("#divDiscountDollars").html("-$" + gDiscountDollars.toFixed(2).toString());
        SubtotalCost = SubtotalCost - gDiscountDollars;
        $("#divDiscountRow").show();
        $("#spnDiscount").html("DISCOUNT: $" + gDiscountDollars.toFixed(2).toString());


    } else {
        $("#divDiscountDollars").val("");
        $("#divDiscountRow").hide();
        $("#spnDiscount").html("");

    }

    //var myTotal = 0;
    //var mySubTotal = 0;

    //for (var j = 0; j < discountCart.cartItems.length; j++)
    //{
    //    myTotal = myTotal + (discountCart.cartItems[j].itemCost - discountCart.cartItems[j].itemDiscountApplied);
    //}

    //mySubTotal = myTotal;

    //myTotal = myTotal + parseFloat(gPreTip);

    //$("#SubtotalCost").html(SubtotalCost.toFixed(2).toString());
    //$("#totalCost").html(totalCost.toFixed(2).toString());

    //$("#SubtotalCost").html(mySubTotal.toFixed(2).toString());
    //$("#totalCost").html(myTotal.toFixed(2).toString());
    //----------------------
    // Update the cart
    //-----------------------
    UpdateCookieItem("cart", JSON.stringify(discountCart));

    //------------------------
    // Reset Totals
    //------------------------
    CalculateCartDisplayTotals(discountCart);
    //-----------------------
    // display message
    //-----------------------
    if (bSilentDiscountCodeMode == false) {
        if (result.DiscountCodeID == 0) {
            showAlert(result.DiscountCodeErrorMessage);
        } else {
            showAlert("Promo Code applied");
            //            showAlert("Valid Promo Code");
        }
    }
    //-----------------------
    // Clear variables
    //-----------------------
    if (result.DiscountCodeErrorMessage.length > 0) {
        result.DiscountCodeID = 0;
        result.DiscountCode = "";
    }
    //-----------------------
    // Update Cookie
    //-----------------------
    UpdateCookieItem("enteredDiscountCode", result.DiscountCode);

}

function CalculateCartDisplayTotals(inCart) {
    var myTotal = 0;
    var mySubTotal = 0;

    //LogIt(JSON.stringify(inCart));
    for (var j = 0; j < inCart.cartItems.length; j++) {
        myTotal = myTotal + (parseFloat(inCart.cartItems[j].itemCost.toString()) - parseFloat(inCart.cartItems[j].itemDiscountApplied.toString()));
    }

    mySubTotal = myTotal;
    //LogIt(gPreTip);

    myTotal = myTotal + parseFloat(gPreTip.toString());

    //$("#SubtotalCost").html(SubtotalCost.toFixed(2).toString());
    //$("#totalCost").html(totalCost.toFixed(2).toString());
    $("#page2Tip").html(gPreTip);

    if (gPreTip > 0) {
        $("#preTip").show();
        $("#divSubTotal").show();
    } else {
        $("#preTip").hide();
        $("#divSubTotal").hide();
    }
    $("#SubtotalCost").html(mySubTotal.toFixed(2).toString());
    $("#totalCost").html("$" + myTotal.toFixed(2).toString());
}

function BadDiscountCode(message) {
    if (bSilentDiscountCodeMode == false) {
        showAlert(message);
    }
}

function callPhone(to) {
    try {
        var platform = GetCookieItem("DevicePlatform");

        if (platform == "android") {
            window.location = "tel:+1" + to;
        } else {
            if (!PhoneCaller) {
                showAlert('PhoneCall plugin not ready');
                return;
            }

            PhoneCaller.call(to, function() {}, function(str) {
                alert(str);
            });
        }
    } catch (err) {
        alert(err.message);
    }
}
var smsapp = {
    sendSms: function(number, message) {
        //    var number = document.getElementById('numberTxt').value;
        //    var message = document.getElementById('messageTxt').value;
        //  alert(number);
        //    alert(message);

        //CONFIGURATION
        var options = {
            replaceLineBreaks: false, // true to replace \n by a new line, false by default
            android: {
                //intent: 'INTENT'  // send SMS with the native android SMS messaging
                intent: '' // send SMS without open any other app
            }
        };

        var success = function() {};
        var error = function(e) {};
        sms.send(number, message, options, success, error);
    }
};

//function sendAndroidSMS(to, message)
//{

//    //try
//    //{
//    //
//    //        if (!SMS)
//    //        {
//    //            alert('SMS plugin not ready');
//    //            return;
//    //        }
//    //
//    //        var sendto = to;
//    //        var textmsg = message;
//    //
//    //        if (sendto.indexOf(";") >= 0)
//    //        {
//    //            sendto = sendto.split(";");
//    //
//    //            for (i in sendto) {
//    //                sendto[i] = sendto[i].trim();
//    //            }
//    //        }
//    //
//    //
//    //        if (SMS)
//    //        {
//    //            SMS.sendSMS(sendto, textmsg, function () {alert('sent'); }, function (str) { alert(str); });
//    //        }
//    //}
//    //
//    //catch (err)
//    //{
//    //    alert (err.message);
//    //}

//}
////var smsapp = {



//            //sendSms: function (number, message) {
//            //    try
//            //        {
//            //                var platform = GetCookieItem("DevicePlatform");

//            //                if (platform == "android") {
//            //                    smsapp.checkSMSPermission(number, message);
//            //                    return;
//            //                }

//            //                //CONFIGURATION
//            //                var options = {
//            //                    replaceLineBreaks: false, // true to replace \n by a new line, false by default
//            //                    android: {
//            //                        intent: 'INTENT'  // send SMS with the native android SMS messaging
//            //                        //intent: '' // send SMS without open any other app
//            //                    }
//            //                };

//            //                var success = function () { showAlert('Message sent successfully'); };
//            //                var error = function (e) { showAlert('Message Failed:' + e); };

//            //                if (platform != "android") {
//            //                    sms.send(number, message, options, success, error);
//            //                }
//            //    }

//            //    catch (err) {
//            //       alert (err.message);
//            //    }
//            //},

//            //checkSMSPermission: function (number, message) {
//            //    try {

//            //    alert('checkSMSPermission');

//            //    var success = function (hasPermission) {
//            //        if (hasPermission)
//            //        {
//            //            //CONFIGURATION
//            //            var options = {
//            //                replaceLineBreaks: false, // true to replace \n by a new line, false by default
//            //                android: {
//            //                    intent: 'INTENT'  // send SMS with the native android SMS messaging
//            //                    //intent: '' // send SMS without open any other app
//            //                }
//            //            };

//            //            var success = function () { showAlert('Message sent successfully'); };
//            //            var error = function (e) { showAlert('Message Failed:' + e); };

//            //            sms.send(number, message, options, success, error);
//            //        }
//            //        else
//            //        {
//            //            showAlert('Permission denied - please check your settings');
//            //            // show a helpful message to explain why you need to require the permission to send a SMS
//            //            // read http://developer.android.com/training/permissions/requesting.html#explain for more best practices
//            //        }
//            //    };

//            //    var error = function (e) { showAlert('Something went wrong:' + e); };

//            //    sms.hasPermission(success, error);
//            //}
//            //    catch (err) {
//            //        alert (err.message);
//            //    }

//            //}



//};
function updateMarketingInfoCart(cart) {
    // alert(JSON.stringify(cart));
    var user = GetCookieItem("UserID");

    if (user.length == 0) {
        return;
    }


    var url = ServicePrefix + '/api/UpdateMarketingInfoCart';
    data = {
        userid: user,
        cart: JSON.stringify(cart)
    }

    $.ajax({
        data: data,
        dataType: "json",
        url: url,
        method: "POST",
        success: updateMarketingInfoCartSuccess,
        error: updateMarketingInfoCartError
    });

}

function updateMarketingInfoCartSuccess(result) {

    if (result == null) {
        showAlert('returned no data');
        return;
    }

    if (result.Status != "SUCCESS") {
        showAlert(result.Message);
        return;
    } else {
        return;

    }


}

function updateMarketingInfoCartError(jqXHR, textStatus, err) {
    showAlert(textStatus);
    return false;
}

function updateMarketingInfoAppLocation() {

    var user = GetCookieItem("UserID");

    if (user.length == 0) {
        return;
    }

    var page = window.location.toString();

    var url = ServicePrefix + '/api/UpdateMarketingInfoAppLocation';
    data = {
        userid: user,
        page: page
    }

    $.ajax({
        data: data,
        dataType: "json",
        url: url,
        method: "POST",
        success: updateMarketingInfoAppLocationSuccess,
        error: updateMarketingInfoAppLocationError
    });
}

function updateMarketingInfoAppLocationSuccess(result) {
    if (result == null) {
        showAlert('returned no data');
        return;
    }

    if (result.Status != "SUCCESS") {
        showAlert(result.Message);
        return;
    } else {
        return;

    }
}

function updateMarketingInfoAppLocationError(jqXHR, textStatus, err) {
    showAlert(textStatus);
    return false;
}

function alertme(control) {
    var controlmessage = $(control).html();
    var h = DynamicMenu("transparent", "white", "", "", "", false, "X", "closeAlert()")
    showAlert(controlmessage + "<hr style='margin-top:0px;margin-bottom:0px;padding-top:0px;padding-bottom:0px'>" + h, "scroll", "Ok", true);
}

function showme(control, controltohide) {
    $(control).show();

    if (typeof controltohide != "undefined") {
        $(controltohide).hide();

    }
}
// GET KEYS and save in local storage if empty
$(document).ready(function() {
    $("head").append('<meta content="telephone=no" name="format-detection">');
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var today = month + "/" + day + "/" + year;

    if (GetCookieItem("googleapikey") == "" || GetCookieItem("keylastupdate") != today) {

        var uri = ServicePrefix + "/api/getsetting/?settingkey=googleapikey";

        $.get(uri).then(function(result) {
            if (result == null) {
                showAlert('returned no data');
                return;
            }
            if (result.Status != null) {
                if (result.Status != "SUCCESS") {
                    showAlert(result.Message);
                    return;
                } else {
                    UpdateCookieItem('googleapikey', result.SettingValue);
                    UpdateCookieItem('keylastupdate', today);
                }
            }
        });
    }

    if (GetCookieItem("googleserver") == "" || GetCookieItem("keylastupdate") != today) {

        var uri = ServicePrefix + "/api/getsetting/?settingkey=googleserver";

        $.get(uri).then(function(result) {
            if (result == null) {
                showAlert('returned no data');
                return;
            }
            if (result.Status != null) {
                if (result.Status != "SUCCESS") {
                    showAlert(result.Message);
                    return;
                } else {
                    UpdateCookieItem('googleserver', result.SettingValue);
                    UpdateCookieItem('keylastupdate', today);
                }
            }
        });
    }
    if (GetCookieItem("mapquest") == "" || GetCookieItem("keylastupdate") != today) {

        var uri = ServicePrefix + "/api/getsetting/?settingkey=mapquest";

        $.get(uri).then(function(result) {
            if (result == null) {
                showAlert('returned no data');
                return;
            }
            if (result.Status != null) {
                if (result.Status != "SUCCESS") {
                    showAlert(result.Message);
                    return;
                } else {
                    UpdateCookieItem('mapquest', result.SettingValue);
                    UpdateCookieItem('keylastupdate', today);
                }
            }
        });
    }

    if (GetCookieItem("autoplay") == "" || GetCookieItem("keylastupdate") != today) {

        var uri = ServicePrefix + "/api/getsetting/?settingkey=mapquest";

        $.get(uri).then(function(result) {
            if (result == null) {
                showAlert('returned no data');
                return;
            }
            if (result.Status != null) {
                if (result.Status != "SUCCESS") {
                    showAlert(result.Message);
                    return;
                } else {
                    UpdateCookieItem('mapquest', result.SettingValue);
                    UpdateCookieItem('keylastupdate', today);
                }
            }
        });
    }

    var bNeedGoogleKey = false;
    var GoogleAnalyticsKey = "";

    if (gMobileVersion == false) {
        GoogleAnalyticsKey = "GoogleAnalytics";
    } else {
        GoogleAnalyticsKey = "GoogleAnalyticsMobile";
    }

    if (GetCookieItem(GoogleAnalyticsKey) == "") {
        bNeedGoogleKey = true;
    }

    if (bNeedGoogleKey == true) {
        var uri = ServicePrefix + "/api/getsetting/?settingkey=slickautoplay";

        $.get(uri).then(function(result) {

            if (result == null) {
                showAlert('returned no data');
                return;
            }

            if (result.Status != null) {
                if (result.Status != "SUCCESS") {
                    showAlert(result.Message);
                    return;
                } else {
                    UpdateCookieItem("slickautoplay", result.SettingValue);
                }
            }
        });

    } else {
        setTimeout(LoadGoogleAnalyticsLib, 20000);
    }


});

function BuildReferralLink() {
    var url = Site + "/account/register.html?l=joifulUserProfile&u=" + user.ReferralCode;
    return url;
}

function LogIt(entry) {
    var date = new Date();

}

function SendToArtistTools() {
    window.location = "../provider/providertools.html";
}



var onSuccessShare = function(result) {
    console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true 
    console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false) 
}

var onErrorShare = function(msg) {
    console.log("Sharing failed with message: " + msg);
}

//// Sharing Social for PhoneGap
//// this is the complete list of currently supported params you can pass to the plugin (all optional) 
var shareOptions = {
    message: '', // not supported on some apps (Facebook, Instagram) 
    subject: '', // fi. for email 
    files: [], // an array of filenames either locally or remotely 
    url: 'http://www.joiful.com',
    chooserTitle: '' // Android only, you can override the default share sheet title 
}

function SharePG() {
    var options = {
        message: 'Check out Joiful!', // not supported on some apps (Facebook, Instagram) 
        subject: 'Check out Joiful!', // fi. for email 
        files: [], // an array of filenames either locally or remotely 
        url: 'http://www.joiful.com/register.html?u=' + user.ReferralCode,
        chooserTitle: 'Joiful!' // Android only, you can override the default share sheet title 
    }

    ShareMobile(options);
}

function ShareMobile(options) {

    // Sharing Social for PhoneGap
    // this is the complete list of currently supported params you can pass to the plugin (all optional) 

    window.plugins.socialsharing.shareWithOptions(options, onSuccessShare, onErrorShare);
}

function SelectionMade() {
    $("#btnCancel").hide();
    $("#btnNext").show();
}

function disabledEventPropagation(event) {
    if (gIGNOREdisabledEventPropagation == true) {
        return;
    }

    console.log('disabledEventPropagation');

    if (event.stopPropagation) {
        event.stopPropagation();
    } else if (window.event) {
        window.event.cancelBubble = true;
    }
}
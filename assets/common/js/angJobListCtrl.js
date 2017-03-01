var newStatus = "";
var gLastURL = window.location;
var FirstJobStatus = "";
var gToJobAddress = "";
var gArtist = "";
var gProviderUserID = "";

var bTurnOnPolling = false;
var SearchForArtistCtr = 0;
var bShowGEO = false;

var bBidsMade = false;

var ClientName = "";
var myProviderUserID = "";
var myJobUserID = "";
var WaitingForAssignmentMode = false;
var LastDataSet = null;
//var ProviderAssigned = false;
var gURL = "";
var gTotalJobCount = 0;

app.controller('JobListCtrl', function($scope, $http) {
    // Check for valid input

    var myUserID = GetCookieItem("UserID");

    var myJobID = "0";

    var defaultMaxRecordCount = 10000;

    var myReturnRecordCount = defaultMaxRecordCount;

    var myProvider = false

    var myJobListDisplayMode = false;

    if (typeof JobListDisplayMode == 'undefined') {
        myJobListDisplayMode = false;
    } else {
        myJobListDisplayMode = JobListDisplayMode;
    }

    if (typeof bProvider == 'undefined') {
        myProvider = false;
    } else {
        myProvider = bProvider;
    }

    if (typeof ReturnRecordCount == 'undefined') {
        myReturnRecordCount = defaultMaxRecordCount;
    } else {
        myReturnRecordCount = ReturnRecordCount;
    }

    if (typeof JobID == 'undefined') {
        myJobID = "0";
    } else {
        myJobID = JobID;
    }

    var myStatusGroup = "";

    if (typeof StatusGroup == 'undefined') {
        myStatusGroup = "";
    } else {
        if (StatusGroup == "") {
            showAlert('Problem with Input.', 'SilentLogout();');
        }
        //else if (!myUserID) {
        //    showAlert('Problem with Input.', 'SilentLogout();');
        //}

        myStatusGroup = StatusGroup;
    }

    $scope.StatusGroup = myStatusGroup;
    $scope.providerview = myProvider;
    $scope.ReturnRecordCount = myReturnRecordCount;
    $scope.JobID = myJobID;
    $scope.JobListDisplayMode = myJobListDisplayMode;
    $scope.TurnOnPolling = false;
    $scope.imglib = ImagePrefix;

    $scope.MobileVersion = gMobileVersion;

    $scope.bCancelJob = (window.location.toString().toLowerCase().indexOf("canceljob.html") > -1 ? true : false);
    $scope.bTipPage = (window.location.toString().toLowerCase().indexOf("carttip.html") > -1 ? true : false);
    $scope.bReviewPage = (window.location.toString().toLowerCase().indexOf("cartreview.html") > -1 ? true : false);
    $scope.bDetailPage = (window.location.toString().toLowerCase().indexOf("jobdetail.html") > -1 ? true : false);

    var uri = ServicePrefix + "/api/GetJobListWithLimit/?userid=" + myUserID.toString() + "&usertype=" + (myProvider == true ? "provider" : "user") + "&jobid=" + myJobID + "&statusgroup=" + myStatusGroup + "&rows=" + myReturnRecordCount;

    $scope.bShowFilters = false;

    if ((myProvider == true) && (myJobID == '0')) {
        $scope.bShowFilters = true;
    }

    FirstJobStatus = "";
    $scope.FirstJobStatus = FirstJobStatus;


    $scope.NextSteps = "";
    $scope.DataAvailable = true;
    $scope.ProviderBio = "";
    $scope.ShowStillLooking = false;
    var bDataChanged = true;
    $scope.DataChanged = bDataChanged;

    $scope.getData = function() {

        $scope.StatusGroup = myStatusGroup;

        // Stop Notificaiton Poll when updates
        EndNotificationPoll();

        if (gNotificationPollPaused == false) {
            // Manually check for messge
            CheckForMessage();
        }

        if (myReturnRecordCount == 10000) {
            uri = ServicePrefix + "/api/GetJobList/?userid=" + myUserID.toString() + "&usertype=" + (myProvider == true ? "provider" : "user") + "&jobid=" + myJobID + "&statusgroup=" + myStatusGroup;
        } else {
            uri = ServicePrefix + "/api/GetJobListWithLimit/?userid=" + myUserID.toString() + "&usertype=" + (myProvider == true ? "provider" : "user") + "&jobid=" + myJobID + "&statusgroup=" + myStatusGroup + "&rows=" + myReturnRecordCount;
        }

        gLastURL = uri;

        $scope.FirstJobStatus = "";

        //$scope.DataAvailable = true;

        $http.get(uri).then(function(result) {
            $(".container").show();

            if (!result) {
                showAlert('returned no data', 'ReleasePage();');
                return;
            }

            if (result.data.Status != "SUCCESS") {
                showAlert(result.data.Message, 'ReleasePage();');
                return;
            }

            if (JSON.stringify(result.data.Results) != LastDataSet || LastDataSet == null) {

                bDataChanged = true;
            } else {
                bDataChanged = false;
            }

            $scope.DataChanged = bDataChanged;

            LastDataSet = JSON.stringify(result.data.Results);

            gTotalJobCount = result.data.Results.length;
            if (result.data.Results.length > 0) {
                $scope.DataAvailable = true;
                // Set Job Status
                $scope.FirstJobStatus = result.data.Results[0].JobStatus;
                FirstJobStatus = $scope.FirstJobStatus;

                //// Set Buttons
                if (myJobID != '0') {
                    // Some button work
                    if ((myProvider == false && FirstJobStatus == "open") || FirstJobStatus == 'providerassign' || FirstJobStatus == 'providertravel' || FirstJobStatus == 'servicestarted') {
                        $("#btnCancel").show();
                    } else {
                        $("#btnCancel").hide();
                    }

                    //------------------
                    // Complete session exits this page
                    // go to the review
                    //------------------
                    if ($scope.bTipPage == false && (FirstJobStatus == "complete" || (FirstJobStatus.indexOf('cancel') > -1))) {
                        RemoveCookie("ActiveSession");

                        if (FirstJobStatus == "complete") {
                            SendUserHome();
                        } else {
                            showAlert("This treatment " + (FirstJobStatus == "complete" ? "" : "has been canceled. Let's return to your home page."), "SendUserHome()");
                        }
                    }

                }
                // Security check
                PerformSessionCheck(FirstJobStatus);

                // Client Name
                ClientName = result.data.Results[0].FirstName;

                // Check for assign mode

                if (myJobID != '0') {
                    if (myProvider == false) {
                        if (result.data.Results[0].JobStatus == "open" && result.data.Results[0].ProviderUserID == '0') {
                            $(".appcontainer").css("background", '#d86018');
                            if (WaitingForAssignmentMode == false) {
                                setTimeout('ResetThePageToAssignMode(' + "true" + ')', 1);
                            }
                            WaitingForAssignmentMode = true;
                        } else {


                            if (WaitingForAssignmentMode == true) {

                                if (
                                    (result.data.Results[0].JobStatus != "open" && result.data.Results[0].ProviderUserID != '0') ||
                                    (result.data.Results[0].JobStatus.indexOf("cancel") > -1)
                                ) {
                                    $(".searchMode").hide();
                                    WaitingForAssignmentMode = false;
                                    var cJob = result.data.Results[0];
                                    AssignmentDone(cJob.ProviderUserID, cJob.ProviderFirstName, cJob.ProviderLicense, cJob.ProviderAvgReview, cJob.ProviderMobile, cJob.FirstName, false, cJob.CartAddress.AddressLine1, cJob.CartAddress.AddressLine2, cJob.CartAddress.City, cJob.CartAddress.State, cJob.CartAddress.ZipCode, cJob.Notes, cJob.JobID, cJob.CartItems[0].CartOfferingDescription);
                                    setTimeout('ResetThePageToAssignMode(' + "false" + ')', 1);
                                }
                            }

                        }
                    } else {
                        var cJob = result.data.Results[0];

                        if (firsttime == "true" && bDataChanged == true && cJob.JobStatus == "providerassign") {
                            AssignmentDone(cJob.ProviderUserID, cJob.FirstName, "", cJob.UserJobReviewRating, cJob.UserMobile, cJob.ProviderFirstName, true, cJob.CartAddress.AddressLine1, cJob.CartAddress.AddressLine2, cJob.CartAddress.City, cJob.CartAddress.State, cJob.CartAddress.ZipCode, cJob.Notes, cJob.JobID, cJob.CartItems[0].CartOfferingDescription);
                        }
                    }
                }

                if (myJobID != '0' && (FirstJobStatus == 'providerassign' || FirstJobStatus == 'providertravel')) {
                    $scope.ShowImage = false;
                } else {
                    $scope.ShowImage = true;
                }

                if ($scope.FirstJobStatus.toLowerCase() == "open") {
                    SearchForArtistCtr++;

                    if (SearchForArtistCtr == gSearchingForArtistMessageMax) {
                        SearchForArtistCtr = 0;
                        $scope.ShowStillLooking = true;
                    } else {
                        $scope.ShowStillLooking = false;
                    }

                } else {
                    $scope.ShowStillLooking = false;
                }

                gToJobAddress = result.data.Results[0].CartAddress.AddressLine1 + ' ' + result.data.Results[0].CartAddress.AddressLine2 + ' ' + result.data.Results[0].CartAddress.City + ' ' + result.data.Results[0].CartAddress.State + ' ' + result.data.Results[0].CartAddress.ZipCode;


                myJobUserID = result.data.Results[0].UserID;
                $scope.JobUserID = myJobUserID;

                myProviderUserID = result.data.Results[0].ProviderUserID;
                $scope.ProviderUserID = (typeof myProviderUserID === "undefined" ? "0" : result.data.Results[0].ProviderUserID);
                gProviderUserID = myProviderUserID;

                //------------------
                // Security...
                //------------------
                if (user.Persona == "provider") {
                    if ($scope.ProviderUserID != '0') {
                        if (user.UserID != $scope.ProviderUserID) {
                            if (user.UserID != $scope.JobUserID) {
                                RemoveCookie("ActiveSession");
                                SendUserHome();
                            }
                        }
                    }
                }
                //-------------------------------------
                // Update Map
                //-------------------------------------

                if (typeof HowFarAwayIsTheArtist != 'undefined') {
                    if (myProvider == false) {
                        HowFarAwayIsTheArtist();
                    }
                }


                if (bDataChanged == true) {
                    if (myJobID != "0") {
                        //console.log(FirstJobStatus);
                        if (FirstJobStatus == 'providerassign' || FirstJobStatus == 'providertravel') {
                            //console.log(myProvider);
                            if (myProvider == false) {
                                //console.log("Show IT");
                                $("#divFollowProvider").show();
                            }
                        }
                    }
                }

                gArtist = result.data.Results[0].ProviderFirstName; // + " " + result.data.Results[0].ProviderLastName;

                if (typeof myProviderUserID != "undefined") {
                    if (myJobID != "0" && $scope.ProviderUserID != "0" && $scope.ProviderBio.length == 0 && myProvider == false) {
                        uri = ServicePrefix + "/api/GetProviderBio/?providerid=" + myProviderUserID;

                        $http.get(uri).then(function(result) {

                            if (!result) {
                                showAlert('returned no data');
                                //return;
                            }

                            if (result.data.Status != "SUCCESS") {
                                showAlert(result.data.Message);
                                //return;
                            }

                            if (result.data.Results.length > 0) {

                                $scope.ProviderBio = result.data.Results[0].ProviderBio;
                            }
                        });
                    }
                }

                //---------------------------------------
                // This process sets javascript 
                // external variables if they are defined
                //-------------------------------------

                //---------------------------------
                // This is for Tip page so we can 
                // redirect a user to the review after
                //-----------------------------------
                if (typeof bReviewAdded != 'undefined') {
                    if (result.data.Results[0].ReviewID.length > 1) {
                        bReviewAdded = true;
                    } else {
                        bReviewAdded = false;
                    }
                }

                //-------------------------------------
                // Get Ready Text
                //--------------------------------------
                if (myJobID != "0" && $scope.ProviderUserID != "0" && $scope.NextSteps.length == 0 && myProvider == false) {
                    uri = ServicePrefix + "/api/GetServiceGroupNoteByServiceID/?serviceid=" + result.data.Results[0].ServiceID + "&notetypetoken=postjobrequest";
                    $http.get(uri).then(function(result) {

                        if (!result) {
                            showAlert('returned no data');
                            //return;
                        }

                        if (result.data.Status != "SUCCESS") {
                            showAlert(result.data.Message);
                            //return;
                        }

                        if (result.data.Results.length > 0) {

                            $scope.NextSteps = result.data.Results[0].ServiceGroupAdditionalNote;
                        }
                    });
                }


                //---------------------------------
                // This is for cartreview page so we can 
                // redirect a user to the tip after
                //--------------------------------------
                if (typeof bTipAdded != 'undefined') {
                    if (result.data.Results[0].GratuityID.length > 1) {
                        bTipAdded = true;
                    } else {
                        bTipAdded = false;
                    }

                    if (myProvider == true) {
                        bTipAdded = true;
                    }
                }

                //-------------------------
                // This is for short lists
                //-------------------------
                if (myReturnRecordCount != defaultMaxRecordCount) {
                    if (result.data.Results.length > myReturnRecordCount) {
                        result.data.Results.length = myReturnRecordCount;
                    }
                }

                //----------------------------
                // Finally set results
                //----------------------------

                if (bDataChanged == true) {

                    $scope.JobList = result.data.Results;
                    unblockUI();
                    if ($("#divHistory").is(":visible") == false) {
                        $("#divHistory").show();
                    }
                    ReleasePage();
                    if ($scope.bTipPage == true) {
                        setTimeout(ShowCCInfo, 1000);
                    }

                }

            } else {
                if (bDataChanged == true) {
                    $scope.JobList = null;
                    var myUserType = GetCookieItem("Persona");
                    unblockUI();
                    ReleasePage();
                    $scope.DataAvailable = false;
                }


            }


            // Job entry
            if (myJobID != "0") {
                if ($scope.FirstJobStatus != "complete" && $scope.FirstJobStatus != "usercancel" && $scope.FirstJobStatus != "providercancel") {
                    bTurnOnPolling = true;
                }
            } else { // Group Entry
                if (myStatusGroup != "history") {
                    bTurnOnPolling = true;
                }
            }

            if (bTurnOnPolling == true && $scope.TurnOnPolling == false) {
                $scope.TurnOnPolling = true;
                setInterval($scope.getData, gSettingReportRefreshPollInterval);
                //$scope.getData();
            }

            if (gTotalJobCount > 4) {
                $("#scrollmewindow").removeClass("scrollmenewheader");
                $("#scrollmewindow").addClass("scrollmenewheaderfooter");

            } else {
                $("#scrollmewindow").removeClass("scrollmenewheaderfooter");
                $("#scrollmewindow").addClass("scrollmenewheader");

            }
        });

        var lblToChange = "";

        if (myStatusGroup == "history" && myProvider == false) {
            lblToChange = "lblBtnHistoryBooking";
        }
        if (myStatusGroup == "user-active") {
            lblToChange = "lblBtnActiveBooking";
        }
        if (myStatusGroup == "history" && myProvider == true) {
            lblToChange = "lblBtnHistory";
        }
        if (myStatusGroup == "provider-active") {
            lblToChange = "lblBtnActive";
        }
        if (myStatusGroup == "provider-open") {
            lblToChange = "lblBtnOpen";
        }

        if (lblToChange.length > 0) {
            ChangeLabelColor('lblRpt', lblToChange);
        }


        if (myJobID != '0' && (FirstJobStatus == 'providerassign' || FirstJobStatus == 'providertravel')) {
            $scope.ShowImage = false;
        } else {
            $scope.ShowImage = true;
        }

        //setTimeout(AddThisRoutine, 1000);
    }

    if (myUserID.length > 1) {
        $scope.getData();
    }

    $scope.sendSms = function(to, message) {
        smsapp.sendSms(to, message);
    }

    $scope.callPhone = function(to) {
        callPhone(to);
    }
    $scope.getTotalNeeded = function(v) {

        var total = 0;

        for (var i = 0; i < $scope.JobList[v].CartItems.length; i++) {
            if ($scope.JobList[v].CartItems[i].CartOfferingCost != '0') {
                total++;
            }
        }
        return total;
    }

    $scope.TakeMeThere = function(v) {
        closeConfirm();
        StartNavigation();
    }

    $scope.getTotal = function(v) {

        var total = 0;

        for (var i = 0; i < $scope.JobList[v].CartItems.length; i++) {
            total += parseFloat($scope.JobList[v].CartItems[i].CartOfferingCost);
        }
        return total;
    }



    $scope.More = function() {
        blockUI();
        myReturnRecordCount = myReturnRecordCount + 5;
        $scope.getData();
    }

    $scope.GetFullDescription = function(cartItems) {

        var desc = "";

        for (var i = 0; i < cartItems.length; i++) {
            if (cartItems[i].CartOfferingDescription.length > 0) {
                if (cartItems[i].CartOfferingDescription.toLowerCase().indexOf('tip') == -1) {
                    if (i > 0) {
                        desc = desc + "<br>";

                    }
                    //desc = desc +  cartItems[i].CartOfferingDescription + '\n\r';
                    desc = desc + cartItems[i].CartOfferingDescription.replace(" - ", "").trim();
                }
            }

        }
        return desc;


    }
    $scope.GetStatusName = function(inStatus) {

        switch (inStatus) {

            case 'init':
                return 'Initialized';
                break;

            case 'open':
                return 'Open';
                break;

            case 'processing':
                return 'Processing';
                break;

            case 'usercancel':
                return 'Customer Cancellation';
                break;

            case 'systemcancel':
                return 'System Cancellation';
                break;

            case 'providerassign':
                return 'Artist Assigned';
                break;

            case 'providertravel':
                return 'Artist Travelling';
                break;

            case 'providercancel':
                return 'Artist Cancellation';
                break;

            case 'servicestarted':
                return 'Service Started';
                break;

            case 'serviceended':
                return 'Service Ended';
                break;

            case 'processtrans':
                return 'Processing';
                break;

            case 'complete':
                return 'Complete';
                break;

            case 'ccfail':
                return 'Complete *';
                break;

            case 'closed':
                return 'Closed';
                break;

            case 'refunded':
                return 'Refunded';
                break;

            default:
                return inStatus;
                break;
        }
    }

    $scope.ReportViewChange = function(StatusGroup, bProviderView) {
        blockUI();
        myStatusGroup = StatusGroup;
        myProvider = bProviderView;
        $scope.getData();
    }

    $scope.ViewDetails = function(JobID) {
        window.location = "../cart/jobdetail.html?JobID=" + JobID + "&Provider=" + myProvider.toString().toLowerCase();
    }

    $scope.ReviewJob = function(JobID, ProviderView) {
        window.location = "../cart/cartreview.html?jobid=" + JobID + "&provider=" + ProviderView.toString().toLowerCase();
    }

    $scope.AddTipToJob = function(JobID) {
        window.location = "../cart/carttip.html?jobid=" + JobID;
    }

    $scope.RebookJob = function(JobID, ProviderID, ProviderName) {
        var callbackYes = 'RebookJobYes("' + JobID + '","' + ProviderID + '","' + ProviderName + '")';
        var callbackNo = 'RebookJobNo("' + JobID + '")';
        //alert(ProviderID.length);
        //alert(ProviderID);
        if (ProviderID.length > 1) {
            showConfirm("Would you like to see if " + ProviderName + " is available to perform this service?", "Yes", "No", callbackYes, callbackNo);
        } else {
            window.location = "../cart/review.html?rebookjobid=" + JobID + "&preferredproviderid=" + ProviderID;
        }
    }

    $scope.GetReceipt = function(JobID) {
        window.location = "../cart/receipt.html?rebookjobid=" + JobID;
    }
    $scope.TravelJob = function(JobID) {
        APICallStatusUpdate(JobID, "providertravel");
    }

    $scope.StartJob = function(JobID) {
        APICallStatusUpdate(JobID, "servicestarted");
    }

    $scope.EndJob = function(JobID) {
        APICallStatusUpdate(JobID, "complete");
    }

    $scope.CancelJob = function(JobID, ProviderView) {
        CancelQuestion(JobID, ProviderView);

    }

    $scope.BidJob = function(JobID) {
        LogIt('start bid on job');
        $(".jlBid" + JobID).hide();
        $(".jlBidMade" + JobID).show();
        APICallStatusUpdate(JobID, "bidonjob");
    }


    $scope.showme = function(control, index, oldcontrol) {
        $("#jlMoreIcon" + index).hide();

        $(control + index.toString()).show();

        if (typeof oldcontrol != "undefined") {
            showhide(oldcontrol + index.toString());
        }
    }
});

function ShowCCInfo() {
    $("#CCSection").show();
}

function RebookJobYes(JobID, ProviderID, ProviderName) {
    var url = "../cart/review.html?rebookjobid=" + JobID + "&preferredproviderid=" + ProviderID;

    showAlert('Great! We will let ' + ProviderName + ' know. No guarantee, but hopefully ' + ProviderName + ' is available.', url, "Ok");

}

function RebookJobNo(JobID) {
    window.location = "../cart/review.html?rebookjobid=" + JobID;
}

function PerformSessionCheck(FirstJobStatus) {
    if (FirstJobStatus.length == 0) {
        return;
    }

    var bLockSession = true;

    if (user.Persona == "provider") {
        if (
            FirstJobStatus == "open" ||
            FirstJobStatus == "init" ||
            FirstJobStatus == 'complete' ||
            FirstJobStatus == 'ccfail' ||
            FirstJobStatus == 'closed' ||
            FirstJobStatus == 'refunded' ||
            FirstJobStatus == 'serviceended' ||
            FirstJobStatus == 'providercancel' ||
            FirstJobStatus == 'systemcancel' ||
            FirstJobStatus == 'usercancel' ||
            FirstJobStatus == 'processing' ||
            FirstJobStatus == 'refunded'
        ) {
            bLockSession = false;
        }
    } else {
        if (
            //FirstJobStatus == "open"           || 
            FirstJobStatus == "init" ||
            FirstJobStatus == 'complete' ||
            FirstJobStatus == 'ccfail' ||
            FirstJobStatus == 'closed' ||
            FirstJobStatus == 'refunded' ||
            FirstJobStatus == 'serviceended' ||
            FirstJobStatus == 'providercancel' ||
            FirstJobStatus == 'systemcancel' ||
            FirstJobStatus == 'usercancel' ||
            FirstJobStatus == 'processing' ||
            FirstJobStatus == 'refunded'
        ) {
            bLockSession = false;
        }
    }

    if (bLockSession == true) {
        var TempProvider = false;
        if (typeof bProvider == 'undefined') {
            TempProvider = false;
        } else {
            TempProvider = bProvider;
        }
        UpdateCookieItem("ActiveSession", "../cart/jobdetail.html?jobid=" + JobID.toString()) + "&provider=" + TempProvider.toString().toLowerCase();
        //gCustomerHomePage = GetCookieItem("ActiveSession");
        //gProviderHomePage = GetCookieItem("ActiveSession");
        ResetMenuItems();
    } else {

        gCustomerHomePage = gCustomerDefaultHomePage;
        gProviderHomePage = gProviderDefaultHomePage;
        RemoveCookie("ActiveSession");
        ResetMenuItems();
    }
}

function ResetArtistCounter() {
    SearchForArtistCtr = 0;
}
//---------------------------------
// Common Javascript functions 
// for this view
//---------------------------------

function cancelJobClick(JobID, ProviderView) {
    var newStatus = (ProviderView == true ? "providercancel" : "usercancel");
    APICallStatusUpdate(JobID, newStatus);
}
var gStatus = "";
var gJobID = "";

function APICallStatusUpdate(jobid, status) {

    gStatus = status;
    gJobID = jobid;

    UpdateCookieItem("providercommand", status);

    blockUI();

    // set global
    newStatus = status;

    LogIt("new status:" + newStatus);

    var uri = ServicePrefix + '/api/UpdateJobStatus/';

    var postData = {
        userid: user.UserID,
        jobid: jobid,
        status: status,
        usertype: (bProvider ? "provider" : "user")
    }

    $.ajax({
        data: postData,
        dataType: "json",
        url: uri,
        method: "POST",
        success: APICallStatusSuccess,
        error: APICallStatusError
    });

}

function APICallStatusSuccess(result) {

    LogIt("new status:" + newStatus);

    unblockUI();

    if (result == null) {
        showAlert('returned no data');
        return;
    }

    if (result.Status != "SUCCESS") {

        if (result.Message.toLowerCase().indexOf("duplicate") == -1) {
            showAlert(result.Message);
            return;
        }
    }

    if (newStatus == "bidonjob") {
        LogIt("bidonjobdone2");
        $(".jlBidMade" + gJobID).show();
        $(".jlBid" + gJobID).hide();
        return;
    }

    var url = window.location;

    url = url.toString();

    var zFound = url.indexOf("&z");

    if (zFound > -1) {
        url = url.toString().substring(0, zFound);
        url = url + "&z=" + new Date().getTime();
    } else {
        url = url + "&z=" + new Date().getTime();
    }

    gURL = url;
    //alert(url.toString().indexOf("statusgroup="));

    var bJobID = true;
    var Status = "";

    //////// Does the last request have a jobid
    //////if (url.toString().indexOf("jobid=0") > -1)
    //////{
    //////    bJobID = false;
    //////}

    //////// Ignore if on index.html
    //////if (url.toString().indexOf("index.html") > -1)
    //////{
    //////    bJobID = true;
    //////}

    //////// Get the status group
    //////if (bJobID == false)
    //////{
    //////    // Last service call URL
    //////    if (gLastURL.toString().indexOf("&statusgroup=") > -1)
    //////    {
    //////        // lets get the status group
    //////        var sPoint = gLastURL.toString().indexOf("&statusgroup=");
    //////        Status = gLastURL.substring(sPoint);
    //////        var lenCompare = "&statusgroup=".length;

    //////        // We have a statusgroup in the url
    //////        // Is there anything in it?
    //////        if (Status.length > lenCompare)
    //////        {
    //////            var newURLStartPoint = url.toString().indexOf("&statusgroup=");

    //////            // Build New URL from the window.location/url
    //////            // but we only want to strip off the old statusgroup
    //////            // if it exists
    //////            if (newURLStartPoint > -1)
    //////            {
    //////                var newURLEndPoint = newURLStartPoint - lenCompare;

    //////                url = url.toString().substring(0, newURLStartPoint)

    //////            }
    //////            // always add on the status 
    //////            url = url + Status;
    //////        }

    //////    }
    //////}

    var StatusMessage = "status updated";

    switch (newStatus) {
        case "bidonjob":
            StatusMessage = "";
            break;
        case "providertravel":
            StatusMessage = "";
            break;
        case "servicestarted":
            StatusMessage = "A Joiful moment in the making!  We know you’ll exceed " + ClientName + "'s expectations.";
            break;
        case "complete":
            StatusMessage = "Success! Another Joiful moment created!";
            break;

    }

    if (newStatus == "bidonjob") {
        LogIt("bidonjobdone3");
        $(".jlBidMade" + gJobID).show();
        $(".jlBid" + gJobID).hide();
        return;
    } else if (newStatus == "providertravel") {

        if (gMobileVersion == true) {
            showConfirm('Would you like to open your navigation system for directions?', 'Yes', 'No', 'StartNavigation();', 'GoTo();');
        } else {
            GoTo();
        }
    } else if (newStatus == "complete") {

        SendUserHome();
    } else {
        if (StatusMessage.length) {
            showAlert(StatusMessage, url);
        } else {
            window.location = url;
        }
    }
}

function GoTo() {
    closeConfirm();
    window.location = gURL;
}

function APICallStatusError(result, textStatus, err) {
    if (newStatus == "bidonjob") {
        $(".jlBidMade" + gJobID).hide();
        $(".jlBid" + gJobID).show();
    }

    url = window.location;

    showAlert(err, url);

}

function GetPageDescription(StatusGroup, bProvider) {
    return "";
    var PageDescription = "Sessions";

    switch (StatusGroup.toLowerCase()) {
        case "history":
            PageDescription = (bProvider ? "HISTORY" : "HISTORY");
            break;

        case "provider-active":
            PageDescription = "Sessions";
            break;

        case "provider-open":
            PageDescription = "Sessions";
            break;

        case "user-active":
            PageDescription = "Treatments";
            break;

        case "":
            PageDescription = "Session Details";
            break;

        default:
            PageDescription = "Sessions";
    }

    return PageDescription;
}

function ResetThePageToAssignMode(bReset) {

    //console.log(bReset);
    if (bReset == true) {

        var col = "#d86018";

        $(".angContainer").css("background-color", col);
        $(".spa-menu-container").css("background-color", col);
        $(".container").css("background-color", col);
        $("#message").hide();
        $("#headerrow").css("background-color", col);
        $("#messageHeading").html("");
        $("#headerrow").removeClass("border-bottom");
        $("#btnCancel").show();
    } else {
        var col = "white";
        $(".angContainer").css("background-color", col);
        $(".spa-menu-container").css("background-color", col);
        $(".container").css("background-color", col);
        $("#message").show();
        $("#btnCancel").hide();
        $("#headerrow").css("background-color", col);
        $("#messageHeading").html("");
        $("#btnCancel").css("color", gColors.PeacefulGray);

    }
}

function GetURL(url) {

    var PagesToCheck = ['/account/', '/cart/', '/customer/', '/profile/', '/provider/'];

    for (var i = 0; i < PagesToCheck.length; i++) {

        if (url.toString().toLowerCase().indexOf(PagesToCheck[i]) > -1) {

            var startPoint = url.toString().toLowerCase().indexOf(PagesToCheck[i]);

            return ".." + url.substring(startPoint);
        }
    }

}

function GetReady() {
    $('.locationcontainer').hide();
    $("#jlAddressLine0").hide();
    $("#divFollowProvider").show();
    $(".divGetReadyBtn").hide();
    if ($('.locationcontainer').height() > 100) {
        $(".divGetReadyText").css("height", $('.locationcontainer').height() + "px");
    }
    $(".divGetReadyText").show();
}

function FollowProvider() {
    $('.locationcontainer').show();
    $("#jlAddressLine0").hide();
    $("#divFollowProvider").hide();
    $(".divGetReadyBtn").show();
    if ($('.locationcontainer').height() > 100) {
        $(".divGetReadyText").css("height", $('.locationcontainer').height() + "px");
    }
    $(".divGetReadyText").hide();
}

function CancelQuestion() {
    $("#divCancelQuestion").css("width", $(".appcontainer").width());
    $("#divCancelQuestion").css("height", $(".appcontainer").height());
    $("#divCancelQuestion").css("left", $(".appcontainer").left);
    $("#divCancelQuestion").css("top", $(".appcontainer").top);
    $("#divCancelQuestion").show();
}

function GoToCancelScreen() {
    var newStatus = (bProvider == true ? "providercancel" : "usercancel");
    window.location = "../cart/canceljob.html?jobid=" + JobID + "&provider=" + bProvider + "&newstatus=" + newStatus;
}

function CancelTheCancel() {
    $("#divCancelQuestion").hide();
}

function AssignmentDone(ProviderUserID, ProviderFirstName, ProviderLicNbr, ProviderAvgReview, ProviderMobile, UserFirstName, bProviderView, Address1, Address2, City, State, Zip, Notes, JobID, Service) {

    if (typeof HowFarAwayIsTheArtist != "undefined") {
        if (bProviderView == false) {
            HowFarAwayIsTheArtist();
        }
    }



    $("#searchMode").hide();
    var work = "";




    // Line 0
    work = work + "<div class='row noPadding' style='width:100%;max-width:580px;'>";
    work = work + "<div class='col-xs-12' style='text-align:center'>";
    work = work + "<div style='vertical-align:middle;display:table-cell;height:50px;'><img style='height:45px;width:45px;' src='../assets/common/images/selected.png'/></div>";
    work = work + "<div style='vertical-align:bottom;height:50px;padding-left:15px;display:table-cell;text-align:center;font-size:48px;color:white'>ALL SET!</div>";
    work = work + "</div>";
    work = work + "</div>";

    // Open it up
    work = work + "<div style='width:100%;max-width:580px;background-color:white'>";

    //if (bProviderView == true) {
    // Line 1
    work = work + "<div class='row noPadding'>";
    work = work + "<div class='col-xs-12'>";
    work = work + "<div style='font-size:22px;text-align:center;height:40px;padding-top:5px;color:" + gColors.PeacefulGray + ";'>" + Service + "</div>";
    work = work + "</div>";
    work = work + "</div>";
    //}
    //else
    //{
    if (bProviderView == false) {
        work = work + "<div class='row noPadding border-top'>";
        work = work + "<div class='col-xs-12'>";
        work = work + "<div style='font-size:14px;text-align:center;padding:3px 0px 3px 0px;color:" + gColors.Turquoise + ";'>" + ProviderFirstName + " will arrive <span id='arrivalminutes'>shortly</span></div>";
        work = work + "</div>";
        work = work + "</div>";
    }

    // LINE 2
    work = work + "<div class='row noPadding border-top'>";

    // 1st Cell
    work = work + "<div class='col-xs-6 border-right' style='height:123px'>";

    if (bProviderView == false) {
        work = work + '  <div id="imgProviderContainer" style="margin:0 auto; text-align:center;padding-top:5px;padding-bottom:3px">';
        work = work + '      <img src="' + ImagePrefix + '/profile/' + ProviderUserID + '.jpg" class="img-circle" style="width:60px;max-height:60px;border-radius:50%;border:solid 2px #d86018" id="imgProvider" name="imgProvider" />';
        work = work + ' </div>';
    }
    // L0
    work = work + '<div>';

    // L2
    if (bProviderView == false) {
        // L1
        work = work + '<div style="margin:0 auto; text-align:center;padding-top:0px;vertical-align:middle">';
        work = work + '<div style="font-weight:600;color:' + gColors.PeacefulGray + '">';
        work = work + ProviderFirstName;
        work = work + '</div>';
    } else {
        // L1
        work = work + '<div style="margin:0 auto; text-align:center;padding-top:15px;vertical-align:middle">';
        work = work + '<div style="padding-top:20px;display:inline-block;margin:0 auto;font-size:11pt;color:' + gColors.PeacefulGray + '">';
        work = work + ProviderFirstName;
        work = work + '</div>';
    }
    // CL2
    // L2
    work = work + '<div style="color:#00A499;vertical-align:bottom">';
    work = work + '<span> ' + (ProviderAvgReview == 0 ? "5" : ProviderAvgReview) + '</span>&nbsp;<span><img style="height:18px;margin-top:-5px" src="../assets/common/images/stars.png" />\'s</span>';
    work = work + '</div>';
    // CL2



    work = work + (ProviderLicNbr.length > 0 ? '<div>License: ' + ProviderLicNbr + '</div>' : "");

    work = work + '</div>';
    // CL1
    work = work + '</div>';
    // CL0

    work = work + "</div>";
    // End Cell

    // 2nd Cell
    work = work + "<div class='col-xs-6'>";

    work = work + '<div style="margin: 0 auto; word-wrap: break-word; white-space:normal;text-align:center;vertical-align:middle">';
    // L0
    work = work + '<div>';
    // L1
    work = work + '    <button id="jlCustContact" onclick="showme(\'#contactme\', \'#jlCustContact\')" class="btn btn-md btn-block btn-notround" style="min-height:123px;background:white;color:#00A499" type="button">';
    work = work + '   <div class="glyphicon glyphicon-earphone"></div>';
    work = work + '    <div style="font-size:12px;color:' + gColors.PeacefulGray + '">Contact ' + ProviderFirstName + '</div>';

    work = work + '</button>';

    work = work + '<div id="contactme" style="color:black;font-size:14px;position:absolute;top:0px;left:0px;z-index:999; margin-top:45px; border-radius:0%;display:none;padding:3px 3px 3px 3px;border:none;width:100%;text-align:center;vertical-align:middle;height:100%">';
    // L3

    if (gMobileVersion == true) {
        work = work + '<div>';
        work = work + ' <button style="margin-top:0px" id="jlSendProviderSMS" onclick="smsapp.sendSms(' + '\'' + ProviderMobile + '\',' + '\'Hello ' + ProviderFirstName + ' this is ' + UserFirstName + ' your Joiful client' + '\');" class="btn btn-sm btn-success btn-block btn-notround" type="button">text</button>';
        work = work + ' <button style="margin-top:5px" id="jlSendProviderPhone" onclick="callPhone(' + '\'' + ProviderMobile + '\');" class="btn btn-sm btn-success btn-block btn-notround" type="button">call</button>';
        work = work + '</div>';
    } else {
        work = work + '<div style="font-size:14px">';
        if (ProviderMobile.length == 10) {
            work = work + '(' + ProviderMobile.substr(0, 3) + ') ' + ProviderMobile.substr(3, 3) + '-' + ProviderMobile.substr(6, 4);
        } else {
            work = work + ProviderMobile;
        }
        work = work + '</div>';
    }

    work = work + '</div>';
    // CL3

    work = work + "</div>";
    // CL2

    work = work + "</div>";
    // CL1

    work = work + "</div>";
    // Close Cell

    work = work + "</div>";
    // Close Row


    //if (bProviderView == true) {
    work = work + "<div class='row noPadding border-top' style='text-align:center'>";

    work = work + "<div style='width:80%;margin:0 auto;padding:15px 0px 15px 0px'>";

    work = work + "<div class='border-bottom'style='width:100%;text-align:left;color:black;font-size:14px;font-weight:600;font-family:font-family:ITCAvantGardePro-Bold!important;'>";
    work = work + "LOCATION";
    work = work + "</div>";

    work = work + "<div style='width:100%;text-align:right;'>";

    work = work + (typeof Address1 == "undefined" ? '' : '<div style="font-size:14px;color:' + gColors.PeacefulGray + '">' + Address1 + '</div>');
    work = work + (typeof Address2 == "undefined" ? '' : '<div style="font-size:14px;color:' + gColors.PeacefulGray + '">' + Address2 + '</div>');
    work = work + (typeof City == "undefined" ? '' : '<div style="font-size:14px;color:' + gColors.PeacefulGray + '">' + City + ', ' + State + ' ' + Zip + '</div>');
    work = work + (typeof Notes == "undefined" ? '' : '<div style="font-size:14px;color:' + gColors.PeacefulGray + '">' + Notes + '</div>');

    work = work + "</div>";

    work = work + "</div>";

    //}

    // 3rd Row


    //// Please review....
    //work = work + "<div class='row noPadding border-bottom' >";
    //work = work + "<div class='col-xs-6  border-right' style='height:75px'>";
    //work = work + "<div style='text-align:center'>";

    //if (isProvider == false) {

    //    work = work + '<div style="display:table-cell"><img src="' + ImagePrefix + '/profile/' + result.ProviderUserID + '.jpg" class="img-circle" style="margin-bottom:5px;margin-top:5px;max-height:65px;border-radius:50%;border:solid 2px #d86018"/></div>';
    //    work = work + "<div style='display:table-cell; font-size:8pt;padding-left:5px'>" + result.ProviderFirstName + "<br><span>" + result.ProviderAvgReview + "</span>&nbsp;<span><img style='height:18px;margin-top:-5px' src='../assets/common/images/stars.png' /></span></div>";
    //}
    //else {
    //    work = work + '<div><div class="img-circle" style="margin:0 auto;font-size:small;padding-top:20px;margin-bottom:5px;margin-top:5px;width:65px;height:65px;border-radius:50%;border:solid 2px #d86018;vertical-align:middle"/>' + result.FirstName + '</div></div>';

    //}

    //work = work + "</div>";

    //work = work + "</div>";

    //work = work + "<div class='col-xs-6'>";

    //work = work + "<div style='font-weight:600;font-size:large;text-align:center;width:100%;padding-top:28px'>";

    //var Total = 0;

    //for (var i = 0; i < result.CartItems.length; i++) {
    //    Total = Total + parseFloat(result.CartItems[i].CartOfferingCost);
    //}
    //work = work + "$" + Total.toFixed(2).toString();
    //work = work + "</div>";
    //work = work + "</div>";

    //work = work + "</div>";

    //// Review What / Service Address
    //work = work + "<div class='row noPadding border-bottom' style='height:75px'>";
    //work = work + "<div class='col-xs-12'>";
    //work = work + "<div style='font-size:large;padding-top:14px'>" + result.Service + "</div>";
    //work = work + "<div style='font-size:small;padding-bottom:8px'>" + result.CartAddress.City + ", " + result.CartAddress.State + " " + result.CartAddress.ZipCode + "</div>";
    //work = work + "</div>";
    //work = work + "</div>";

    //// Review Stuff here
    //work = work + "<div class='row noPadding' id='reviewareacontent' style='height:133px'>";
    //work = work + "<div class='col-xs-12'>";
    //work = work + "<div style='font-weight:600;font-size:small;padding-top:10px;width:100%;text-align:center'>RATE YOUR SERVICE</div>";

    //work = work + '<div>';
    //work = work + '<span style="width:200px"class="rating">';
    //work = work + '<input id="rating5" type="radio" name="rating" onclick="enablereview();" value="5">';
    //work = work + '<label for="rating5">5</label>';
    //work = work + '<input id="rating4" type="radio" name="rating" onclick="enablereview();" value="4">';
    //work = work + '<label for="rating4">4</label>';
    //work = work + '<input id="rating3" type="radio" name="rating" onclick="enablereview();" value="3">';
    //work = work + '<label for="rating3">3</label>';
    //work = work + '<input id="rating2" type="radio" name="rating" onclick="enablereview();" value="2">';
    //work = work + '<label for="rating2">2</label>';
    //work = work + '<input id="rating1" type="radio" name="rating" onclick="enablereview();" value="1">';
    //work = work + '<label for="rating1">1</label>';
    //work = work + '</span>';
    //work = work + '</div>';

    //work = work + '<div>';
    //work = work + '<textarea id="txtAreaReview" placeholder="Tell us your thoughts..." style="margin-top:5px;width: 100%; height: 60px; resize: none" maxlength="5000"></textarea>';
    //work = work + '</div>';

    //work = work + "</div>";

    //work = work + "</div>";

    //// Share
    //work = work + "<div style='display:none' class='row noPadding border-top reviewshare' style='height:50px'>";

    //work = work + "<div class='col-xs-12'>";
    //work = work + '<div style="text-align:center" class="addthis_inline_share_toolbox" data-url="http://www.joiful.com" ><span style="font-weight:600;font-size:small;padding-top:10px;width:100%;text-align:center">SHARE</span></div>';
    //work = work + "</div>";

    //work = work + "</div>";

    //var params = "'" + userid + "','" + jobid + "'," + isProvider;
    //// Done Button
    //var btn = '<button id="btnReviewDone" type="button" class="btn btn-lg btn-success btn-block pullUp reviewshare grad" style="display:none;border-radius:0%" onclick="ForceUserHome()">DONE</button>';

    //work = work + "<div class='row noPadding'>";
    //work = work + "<div class='col-xs-12 noPadding'>";
    //work = work + btn;
    //work = work + "</div>";
    //work = work + "</div>";

    //work = work + "</div>";

    var btn = "";
    // Action Button
    if (bProviderView == false) {
        btn = '<button id="btnReview"    type="button" class="btn btn-lg btn-success btn-block reviewarea grad btnHeight"   style="border-radius:0%" onclick="FollowProviderAssign()">FOLLOW ' + ProviderFirstName.toUpperCase() + '</button>';
    } else {
        btn = '<button id="btnReview"    type="button" class="btn btn-lg btn-success btn-block reviewarea grad btnHeight"   style="border-radius:0%" onclick="APICallStatusUpdate(\'' + JobID + '\', \'providertravel\');">START TRAVEL</button>';
    }

    work = work + "<div class='row noPadding'>";
    work = work + "<div class='col-xs-12 noPadding'>";
    work = work + btn;
    work = work + "</div>";
    work = work + "</div>";


    // Final Close
    work = work + "</div>";




    //console.log(work);

    var t = $(".modal-content").position();

    $("#AllSet").css("top", (parseInt(t.top.toString()) - 100).toString() + "px");
    //console.log((parseInt(t.top.toString()) - 100).toString() + "px");
    $("#AllSet").show();
    showAlert(work, null, null, true);


}


function FollowProviderAssign() {
    closeAlert();
    FollowProvider();
}
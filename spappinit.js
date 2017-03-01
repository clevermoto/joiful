var gMobileVersion = false;
var gNoArtistOption = true;

var gMobileServicePrefix = "https://services.spapp.com";
var gMobileImagePrefix = "https://image.spapp.com";
var gMobilePushProjectID = "120833679753";
var gMobilePushAppID = "E263F-3EA6F";

var gSettingGPS = true;
var latt = localStorage.getItem('my_lat');
    if(latt){       
         gSettingGPS = false;
    }else{
         gSettingGPS = true;
}


var gNotificationPollPaused = false;
var gSettingNotificationPollInterval = 1 * (15 * 1000); 
var gSettingLocationPollInterval = (1 * (60 * 1000));
var gSettingDashboardPollInterval = (1 * (15 * 1000));
var gSettingReportRefreshPollInterval = 1 * (15 * 1000);
var gSettingHowFarAwayPollInterval = (1 * (60 * 1000));
var gSearchingForArtistMessageMax = 2;
var gDoNotDisturbPollInterval = (3 * (2 * 1000));

var gColors = {
    "DoveWhite": "#F4F5F0",
    "EvolutionOrange": "#d86018",
    "Turquoise" : "#00A499",
    "PeacefulGray": "#5B6770",
    "MidnightBlue": "#2A4259",
    "SolarYellow": "#D6D54E",
    "ScarletRed": "#CE3232",
    "Gray": "#808080"
}

var gCustomerDefaultHomePage = "../customer/index.html";
var gProviderDefaultHomePage = "../provider/index.html";

var gCustomerHomePage = gCustomerDefaultHomePage;
var gProviderHomePage = gProviderDefaultHomePage;

var activesession = "";//(window.localStorage.getItem("ActiveSession") == "undefined" ? "" : (window.localStorage.getItem("ActiveSession") == null ? "" : window.localStorage.getItem("ActiveSession")));
var tUserID = (window.localStorage.getItem("UserID") == "undefined" ? "0" : (window.localStorage.getItem("UserID") == null ? "0" : window.localStorage.getItem("UserID")));

var gSessionInProgressMessage = "<div style='text-align:center'><image style='max-width:200px' alt='Joiful' src='../assets/common/images/logo.png' /><hr><div align='text-align:center;'>Great news!<br>You already have a Session in progress. We will take you to right to it!<hr>[CUSTOM]</div></div>";
var gReviewNeededMessage = "<div style='text-align:center'><image style='max-width:200px' alt='Joiful' src='../assets/common/images/logo.png' /><hr><div align='text-align:center;'>Welcome back!<br>Looks like you forgot to complete a review of your last session. Please help us out and tell us how it went.</div></div>";
var gSessionInProgressMessageCustomer = "<div style='text-align:center'>Now get ready for an unfogettable Joiful experience!</div>";
var gSessionInProgressMessageProvider = "<div style='text-align:center'>Now go and deliver an unfogettable Joiful experience!</div>";

var gMarketingExclusionList = new Array();

gMarketingExclusionList.push("review.html");
gMarketingExclusionList.push("jobdetail.html");

//if (activesession.length > 0 && tUserID != '0')
//{
//    gCustomerHomePage = activesession;
//    gProviderHomePage = activesession;
//}

var ServicePrefix = "http://localhost:49247";
ServicePrefix = "https://devservices.spapp.com";
var ImagePrefix = "https://devimage.spapp.com";
var Site = "https://dev.spapp.com";

// -----------------------
// Set Environment Variables
//-------------------------
if (gMobileVersion == true) {
    ServicePrefix = gMobileServicePrefix;
    ImagePrefix = gMobileImagePrefix;

}
function viewportSize() {

    return (typeof window.innerHeight != 'undefined') ? Math.max(window.innerHeight, $(window).height()) : $(window).height();

}
function setFormHeight()
{
    var s = viewportSize();

    var height = s;

    var TotalCalcHeight = 0;

    console.log("START OF FORM HEIGHT");
    //console.log($(".header-auto").height());
    //var header = document.getElementsByName("header-auto");
    //alert(header.length);
    //alert(header[0].style.height);
    if ($(".header-auto").is(":visible") == true) {
        TotalCalcHeight = TotalCalcHeight + parseInt($(".header-auto").height() );
        console.log('Header');
        console.log($(".header-auto").outerHeight(true));
    }
    if ($(".footer-auto").is(":visible") == true) {
        TotalCalcHeight = TotalCalcHeight + parseInt($(".footer-auto").height());
        //console.log("footer");
        //console.log($(".footer-auto").outerHeight(true));
    }



    //$(".appcontainer").css("height", height.toString() + "px");

    height = height - TotalCalcHeight;

    $(".container").css("height", height.toString() + "px");

    $(".form-signin").css("height", height.toString() + "px");
    console.log("END OF FORM HEIGHT");
}
function GetCheckMark(size, typeofbutton)
{
    if (typeof typeofbutton == "undefined")
    {
        typeofbutton = "default";
    }

    var strRet = "";

    switch (typeofbutton.toLowerCase()) 
    {
        case "joifulcheck":
            strRet = "<div style='background-color:white;width:" + (size-1).toString() + "px;height:" + (size-1).toString()  + "px;border-radius:50%'><img src='../assets/common/images/selected-joiful.png' width='" + size + "' height='" + size + "' /></div>";
            break;
        case "rightarrow":
            strRet = "<img src='../assets/common/images/rightarrow.png' width='" + size + "' height='" + size + "' />";
            break;
        case "leftarrow":
            strRet = "<img src='../assets/common/images/leftarrow.png' width='" + size + "' height='" + size + "' />";
            break;
        case "leftarrow-white":
            strRet = "<img src='../assets/common/images/leftarrow-white.png' width='8px' height='auto' />";
            break;
        case "unselected":
            strRet = "<img src='../assets/common/images/unselected.png' width='" + size + "' height='" + size + "' />";
            break;
        case "unselected-silver":
            strRet = "<img src='../assets/common/images/unselected-silver.png' width='" + size + "' height='" + size + "' />";
            break;
        case "close-white-circle":
            strRet = "<div style=';width:" + (size +30).toString() + "px;height:" + (size + 30).toString() + "px;padding:8px 5px 8px 5px;vertical-align:middle;text-align:center;border:white 3px solid;border-radius:50%'><img  src='../assets/common/images/close-white.png' width='" + size + "' height='" + size + "' /></div>";
            break;
        case "close-black":
            strRet = "<img src='../assets/common/images/close-black.png' width='" + size + "' height='" + size + "' />";
            break;
        case "close-white":
            strRet = "<img src='../assets/common/images/close-white.png' width='" + size + "' height='" + size + "' />";
            break;

        default:
            strRet = "<img src='../assets/common/images/selected.png' width='" + size + "' height='" + size + "' />";
            break;
    }

    return strRet;
}
function DynamicMenu(BGColor, TextColor, Col1Text, Col1Call, Col2Text, Col2BorderBottom, Col3Text, Col3Call)
{
    var work = "";


    work = work + '<div class="'+ BGColor.replace("#", "") +' header-auto row' + (Col2BorderBottom == true ? ' border-bottom-silver' : '') + '" style="color:' + TextColor + ';width:100%;height:60px;max-width:600px;background:' + BGColor + '">';

    work = work + '<div class="col-xs-3 noPadding" style="text-align:left;height:60px;">';
    
    if (Col1Text=="X")
    {
        Col1Text = GetCheckMark(15, "close-black");
    }
    if (Col1Text == "<") {
        Col1Text = GetCheckMark(15, "leftarrow" + (TextColor=="white" ? "-white" : ""));
    }
    if (Col1Text.length > 0) {
        work = work + '    <button onclick="' + Col1Call + '" class="btn btn-md btn-notround btn-menu-left" style="' + (Col1Text=="<" ? "padding-top:11px!important;" : "") +  'color:' + TextColor + ';" type="button">' + Col1Text + '</button>';
    }
    else
    {
        work = work + "&nbsp;";
    }
    work = work + '</div>';

    work = work + '<div class="col-xs-6 noPadding">';
    work = work + '    <div id="messageHeading" class="spaMessageHeading"  style="height:60px;color:' + TextColor + ';" >' + Col2Text + '</div>';
    work = work + '</div>';
    work = work + '<div class="col-xs-3 noPadding" style="text-align:right">';
    if (Col3Text.length > 0) {
        work = work + '    <button onclick="' + Col3Call + '" class="btn btn-md  btn-notround btn-menu-right "  style="height:60px;color:' + TextColor + ';" type="button">' + Col3Text + '</button>';
    }
    else {
        work = work + "&nbsp;";
    }
    work = work + '</div>';
    work = work + '</div>';
    return work;
}
function BuildHeaderNew() {

    // -------------------------------------
    // Header
    //--------------------------------------
    var bProviderIsActive = false;
    if (window.localStorage.getItem("ProviderActive") == "true")
    {
        bProviderIsActive = true;
    }

    var work = "";
    var headerheight = 60;


    work = work + "<div class='row form-signin-heading' style='margin-top:0px;height:" + headerheight + "px;padding-top:0px'>";
    work = work + "    <div class='col-xs-3 noPadding' style='text-align:left;padding-top:29px;padding-left:9px' >";
    
    work = work + '<button style="background-color: transparent; margin-top: 0px; border-style:none;color:white;text-align:left" id="btnOpenMenu" type="button" >';
    work = work + '<img src="../assets/common/images/menu.png" style="height:15px;width:19px"/>';
    work = work + '</button>';
    
    work = work + "</div>";

    work = work + "<div class='col-xs-6 text-center' style='padding-top:28px;" + headerheight + "px'>";
    work = work + '<img src="../assets/common/images/joiful-nav-logo.png" style="height:21px;width:78px;"/>';
    work = work + "</div>";

    var persona = (window.localStorage.getItem("Persona") == null ? "" : window.localStorage.getItem("Persona").toString().toLowerCase());
    persona = (tUserID == '0' ? "" : persona);

    var dnd = '<div style="display:inline-block;outline:none;vertical-align:bottom">';
    dnd = dnd + "<div id='dndCircle' style='float:right;margin-right: 10px;border-radius:50%;width:21px;height:21px;background-color:" + (bProviderIsActive == true ? "green" : "red") + "' onclick='window.location=\"../provider/donotdisturb.html\"'></div>";
    dnd = dnd + '</div>';

    if (window.localStorage.getItem("Persona").toString().toLowerCase() != "provider")
    {
        dnd = "";
    }

    work = work + "<div class='col-xs-3 noPadding' style='text-align:right;padding-top:27px;;height:" + headerheight + "px'>";

//    work = work + (window.localStorage.getItem("cart") == null ? "" : "<a href='../cart/review.html'><img src='../assets/common/images/bag.png' style='margin-top: 5px;margin-right:10px;outline:none;border-style:none;color:#d86018'/></span></a>");
 //   work = work + (window.localStorage.getItem("cart") == null ? "" : "<a href='../cart/review.html'><img src='../assets/common/images/bag.png' style='padding-left:50px;margin-top: 20px;margin-right:14px;outline:none;border-style:none;color:#d86018;height:17px;width:15px'/></span></a>");
    work = work + dnd +  (window.localStorage.getItem("cart") == null ? "" :"<div style='display:inline-block;outline:none;padding-right:11px;'><a href='../cart/review.html'><img src='../assets/common/images/bag.png' style='padding-top:0px;margin-top: 0px;margin-right:0px;outline:none;border-style:none;color:#d86018;height:20px;width:17px'/></a></div>");




    work = work + "</div></div>";

    return work;

}
function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }

    // Lower case both...
    url = url.toLowerCase();
    name = name.toLowerCase();

    // Scrub
    name = name.replace(/[\[\]]/g, "\\$&");

    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"), results = regex.exec(url);


    if (!results) {
        return '';
    }

    if (!results[2]) {
        return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth * ratio, height: srcHeight * ratio };
}
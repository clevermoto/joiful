var bReadyToScan = false;
var bScanStarted = false;
var scanCreditCardID = "";

if (gMobileVersion == true) {
    document.addEventListener('deviceready', readyToScan, false);
}
//else
//{
//    window.addEventListener('load', readyToScan, false);
//}

//TEMP FOR LOCAL TESTING
//readyToScan();
//TEMP FOR LOCAL TESTING

function readyToScan()
{
    //console.log('readytoscan');
    bReadyToScan = true;
   // console.log(scanCreditCardID.length);
    if (scanCreditCardID.length <= 2) {
        scanCreditCard();
    }
}


function scanCreditCard() {

    if (bReadyToScan == false )
    {
        console.log('scan-fail');
        return;
    }
    if (bScanStarted == true) {
        console.log('scan-started');
        return;
    }
    try
    {
        //console.log('scan-');
        bScanStarted = true;
        CardIO.canScan(onCardIOCheck);
    }
    catch (ex)
    {
        //TEMP FOR LOCAL TESTING
        //onCardIOCheck(true);
        //TEMP FOR LOCAL TESTING
        return;
    }

    function onCardIOComplete(response) {
        var cardIOResponseFields = [
          "cardType",
          "redactedCardNumber",
          "cardNumber",
          "expiryMonth",
          "expiryYear",
          "cvv",
          "postalCode"
        ];

    //    var len = cardIOResponseFields.length;
    ////    alert("card.io scan complete");
    //    for (var i = 0; i < len; i++) {
    //        var field = cardIOResponseFields[i];
    //        alert(field + ": " + response[field]);
    //    }


        $("#inputCardName").val(user.FirstName + " " + user.LastName);

        var num = replaceAll(response["cardNumber"], " ", "");

        var val = detectCardType(num);

        $('[[name=inputCardType]] option').filter(function () {
            return ($(this).text() == val); 
            }).prop('selected', true);

//        $("#inputCardType").val(detectCardType(response["cardNumber"]));
        $("#inputCardNumber").val(response["cardNumber"]);
        $("#inputExpMonth").val(response["expiryMonth"]);
        $("#inputExpYear").val(response["expiryYear"]);
        $("#inputSecurityCode").val(response["cvv"]);
        $("#inputZipCode").val(response["postalCode"]);

        //Next('review.html');

    }

    function onCardIOCancel() {
        showAlert("Scan Cancelled");
    }

    function onCardIOCheck(canScan) {
        //console.log("made it to scan");
        if (canScan == false) {

            return;
        }

        try
        {
            //scanBtn.addEventListener("click", function (e) {
            CardIO.scan({
                "requireExpiry": true,
                "scanExpiry": true,
                "requirePostalCode": true,
                "restrictPostalCodeToNumericOnly": true,
                "hideCardIOLogo": true,
                "suppressScan": false,
                "keepApplicationTheme": true
            }, onCardIOComplete, onCardIOCancel);
            //});
        }
        catch (ex)
        {
            return;
        }
    }
}
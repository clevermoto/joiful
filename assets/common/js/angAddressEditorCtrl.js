var gCountryID = "24DE005DBE53195C0ADB49728AFA4650";
var LoadUIInputCtr = 0;

function LoadUIInputs()
{
    var bReadyToLoad = true;

    // Check for Counts States/Country?
    if ($('#inputCountry > option').length == 0) {
        bReadyToLoad = false;
    }
    if ($('#inputState > option').length == 0) {
        bReadyToLoad = false;
    }
    console.log(bReadyToLoad);

    if (bReadyToLoad == false) {
        LoadUIInputCtr++;

        if (LoadUIInputCtr < 15) {
            setTimeout(LoadUIInputs, 1000);
        }

    }
    else {
        LoadUIInputCtr = 0;
        FillAddressInputs();
    }

    //Check Cookies

}
function FillAddressInputs() {
    $("#inputAddress1").val(GetCookieItem("my_address"));
    $("#inputAddress2").val("");
    $("#inputCity").val(GetCookieItem("my_city"));

    $("#inputZipCode").val(GetCookieItem("my_zip"));

    // Select Country
    $("#inputCountry option:selected").removeAttr("selected");
    $('#inputCountry option[spa-countryCode="' + GetCookieItem("my_country") + '"]').prop('selected', true);
    // Select State
    $("#inputState option:selected").removeAttr("selected");
    $('#inputState option[spa-stateCode="' + GetCookieItem("my_state") + '"]').prop('selected', true);

}
function ShowAddress() {
    LoadAddressDialog();
    $("#divCurrentLocationAddress").show();
}

function CancelAddress() {
    LoadAddressDialog();
    $("#divCurrentLocationAddress").hide();
}
function ManualLoadOfAddress() {
    // take form data
    // update cookies
    // Load UI
    UpdateCookieItem("my_address", $("#inputAddress1").val());
    UpdateCookieItem("my_address2", $("#inputAddress2").val());

    UpdateCookieItem("my_city", $("#inputCity").val());

    UpdateCookieItem("my_zip", $("#inputZipCode").val());

    UpdateCookieItem("my_state", $('#inputState option:selected').attr('spa-stateCode'));
    UpdateCookieItem("my_country", $('#inputCountry option:selected').attr('spa-countryCode'));

    // Build Address
    gCustomerToAddressForReview = GetCookieItem("my_address") + " " + GetCookieItem("my_city") + ', ' + GetCookieItem("my_state") + ' ' + GetCookieItem("my_zip");
    $("#radAddress0").html(GetCookieItem("my_address") + " " + GetCookieItem("my_city") + ", " + GetCookieItem("my_state") + " " + GetCookieItem("my_zip"));
    $("#divCurrentLocationAddress").hide();

    // now get the new lat / lng
    var callback = 'BuildServiceMenu()';
    AddressToGPS($("#inputAddress1").val() + " " + $("#inputCity").val() + " " + $("#inputState").val() + " " + $("#inputCountry").val(), "my", callback);

}
function LoadAddressDialog() {

    // Load UI
    LoadUIInputs();

    //// Load UI
    //$("#inputAddress1").val(GetCookieItem("my_address"));
    //$("#inputAddress2").val("");
    //$("#inputCity").val(GetCookieItem("my_city"));

    //$("#inputZipCode").val(GetCookieItem("my_zip"));

    ////LogIt(GetCookieItem("my_country"));
    ////LogIt(GetCookieItem("my_state"));

    //// Select Country
    //$("#inputCountry option:selected").removeAttr("selected");
    //$('#inputCountry option[spa-countryCode="' + GetCookieItem("my_country") + '"]').prop('selected', true);
    //// Select State
    //$("#inputState option:selected").removeAttr("selected");
    //$('#inputState option[spa-stateCode="' + GetCookieItem("my_state") + '"]').prop('selected', true);
}
app.controller('ManualWhereCtrl', function ($scope, $http) {

    //----------------------------------
    // Lets get the Countries...
    //----------------------------------


    if (GetCookieItem("cCountryList").length > 0) {
        $scope.CountryList = JSON.parse(GetCookieItem("cCountryList"));


    }
    else {
        var uri = ServicePrefix + "/api/getcountrylist";
        $http.get(uri).then(function (result) {

            if (result == null) {
                showAlert('returned no data');
                return;
            }

            if (result.data.Status != "SUCCESS") {
                showAlert(result.data.Message);

                return;
            }

            if (result.data.Results.length > 0) {
                UpdateCookieItem("cCountryList", JSON.stringify(result.data.Results));
                $scope.CountryList = result.data.Results;

            }

        });
    }

    //-------------------------------
    // Lets get the States...
    // ------------------------------

    $scope.ChangeTheCountry = function () {


        if ($("#inputCountry").prop('selectedIndex') > -1) {
            gCountryID = $("#inputCountry").val();
        }

        var StateList = new Array();
        var newStateList = new Array();

        if (GetCookieItem("cStateList").length > 0)
        {
            StateList = JSON.parse(GetCookieItem("cStateList"));
            for (var s = 0; s < StateList.length; s++) {
                if (StateList[s].CountryID == gCountryID) {
                    newStateList.push(StateList[s]);
                }
            }
            $scope.StateList = newStateList;
        }
        else {
            var uri = ServicePrefix + "/api/getstatelist";

            $http.get(uri).then(function (result) {

                if (result == null) {
                    showAlert('returned no data');
                    return;
                }

                if (result.data.Status != "SUCCESS") {
                    showAlert(result.data.Message);

                    return;
                }

                if (result.data.Results.length > 0) {

                    UpdateCookieItem("cStateList", JSON.stringify(result.data.Results));
                    StateList = result.data.Results;
                    for (var s = 0; s < StateList.length; s++) {
                        if (StateList[s].CountryID == gCountryID) {
                            newStateList.push(StateList[s]);
                        }
                    }
                    $scope.StateList = newStateList;

                }

            });
        }


    };

    $scope.ChangeTheCountry();
});
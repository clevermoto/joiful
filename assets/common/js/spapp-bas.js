var gTotalCost = 0;
var gPreTip = 0;
var gPreTipPct = 0;
var gCCEXMM = 0;
var gCCEXYYYY = 0;
//var gCountryLimitArray = new Array();
//var gCountryNameLimitArray = new Array();
//var gStateLimitArray = new Array();
//var gStateNameLimitArray = new Array();
//var gZipCodeLimitArray = new Array();

//gCountryLimitArray = GetCountryLimitArray();
//gCountryNameLimitArray = GetCountryNameLimitArray();
//gStateNameLimitArray = GetStateNameLimitArray();
//gStateLimitArray = GetStateLimitArray();

function GetCountryLimitArray() {

    var myFullArray = new Array();

    var myArray = new Array();
    var myObject = new Object();

    if (GetCookieItem("bas_country").length == 0)
    { 
        return GetBASCountry("short");
    }
    else {
        myFullArray = JSON.parse(GetCookieItem("bas_country"));

        for (var i = 0; i < myFullArray.length; i++) {
            myObject =
                {
                    Entry: myFullArray[i].CountryShort
                }

            myArray.push(myObject);
        }

        return myArray;
    }


}
function GetCountryNameLimitArray() {

    var myFullArray = new Array();

    var myArray = new Array();
    var myObject = new Object();

    if (GetCookieItem("bas_country").length == 0) {
        myArray = GetBASCountry("name");
        return myArray;
    }
    else {
        myFullArray = JSON.parse(GetCookieItem("bas_country"));


        return myFullArray;
    }


}
function GetStateNameLimitArray() {

    var myFullArray = new Array();

    var myArray = new Array();
    var myObject = new Object();

    if (GetCookieItem("bas_state").length == 0)
    {
        myFullArray = GetBASState();

        for (var i = 0; i < myFullArray.length; i++)
        {
            myObject =
                {
                    Entry: myFullArray[i].StateName
                }

            myArray.push(myObject);
        }

        return myArray;
    }
    else
    {
        myFullArray = JSON.parse(GetCookieItem("bas_state"));

        for (var i = 0; i < myFullArray.length; i++)
        {
            myObject =
                {
                    Entry: myFullArray[i].StateName
                }

            myArray.push(myObject);
        }

        return myArray;
    }


}

function GetStateLimitArray() {

    var myFullArray = new Array();

    var myArray = new Array();
    var myObject = new Object();

    if (GetCookieItem("bas_state").length == 0)
    {
        myFullArray = GetBASState();

        for (var i = 0; i < myFullArray.length; i++)
        {
            myObject =
                {
                    Entry: myFullArray[i].StateShort
                }

            myArray.push(myObject);
        }

        return myArray;
    }
    else
    {
        myFullArray = JSON.parse(GetCookieItem("bas_state"));

        for (var i = 0; i < myFullArray.length; i++)
        {
            myObject =
                {
                    Entry: myFullArray[i].StateShort
                }

            myArray.push(myObject);
        }

        return myArray;
    }


}

function GetZipCodeLimitArray() {

    var myArray = new Array();
    var myObject = new Object();

    myObject =
        {
            ZipCode: "",
            ZipCodeDesc: "Select a Zip Code"
        }

    myArray.push(myObject);

    myObject =
        {
            ZipCode: "90401",
            ZipCodeDesc: "90401"
        }

    myArray.push(myObject);

    myObject =
        {
            ZipCode: "90402",
            ZipCodeDesc: "90402"
        }

    myArray.push(myObject);

    $.ajax({

        dataType: "json",
        url: ServicePrefix + "/api/getsetting/?settingkey=zipcodedeliverylimit",
        method: "GET",

        success: function (data)
        {
            if (data.SettingValue.length > 0)
            {

                myArray = new Array();
                myObject = new Object();

                myObject =
                    {
                        ZipCode: "",
                        ZipCodeDesc: "Select a Zip Code"
                    }

                myArray.push(myObject);

                var ZipArray = data.SettingValue.toString().split(';');

                for (var i = 0; i < ZipArray.length; i++)
                {
                    myObject = new Object();
                    myObject =
                        {
                            ZipCode: ZipArray[i],
                            ZipCodeDesc: ZipArray[i]
                        }

                    myArray.push(myObject);

                }
                return myArray;
            }
        },

        error: function (err)
        {
            return myArray;
        }
    });


}
function SearchArray(inVar, inArray) {

    //// Temp code
    //return true;

    if (inArray.length == 0)
    {
        return true;
    }

    for (var i = 0; i < inArray.length; i++)
    {

        if (inVar == inArray[i].Entry)
        {
            return true;
        }
    }

    return false;
}
function BuildShortZipCodeList(arr) {
    var newArray = new Array();

    for (var i = 0; i < arr.length; i++) {

        var Item = new Object();

        Item =
            {
                Entry: arr[i].ZipCode
            }

        newArray.push(Item);

    }

    return newArray;
}
function GetBASZipCode()
{
    var url = ServicePrefix + "/api/getsetting/?settingkey=zipcodedeliverylimit";

    // Start by getting the ZipCodes
    // $.get(uri).then
    $.get(url).then(function (result) {

        if (result == null) {
            showAlert('returned no data');
            return;
        }

        if (result.Status != "SUCCESS") {
            showAlert(result.data.Message);
            return;
        }

        if (result.SettingValue.length > 0) {

            myArray = new Array();
            myObject = new Object();

            myObject =
                {
                    ZipCode: "",
                    ZipCodeDesc: "Select a Zip Code"
                }

            myArray.push(myObject);

            var ZipArray = result.SettingValue.toString().split(';');

            for (var i = 0; i < ZipArray.length; i++) {
                myObject = new Object();
                myObject =
                    {
                        ZipCode: ZipArray[i],
                        ZipCodeDesc: ZipArray[i]
                    }

                myArray.push(myObject);

            }

            UpdateCookieItem("bas_zip", JSON.stringify(myArray));
            gZipCodeLimitArray = BuildShortZipCodeList(JSON.parse(GetCookieItem("bas_zip")));
            return JSON.stringify(myArray);

        }
        else {

            UpdateCookieItem("bas_zip", JSON.stringify(myArray));
            gZipCodeLimitArray = BuildShortZipCodeList(JSON.parse(GetCookieItem("bas_zip")));
            return JSON.stringify(myArray);


        }
    });
}
function GetBASState()
{
    var url = ServicePrefix + "/api/getsetting/?settingkey=statedeliverylimit";


    $.get(url).then(function (result) {

        if (result == null) {
            showAlert('returned no data');
            return;
        }

        if (result.Status != "SUCCESS") {
            showAlert(result.data.Message);
            return;
        }

        var myArray = new Array();
        var myObject = new Object();

        if (result.SettingValue.length > 0) {


            var StateArray = result.SettingValue.toString().split(';');

            for (var i = 0; i < StateArray.length; i++)
            {
                var StateSplitArray = StateArray[i].split('|');
                myObject = new Object();
                myObject =
                    {
                        StateShort: StateSplitArray[0],
                        StateName: StateSplitArray[1]
                    }

                myArray.push(myObject);

            }

            UpdateCookieItem("bas_state", JSON.stringify(myArray));
            return JSON.stringify(myArray);

        }
        else {

            UpdateCookieItem("bas_state", JSON.stringify(myArray));
            return JSON.stringify(myArray);


        }
    });
}
function GetBASCountry(outputtype)
{
    if (typeof (outputtype) == "undefined")
    {
        outputtype = "";
    }

    var url = ServicePrefix + "/api/getsetting/?settingkey=countrydeliverylimit";


    $.get(url).then(function (result) {

        if (result == null) {
            showAlert('returned no data');
            return;
        }

        if (result.Status != "SUCCESS") {
            showAlert(result.data.Message);
            return;
        }

        var myArray = new Array();
        var myObject = new Object();

        if (result.SettingValue.length > 0) {


            var CountryArray = result.SettingValue.toString().split(';');

            for (var i = 0; i < CountryArray.length; i++)
            {
                var CountrySplitArray = CountryArray[i].split('|');

                myObject = new Object();
                myObject =
                    {
                        CountryShort: CountrySplitArray[0],
                        CountryName: CountrySplitArray[1]
                    }

                myArray.push(myObject);

            }

            UpdateCookieItem("bas_country", JSON.stringify(myArray));
            //alert(outputtype);
            // If we pass in output type, only return the item in the array
            switch (outputtype.toLowerCase())
            {
                case "short":

                    var shortArray = new Array();

                    for (var i = 0; i < myArray.length; i++) {
                        myObject = new Object();
                        myObject =
                            {
                                Entry: myArray[i].CountryShort
                            }

                        shortArray.push(myObject);
                    }
                    return shortArray;
                    break;

                case "name":

                    var nameArray = new Array();

                    for (var i = 0; i < myArray.length; i++) {
                        myObject = new Object();
                        myObject =
                            {
                                Entry: myArray[i].CountryNAme
                            }

                        nameArray.push(myObject);
                    }
                    return nameArray;
                    break;

                default:
                    return JSON.stringify(myArray);
                    break;
            }
            


        }
        else {

            UpdateCookieItem("bas_country", JSON.stringify(myArray));
            return JSON.stringify(myArray);


        }
    });
}
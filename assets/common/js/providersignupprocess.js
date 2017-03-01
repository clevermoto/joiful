    
    var gServicePrefix = "https://qa.spapp.com"
    var gfirstname = "";
    var glastname = "";
    var gemailaddress = "";
    var gserviceid = "";
    var glicensenbr = "";
    var gpassword = "Joiful123!";
    var guserid = "";


    if (typeof ServicePrefix != "undefined")
    {
        gServicePrefix = ServicePrefix;
    }

    function Register(firstname, lastname, emailaddress, serviceid, licensenbr)
    {
        gfirstname=firstname;
        glastname=lastname;
        gemailaddress=emailaddress;
        gserviceid=serviceid;
        glicensenbr=licensenbr;
        guserid = "";

        if (ValidateInput() == false) {
            return;
        }
        else
        {
            APIRegisterCall();
        }
        
    }
    function ValidateInput()
    {

        if (DataLength(RemoveTags(gfirstname))== 0)
        {
            showAlert('First Name must be entered');
            return false;
        }

        if (DataLength(RemoveTags(glastname)) == 0)
        {
            showAlert('Last Name must be entered');
            return false;
        }

        if (DataLength(RemoveTags(gemailaddress)) == 0)
        {
            showAlert('Email must be entered');
            return false;
        }

        if (ValidEmailAddress(RemoveTags(gemailaddress)) == false)
        {
            showAlert('Invalid Email Address');
            return false;
        }

        var password = RemoveTags(gpassword);
        var confirmedpassword = RemoveTags(gpassword);

        // Validate Input
        if (ValidatedPassword(password, confirmedpassword) == false)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    function APIRegisterCall()
    {
        var uri = gServicePrefix + '/api/register/';

        var postData = {
            deviceid: "",
            firstname: RemoveTags(gfirstname),
            lastname: RemoveTags(glastname),
            emailaddress: RemoveTags(gemailaddress),
            password: RemoveTags(gpassword),
            confirmedpassword: RemoveTags(gpassword)
        }

        $.ajax(
               {
                   data: postData,
                   dataType: "json",
                   url: uri,
                   method: "POST",
                   success: APIRegisterSuccess,
                   error: APIRegisterError
               });

    }

    function APIRegisterError(result, textStatus, err)
    {
        return;
    }

    function APIRegisterSuccess(result)
    {	
        if (result == null)
        {
            return;
        }

        if (result.Status != "SUCCESS")
        {
            return;
        }


        if (result.UserID.length > 1)
        {
            guserid = result.UserID;
            // Make them a Provider
            APICallProviderSetup(guserid);
        }
        else
        {
            return;
        }
    }

    function APICallProviderSetup(userID)
    {

        var APIToken = "persona";

        var uri = gServicePrefix + '/api/updateprofile/';

        var postData = {
            apitoken: APIToken,
            userid: userID,
            persona: "provider"
        }

        $.ajax(
               {
                   data: postData,
                   dataType: "json",
                   url: uri,
                   method: "POST",
                   success: APIProviderSetupSuccess,
                   error: APIProviderSetupError
               });

    }

    function APIProviderSetupSuccess(result)
    {

        if (result == null) {

            return;
        }

        if (result.Status != "SUCCESS") {
            return;
        }
		
        APIUpdateProviderServiceState(guserid, gserviceid, true);
        
    }

    function APIProviderSetupError(result, textStatus, err) {

        return;
    }

    function APIUpdateProviderServiceState(userid, serviceid, activate) 
    {
    
        if (serviceid.length==0)
        {
            return;
        }

        var uri = gServicePrefix + "/api/UpdateProviderServiceState";
        
        data = {
            userid: RemoveTags(userid),
            serviceid: RemoveTags(serviceid),
            activate: RemoveTags(activate)
        };

        $.ajax(
        {
            data: data,
            dataType: "json",
            url: uri,
            method: "POST",
            success: APIUpdateProviderServiceStateSuccess,
            error: APIUpdateProviderServiceStateError
        });
    }

    function APIUpdateProviderServiceStateSuccess(result) {

        if (result == null) {
            //showAlert('returned no data');
            return;
        }

        if (result.Status != "SUCCESS") {
            //showAlert(result.Message);
            return;
        }

       APIUpdateProviderLicense(serviceid);
    }

    function APIUpdateProviderServiceStateError(jqXHR, textStatus, err) {

        return false;
    }

    function APIUpdateProviderLicense(serviceid)
    {

        if (glicensenbr.length == 0)
        {
            return;
        }

        var uri = gServicePrefix + "/api/updateproviderservicelicense";
        data = {
            providerid: RemoveTags(guserid),
            serviceid: RemoveTags(gserviceid),
            providerlicense: RemoveTags(glicensenbr)
        };

        $.ajax(
        {
            data: data,
            dataType: "json",
            url: uri,
            method: "POST",
            success: APIUpdateProviderBioSuccess,
            error: APIUpdateProviderBioError
        });
    }

    function APIUpdateProviderLicenseSuccess(result)
    {
        if (result == null) {
            return;
        }

        if (result.Status != "SUCCESS") {
            alert(result.Message);
            //window.location.href = "../API Failure.html";
            return;
        }

        return;

    }

    function APIUpdateProviderLicenseError(jqXHR, textStatus, err) 
    {
        return false;
    }

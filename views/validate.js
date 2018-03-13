function checkForm(form)
{
    var pass = document.getElementById("pass");
        cpass = document.getElementById("cpass");

    if(pass.value != "" && pass.value == cpass.value) {
        if(pass.value.length < 6) {
            alert("Error: Password must contain at least six characters!");
            pass.focus();
            return false;
        }
        if(pass.value == form.username.value) {
            alert("Error: Password must be different from Username!");
            pass.focus();
            return false;
        }
        re = /[0-9]/;
        if(!re.test(pass.value)) {
            alert("Error: password must contain at least one number (0-9)!");
            pass.focus();
            return false;
        }
        re = /[a-z]/;
        if(!re.test(pass.value)) {
            alert("Error: password must contain at least one lowercase letter (a-z)!");
            pass.focus();
            return false;
        }
        re = /[A-Z]/;
        if(!re.test(pass.value)) {
            alert("Error: password must contain at least one uppercase letter (A-Z)!");
            pass.focus();
            return false;
        }
        } else {
        alert("Error: Please check that you've entered and confirmed your password!");
        pass.focus();
        return false;
    }

    return true;
}
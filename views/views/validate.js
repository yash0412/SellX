// alert("hello");
function validate(){
    var pass = document.getElementsByName("user[pass]")[0].value,
        cpass = document.getElementsByName("user[cpass]")[0].value;
        // alert(pass);
        if(pass.length < 8 ){
            alert("Password too short");
            return false;
        }
        if(pass.length>32){
            alert("Password too long");
            return false;
        }
        pass.forEach(check);
        if(pass != cpass){
            alert("Passwords don't match");
            return false;
        }
        return true;
}
function check(){
    if(i<33 || i>126){
        alert("Illegal character in password");
        return false;
    }
}
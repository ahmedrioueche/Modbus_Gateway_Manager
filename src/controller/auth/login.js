document.addEventListener('DOMContentLoaded', async () => {   
    
    //--------------------------DOM----------------------------------------//
    const form = document.querySelector(".login-form");
    const usernameCon = document.getElementById("username");
    const passwordCon = document.getElementById("password");
    const usernameEl = document.getElementById("username-input-box");
    const passwordEl = document.getElementById("password-input-box");
    const loginBtn = document.getElementById('login-button');

    //----------------------------Variables---------------------------------//
    let selectedLanguage = defaultLanguage;

    //----------------------------Settings---------------------------------//
    const storedSettings = JSON.parse(localStorage.getItem("settings"));
    if(storedSettings)
        selectedLanguage = storedSettings.language;

    usernameEl.textContent = languages[selectedLanguage].settings.username;
    passwordEl.textContent = languages[selectedLanguage].settings.password;
    usernameEl.placeholder = languages[selectedLanguage].settings.userPlaceholder;
    passwordEl.placeholder = languages[selectedLanguage].settings.passwordPlaceholder;

    //---------------------------Logic--------------------------------------//
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginHandler();
    });

    async function loginHandler(){
        const errorDivs = form.querySelectorAll(".error");
        if (errorDivs) {
            errorDivs.forEach(errorDiv => {
                errorDiv.remove();
            })
        }
        usernameEl.classList.remove("input-field-err");
        passwordEl.classList.remove("input-field-err");

        let username = usernameEl.value;
        let password = passwordEl.value;
        let validationResult = await validateUserInfo(username, password);

        if(validationResult.status === authStatus.VALID){

                window.location.href = "../../views/main/main.html";
            
        }

        else if (validationResult.status === authStatus.VOID_USERNAME){
            const newErrorDiv = document.createElement("div");
            newErrorDiv.classList.add("error");
            newErrorDiv.textContent = languages[selectedLanguage].error.voidErr;
            usernameCon.appendChild(newErrorDiv);
            usernameEl.classList.add("input-field-err");
            loginBtn.classList.add("input-field-err");
        }

        else if (validationResult.status === authStatus.INVALID_USERNAME){
            const newErrorDiv = document.createElement("div");
            newErrorDiv.classList.add("error");
            newErrorDiv.textContent = languages[selectedLanguage].error.invalidUsername;
            usernameCon.appendChild(newErrorDiv);
            usernameEl.classList.add("input-field-err");
            loginBtn.classList.add("input-field-err");
        }
        
        else if (validationResult.status === authStatus.VOID_PASSWORD){
            const newErrorDiv = document.createElement("div");
            newErrorDiv.classList.add("error");
            newErrorDiv.textContent = languages[selectedLanguage].error.voidErr;
            passwordCon.appendChild(newErrorDiv);
            passwordEl.classList.add("input-field-err");
            loginBtn.classList.add("input-field-err");
        }   

        else if (validationResult.status === authStatus.INVALID_PASSWORD){
            const newErrorDiv = document.createElement("div");
            newErrorDiv.classList.add("error");
            newErrorDiv.textContent = "Invalid password";
            newErrorDiv.textContent = languages[selectedLanguage].error.invalidPassword;
            passwordCon.appendChild(newErrorDiv);
            passwordEl.classList.add("input-field-err");
            loginBtn.classList.add("input-field-err");
        }    
    }

    async function validateUserInfo(username, password){

        const validationResult = { status: authStatus.VALID, result: 0 }

        if(!username){
            validationResult.status = authStatus.VOID_USERNAME;
            return validationResult;
        }

        if(!password){
            validationResult.status = authStatus.VOID_PASSWORD;
            return validationResult;
        }

        let result = await window.mainAPI.validateUserData(username, password);

        console.log("result", result);

        if (result === -1){
            validationResult.status = authStatus.INVALID_USERNAME;
            validationResult.result = result;
            return validationResult;
        }

        if(result === -2){
            validationResult.status = authStatus.INVALID_PASSWORD;
            validationResult.result = result;
            return validationResult;
        }
        
        return validationResult;
    }
})




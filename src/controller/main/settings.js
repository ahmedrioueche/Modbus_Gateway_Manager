document.addEventListener('DOMContentLoaded', async () => {
    
    //-------------------------DOM elements-----------------------------//
    const usernameBtn =  document.getElementById("username-btn");
    const passwordBtn =  document.getElementById("password-btn");
    const languageBtn =  document.getElementById("language-btn");
    const usernameBtnSpan =  document.querySelector(".username-btn-span");
    const passwordBtnSpan =  document.querySelector(".password-btn-span");
    const languageBtnSpan =  document.querySelector(".language-btn-span");
    const saveBtn = document.getElementById('save-button');
    const cancelBtn = document.getElementById("cancel-button");
    const languageSelect = document.getElementById("language-select");
    const container = document.querySelector(".settings-window")
    const usernameCon = document.getElementById("username-container");
    const oldPasswordCon = document.getElementById("old-password-container");
    const oldPasswordCon2 = document.getElementById("old-password-container-2");
    const newPasswordCon = document.getElementById("new-container");
    const confirmPassWordCon = document.getElementById("confirm-container");
    const usernameEl = document.getElementById('username');
    const oldPasswordFirstEl = document.getElementById('old-password-1');
    const oldPasswordSecondEL = document.getElementById("old-password-2");
    const newPasswordEL = document.getElementById('new-password');
    const confirmPasswordEl = document.getElementById('confirm-password');
    const usernameDiv = document.querySelector(".username-div");
    const passwordDiv = document.querySelector(".password-div");
    const languageDiv = document.querySelector(".language-div");
    const icon1 = document.getElementById('toggle-icon-1');
    const icon2 = document.getElementById('toggle-icon-2');
    const icon3 = document.getElementById('toggle-icon-3');
    const usernameLabel = document.getElementById("username-label");
    const passwordLabel = document.getElementById("password-label");
    const oldPasswordLabel = document.getElementById("old-password-label");
    const newPasswordLable = document.getElementById("new-password-label");
    const confirmPasswordLabel =  document.getElementById("confirm-password-label");
    const chooseLanguageLabel =  document.getElementById("choose-lang-label");

    //----------------------------Variables----------------------------------//
    //get dev status
    const dev = await window.mainAPI.getDevStatus();
    const windowIndex = 5
    const windowWidth = dev? 800 : 450;
    const WindowOriginalHeight = 575
    let userDivOpened = true;
    let passwordDivOpened = false;
    let languageDivOpened = false;
    let isResized = false;
    let selectedLanguage = defaultLanguage;

    //----------------------------Settings------------------------------------//
    const storedSettings = JSON.parse(localStorage.getItem("settings"));
    if(storedSettings)
        selectedLanguage = storedSettings.language;
    
    languageSelect.value = selectedLanguage;

    usernameBtnSpan.textContent      = languages[selectedLanguage].settings.changeUsername;   
    passwordBtnSpan.textContent      = languages[selectedLanguage].settings.changePassword;;
    languageBtnSpan.textContent      = languages[selectedLanguage].settings.changeLanguage;   
    usernameLabel.textContent        = languages[selectedLanguage].settings.username;
    passwordLabel.textContent        = languages[selectedLanguage].settings.password;
    oldPasswordLabel.textContent     = languages[selectedLanguage].settings.oldPassword;
    newPasswordLable.textContent     = languages[selectedLanguage].settings.newPassword;
    confirmPasswordLabel.textContent = languages[selectedLanguage].settings.confirmPassword;
    chooseLanguageLabel.textContent  = languages[selectedLanguage].settings.chooseLanguage;
    saveBtn.textContent              = languages[selectedLanguage].button.save;
    cancelBtn.textContent            = languages[selectedLanguage].button.cancel;
    
    //------------------------------------Logic----------------------------------------------//
    //get user data
    const userData = await window.mainAPI.getUserData();
    usernameEl.value = userData.username;

    //let username div initially opened 
    usernameDiv.classList.add("show");
    icon1.classList.toggle("icon-flipped");

    usernameBtn.addEventListener("click", (e)=>{
        e.preventDefault();
        userDivOpened = userDivOpened === true? userDivOpened = false: userDivOpened = true;
        passwordDivOpened = false;
        languageDivOpened = false;

        handleUI(usernameDiv, passwordDiv, languageDiv, icon1, icon2, icon3);
       
        if(isResized && !userDivOpened){
            window.mainAPI.resizeWindow(windowIndex, windowWidth, WindowOriginalHeight);
            isResized = false;
        }
        else {
            window.mainAPI.resizeWindow(windowIndex, windowWidth, 575);
            isResized = true;
        }
    })

    passwordBtn.addEventListener("click", (e)=>{
        e.preventDefault();
        userDivOpened = false;
        passwordDivOpened = passwordDivOpened === true? passwordDivOpened = false: passwordDivOpened = true;
        languageDivOpened = false;

        handleUI(passwordDiv, usernameDiv, languageDiv, icon2, icon1, icon3);

        if(isResized && !passwordDivOpened){
            window.mainAPI.resizeWindow(windowIndex, windowWidth, WindowOriginalHeight);
            isResized = false;
        }
        else {
            isResized = true;
            window.mainAPI.resizeWindow(windowIndex, windowWidth, 650);
        }
    })

    languageBtn.addEventListener("click", (e)=>{
        e.preventDefault();
        userDivOpened = false;
        passwordDivOpened = false;
        languageDivOpened = languageDivOpened === true? languageDivOpened = false: languageDivOpened = true;

        handleUI(languageDiv, usernameDiv, passwordDiv, icon3, icon1, icon2);

        if(isResized && !languageDivOpened){
            window.mainAPI.resizeWindow(windowIndex, windowWidth, WindowOriginalHeight);
            isResized = false;
        }
        else {
           isResized = true;
           window.mainAPI.resizeWindow(windowIndex, windowWidth, 490);
        }
    })

    saveBtn.addEventListener('click', async () => {
        const errorDivs = container.querySelectorAll(".error");
        if (errorDivs) {
            errorDivs.forEach(errorDiv => {
                errorDiv.remove();
            })  
        }
        const newErrorDiv = document.createElement("div");
        newErrorDiv.classList.add("error");
        newErrorDiv.textContent = languages[selectedLanguage].error.voidErr;

        if(userDivOpened){
            usernameEl.classList.remove("input-field-err");
            oldPasswordFirstEl.classList.remove("input-field-err");
            const username = usernameEl.value
            const oldPassword = oldPasswordFirstEl.value;
            if(dev)
                console.log("username", username)
            if(!username){
                usernameEl.classList.add("input-field-err");
                usernameCon.appendChild(newErrorDiv);
                return;
            }
            if(!oldPassword){
                oldPasswordFirstEl.classList.add("input-field-err");
                oldPasswordCon.appendChild(newErrorDiv);
                return;
            }

            if(!checkUsername(username)){
                newErrorDiv.textContent = languages[selectedLanguage].error.invalidUsername;
                usernameCon.appendChild(newErrorDiv);
                usernameEl.classList.add("input-field-err");
            }

            if(dev)
                console.log("userData.username", userData.username)

            const result = await validateUserData(userData.username, oldPassword);
            if(result === settingsStatus.INVALID_OLD_PASSWORD){
                newErrorDiv.textContent = languages[selectedLanguage].error.invalidPassword;
                oldPasswordCon.appendChild(newErrorDiv);
                oldPasswordFirstEl.classList.add("input-field-err");
                return;
            }
            saveUserData(username, oldPassword);
        }
   
        if(passwordDivOpened){
            oldPasswordSecondEL.classList.remove("input-field-err");
            newPasswordEL.classList.remove("input-field-err");
            confirmPasswordEl.classList.remove("input-field-err");

            const oldPassword = oldPasswordSecondEL.value;
            const newPassword = newPasswordEL.value;
            const confirmPassword = confirmPasswordEl.value;
            let result = await handleUserData(userData.username, oldPassword, newPassword, confirmPassword);
            console.log("result", result)

            newErrorDiv.textContent = languages[selectedLanguage].error.voidErr;

            switch(result){
                case settingsStatus.VALID:
                    saveUserData(userData.username, newPassword);
                    break;
                case settingsStatus.VOID_OLD_PASSWORD:
                    oldPasswordSecondEL.classList.add("input-field-err");
                    oldPasswordCon2.appendChild(newErrorDiv);
                    break;
                case settingsStatus.VOID_NEW_PASSWORD:
                    newPasswordEL.classList.add("input-field-err");
                    newPasswordCon.appendChild(newErrorDiv);
                    break;
                case settingsStatus.VOID_CON_PASSWORD:
                    confirmPasswordEl.classList.add("input-field-err");
                    confirmPassWordCon.appendChild(newErrorDiv);
                    break;
                case settingsStatus.INVALID_OLD_PASSWORD:
                    newErrorDiv.textContent = languages[selectedLanguage].error.invalidPassword;
                    oldPasswordCon2.appendChild(newErrorDiv);
                    oldPasswordSecondEL.classList.add("input-field-err");
                    break;
                case settingsStatus.INVALID_NEW_PASSWORD:
                    newErrorDiv.textContent = languages[selectedLanguage].error.invalidPassword;
                    newPasswordCon.appendChild(newErrorDiv);
                    newPasswordEL.classList.add("input-field-err");
                    break;
                case settingsStatus.INVALID_CON_PASSWORD:
                    newErrorDiv.textContent = languages[selectedLanguage].error.passwordsDontMatch;
                    confirmPassWordCon.appendChild(newErrorDiv);
                    confirmPasswordEl.classList.add("input-field-err");
                    break;
            }    
        }

        if(languageDivOpened){
            const selectedLanguage = languageSelect.value;
            if(selectedLanguage){
                if(dev)
                    console.log("Selected language:", selectedLanguage);
                let settings = {
                    language: selectedLanguage
                }
                localStorage.setItem("settings", JSON.stringify(settings));
    
                window.mainAPI.sendSignalToWindow(null, selectedLanguage); //send signal to all opened windows
                if(!dev)
                    window.mainAPI.closeWindow(5);
            }
        }
           
    });

    async function handleUserData(username, oldPassword, newPassword, confirmPassword){
        if(!username)
            return settingsStatus.VOID_USERNAME;

        if(!oldPassword)
            return settingsStatus.VOID_OLD_PASSWORD;

        if(!newPassword)
             return settingsStatus.VOID_NEW_PASSWORD;

        if(!confirmPassword)
            return settingsStatus.VOID_CON_PASSWORD;

        let result = checkUsername(username);
        if(result !== settingsStatus.VALID){
            return result;
        }

        result = await validateUserData(username, oldPassword);
        if(result !== settingsStatus.VALID)
            return result;

        result = checkPassword(newPassword);
        if(result !== settingsStatus.VALID){
            return result;
        }

        if(newPassword !== confirmPassword){
            return settingsStatus.INVALID_CON_PASSWORD;
        }

        return settingsStatus.VALID;
    }

    async function saveUserData(username, newPassword){
        let updateduUserData = {
            admin: {
                id: userData.id,
                username: username,
                password: newPassword,
            }
        }
        
        await window.mainAPI.saveUserData(updateduUserData);
        if(!dev)
            window.mainAPI.closeWindow(5);
    }

    async function validateUserData(username, oldPassword){
       let result = await window.mainAPI.validateUserData(username, oldPassword);
       if(result !== 0)
         return settingsStatus.INVALID_OLD_PASSWORD;

        return settingsStatus.VALID;
    }

    function checkUsername(username) {
        if (typeof username !== 'string' || username.trim() === '') {
            return settingsStatus.INVALID_NEW_USERNAME;
        }
        return settingsStatus.VALID;
    }
    
    function checkPassword(password){
        if(password.length < 5)
            return settingsStatus.INVALID_NEW_PASSWORD;

        return settingsStatus.VALID
    }

    function handleUI(openedDiv, otherDiv1, otherDiv2, clickedIcon, otherIcon1, otherIcon2){
        openedDiv.classList.toggle("show");
        otherDiv1.classList.remove("show");
        otherDiv2.classList.remove("show");

        clickedIcon.classList.toggle("icon-flipped");
        otherIcon1.classList.remove("icon-flipped");
        otherIcon2.classList.remove("icon-flipped");
    }

    cancelBtn.addEventListener('click', () => {
        window.mainAPI.closeWindow(5); //settings window index = 5
    });
});



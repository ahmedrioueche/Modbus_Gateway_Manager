const languages = {
        
    english: {
        main: {
            refresh: "Refresh",
            configure: "Configure",
            diagnose: "Diagnose",
            help: "Help",
            settings: "Settings",
            id: "ID",
            name:"Name",
            status: "Status",
            connected: "Connected",
        },

        settings: {
            username: "Username",
            password: "Password",
            oldPassword: "Old Password",
            newPassword: "New Password",
            confirmPassword: "Confirm Password",
            language: "Language",
            changeUsername: "Change Username",
            changePassword: "Change Password",
            changeLanguage: "Change Language",
            chooseLanguage: "Choose Language",
            enter: "Enter",
            userPlaceholder: "Enter username",
            passwordPlaceholder: "Enter password",
        },

        config: {
            general: "General",
            mode: "Mode",
            serial: "Serial",
            network: "Network",
            generalConfig: "General Configuration",
            modeConfig: "Mode Configuration",
            serialConfig: "Serial Configuration",
            networkConfig: "Network Configuration",
            deviceID: "Device ID",
            name: "Name",
            status: "Status",
            rtuServerMode: "RTU Server Mode",
            tcpServerMode: "TCP Server Mode",
            stopBits: "Stop Bits",
            dataSize: "Data Size",
            slaveID: "Slave ID",
            remoteSlaveId: "Remote Slave ID", 
            remoteIP: "Remote IP",
        
        },

        diagnose: {
            number: "number",
            time: "Time",
            source: "Source",
            destination: "Destination",
            length: "Length",
            data: "data",
        },

        factoryReset :{
            factoryReset: "Factory Reset",
            mainText: "Are you sure you want to reset the gateway to default configuration?"
        },
    
        button: {
            next: "Next",
            previous: "Previous",
            cancel: "Cancel",
            save: "Save",
            exit: "Exit",
            quit: "Quit",
            confirm: "Confirm",
        },

        error: {
            voidErr: "Please fill in this field",
            invalidUsername: "Invalid username",
            invalidPassword: "Invalid password",
            passwordsDontMatch: "Passwords don't match",
            checkData: "Please check the intergrity of the data",
         },
    },

    french: {
        main: {
            refresh: "Rafraîchir",
            configure: "Configurer",
            diagnose: "Diagnostiquer",
            help: "Aide",
            settings: "Paramètres",
            exit: "Quitter",
            id: "ID",
            name:"Nom",
            status: "État",
            connected: "Connecté",
        },

        settings: {
            username: "Nom d'Utilizateur",
            password: "Mot de Pass",
            oldPassword: "Ancien Mot de Passe",
            newPassword: "Nouveau Mot de Passe",
            confirmPassword: "Confirmer Mot de Passe",
            language: "Langue",
            changeUsername: "Changer Nom d'Utilizateur",
            changePassword: "Changer Mot de Passe" ,
            changeLanguage: "Changer Langue",
            chooseLanguage: "Choiser Une Langue",
            enter: "Entrer",
            userPlaceholder: "Entrez le nom d'utilisateur",
            passwordPlaceholder: "Entrez le mot de passe",
        },
        
        config: {
            general: "Général",
            mode: "Mode",
            serial: "Série",
            network: "Réseau",
            generalConfig: "Configuration Générale",
            modeConfig: "Configuration du Mode",
            serialConfig: "Configuration Série",
            networkConfig: "Configuration du Réseau",
            deviceID: "ID de l'Appareil",
            name: "Nom",
            status: "Statut",
            rtuServerMode: "Mode Serveur RTU",
            tcpServerMode: "Mode Serveur TCP",
            stopBits: "Bits de Stop",
            dataSize: "Taille des Données", 
            slaveID: "ID Esclave",
            remoteSlaveId: "ID Esclave Distant", 
            remoteIP: "IP Distant",
        },

        diagnose: {
            number : "numero",
            time: "Temps",
            source: "Source",
            destination: "Destination",
            length: "Longueur", 
            data: "data",
        },
        
        factoryReset :{
            factoryReset: "Réinitialisation d'Usine",
            mainText: "Êtes-vous sûr de vouloir réinitialiser la passerelle à la configuration par défaut ?"
        },
    
        button: {
            next: "Suivant",
            previous: "Précédent",
            cancel: "Quitter",
            save: "Sauvgarder",
            exit: "Sortie",
            quit: "Sortie",
            confirm: "Confirmer"
        },

        error: {
            voidErr: "Veuillez remplir ce champ",
            invalidUsername: "Nom d'utilisateur invalide",
            invalidPassword: "Mot de passe invalide",
            passwordsDontMatch: "Les mots de passe ne correspondent pas",
            checkData: "Veuillez vérifier l'intégrité des données",
        },
    },

    spanish: {
        main: {
            refresh: "Actualizar",
            configure: "Configurar",
            diagnose: "Diagnosticar",
            help: "Ayuda",
            settings: "Ajustes",
            exit: "Salir",
            id: "ID",
            name: "Nombre",
            status: "Estado",
            connected: "Conectado",
        },
    
        settings: {
            username: "Nombre de usuario",
            password: "Contraseña",
            oldPassword: "Contraseña anterior",
            newPassword: "Nueva contraseña",
            confirmPassword: "Confirmar contraseña",
            language: "Idioma",
            changeUsername: "Cambiar nombre de usuario",
            changePassword: "Cambiar contraseña",
            changeLanguage: "Cambiar idioma",
            chooseLanguage: "Elegir idioma",
            enter: "Entrar",
            userPlaceholder: "Ingrese el nombre de usuario",
            passwordPlaceholder: "Ingrese la contraseña",
        },
    
        config: {
            general: "General",
            mode: "Modo",
            serial: "Serie",
            network: "Red",
            generalConfig: "Configuración general",
            modeConfig: "Configuración de modo",
            serialConfig: "Configuración de serie",
            networkConfig: "Configuración de red",
            deviceID: "ID del dispositivo",
            name: "Nombre",
            status: "Estado",
            rtuServerMode: "Modo Servidor RTU",
            tcpServerMode: "Modo Servidor TCP",
            stopBits: "Bits de parada",
            dataSize: "Tamaño de datos",
            slaveID: "ID del esclavo",
            remoteSlaveId: "ID de esclavo remoto",
            remoteIP: "IP remota",
        },
    
        diagnose: {
            number : "número",
            time: "Tiempo",
            source: "Origen",
            destination: "Destino",
            length: "Longitud",
            data : "datos",
        },

        factoryReset :{
            factoryReset: "Restablecimiento de fábrica",
            mainText: "¿Está seguro de que desea restablecer la configuración predeterminada del gateway?"
        },
    
        button: {
            next: "Siguiente",
            previous: "Anterior",
            cancel: "Cancelar",
            save: "Guardar",
            exit: "Salir",
            quit: "Cerrar",
            confirm: "Confirmar",
        },

        error: {
            voidErr: "Por favor, rellene este campo",
            invalidUsername: "Nombre de usuario no válido",
            invalidPassword: "Contraseña no válida",
            passwordsDontMatch: "Las contraseñas no coinciden",
            checkData: "Por favor, verifique la integridad de los datos",
        },
    }    
}

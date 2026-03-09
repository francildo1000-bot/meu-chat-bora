// CONFIGURAÇÃO FIREBASE (Mantenha as suas credenciais)
const firebaseConfig = {
    apiKey: "AIzaSyAT3yJEb0VYpz-KEydMJ5Ug4rvPnTbPcf0",
    authDomain: "meuchatbora.firebaseapp.com",
    databaseURL: "https://meuchatbora-default-rtdb.firebaseio.com",
    projectId: "meuchatbora",
    storageBucket: "meuchatbora.firebasestorage.app",
    messagingSenderId: "203988694746",
    appId: "1:203988694746:web:002ace8fb51ffa203417e3"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

window.onload = () => {
    let usuario = localStorage.getItem('dz_username') || "Visitante";
    const countNumber = document.getElementById('count-number');
    const attachmentMenu = document.getElementById('attachment-menu');
    const toggleMenu = document.getElementById('toggle-menu');
    const messageInput = document.getElementById('message-input');
    const chatWindow = document.getElementById('chat-window');

    // LOGIN
    if (usuario === "Visitante") {
        const nome = prompt("Qual seu vulgo no Distrito Zero?");
        if (nome) { usuario = nome; localStorage.setItem('dz_username', nome); }
    }

    // BANDEJA
    toggleMenu.onclick = (e) => {
        e.stopPropagation();
        attachmentMenu.style.display = attachmentMenu.style.display === 'flex' ? 'none' : 'flex';
    };
    document.onclick = () => attachmentMenu.style.display = 'none';

    // CONTADOR ONLINE (CORRIGIDO)
    const myPresenceRef = database.ref('presence/' + usuario);
    database.ref('.info/connected').on('value', (snap) => {
        if (snap.val()) {
            myPresenceRef.onDisconnect().remove();
            myPresenceRef.set(true);
        }
    });

    database.ref('presence').on('value', (snap) => {
        if (countNumber) countNumber.innerText = snap.numChildren() || 0;
    });

    // ENVIAR
    window.enviar = function() {
        const msg = messageInput.value.trim();
        if (msg) {
            database.ref('messages').push({
                user: usuario,
                msg: msg,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            });
            messageInput.value = "";
        }
    };

    document.getElementById('send-btn').onclick = window.enviar;
    messageInput.onkeypress = (e) => { if(e.key === 'Enter') window.enviar(); };

    // ESCUTAR MENSAGENS
    database.ref('messages').limitToLast(50).on('child_added', (snap) => {
        const data = snap.val();
        const div = document.createElement('div');
        div.className = data.user === usuario ? 'minha-msg' : 'outra-msg';
        div.innerHTML = `<strong>${data.user}</strong><br>${data.msg}<br><small style="font-size:10px; opacity:0.6">${data.time}</small>`;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });
};
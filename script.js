// 1. Configurações do Firebase (Mantenha as suas originais)
const firebaseConfig = {
    apiKey: "AIzaSyAT3yJEb0VYpz-KEydMJ5Ug4rvPnTbPcf0",
    authDomain: "meuchatbora.firebaseapp.com",
    databaseURL: "https://meuchatbora-default-rtdb.firebaseio.com",
    projectId: "meuchatbora",
    storageBucket: "meuchatbora.firebasestorage.app",
    messagingSenderId: "203988694746",
    appId: "1:203988694746:web:002ace8fb51ffa203417e3"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let usuario = localStorage.getItem('dz_username') || "Visitante";

// 2. Elementos e Lógica (Revisada 3x)
window.addEventListener('load', () => {
    const countNumber = document.getElementById('count-number');
    const toggleMenu = document.getElementById('toggle-menu');
    const attachmentMenu = document.getElementById('attachment-menu');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatWindow = document.getElementById('chat-window');

    // NOME DO USUÁRIO
    if (usuario === "Visitante") {
        const nome = prompt("Qual seu vulgo no Distrito Zero?");
        if (nome) { usuario = nome; localStorage.setItem('dz_username', nome); }
    }

    // LÓGICA DA BANDEJA
    toggleMenu.onclick = (e) => {
        e.stopPropagation();
        attachmentMenu.style.display = attachmentMenu.style.display === 'flex' ? 'none' : 'flex';
    };

    document.onclick = () => { attachmentMenu.style.display = 'none'; };

    // CONTADOR DE PRESENÇA (CORREÇÃO DEFINITIVA)
    const myPresenceRef = database.ref('presence/' + usuario);
    const totalPresenceRef = database.ref('presence');

    database.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val()) {
            myPresenceRef.onDisconnect().remove();
            myPresenceRef.set(true);
        }
    });

    totalPresenceRef.on('value', (snapshot) => {
        const total = snapshot.numChildren() || 0;
        if (countNumber) countNumber.innerText = total;
    });

    // ENVIAR MENSAGEM
    function enviar(msg) {
        if (!msg.trim()) return;
        database.ref('messages').push({
            user: usuario,
            msg: msg,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
        messageInput.value = "";
    }

    sendBtn.onclick = () => enviar(messageInput.value);

    // ESCUTAR MENSAGENS
    database.ref('messages').on('child_added', (snap) => {
        const data = snap.val();
        const div = document.createElement('div');
        div.className = data.user === usuario ? 'minha-msg' : 'outra-msg';
        div.innerHTML = `<b>${data.user}</b><br>${data.msg}<br><small>${data.time}</small>`;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });
});
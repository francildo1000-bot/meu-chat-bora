const firebaseConfig = {
    apiKey: "AIzaSyAT3yJEb0VYpz-KEydMJ5Ug4rvPnTbPcf0",
    authDomain: "meuchatbora.firebaseapp.com",
    databaseURL: "https://meuchatbora-default-rtdb.firebaseio.com",
    projectId: "meuchatbora",
    storageBucket: "meuchatbora.firebasestorage.app",
    messagingSenderId: "203988694746",
    appId: "1:203988694746:web:002ace8fb51ffa203417e3",
    measurementId: "G-HMWGNS289G"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let usuarioAtual = prompt("Qual é o seu nome?");
if (!usuarioAtual || usuarioAtual.trim() === "") usuarioAtual = "Anônimo";

const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');

function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== "") {
        const agora = new Date();
        const horaFormatada = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');

        database.ref('messages').push({
            username: usuarioAtual,
            text: message,
            time: horaFormatada, // Envia a hora junto
            timestamp: Date.now()
        });
        messageInput.value = "";
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const messageElement = document.createElement('div');
    
    // Verifica se a mensagem é sua para mudar a cor
    const souEu = data.username === usuarioAtual ? "minha-msg" : "outra-msg";
    
    messageElement.classList.add('message', souEu);
    messageElement.innerHTML = `
        <span class="user-name">${data.username}</span>
        <p class="text-msg">${data.text}</p>
        <span class="time-msg">${data.time || '--:--'}</span>
    `;
    
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});
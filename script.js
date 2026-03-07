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

let usuarioAtual = prompt("Qual é o seu nome?");
if (!usuarioAtual || usuarioAtual.trim() === "") usuarioAtual = "Anônimo";

const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');

// Função para enviar
function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== "") {
        const agora = new Date();
        const hora = agora.getHours().toString().padStart(2, '0');
        const minuto = agora.getMinutes().toString().padStart(2, '0');
        
        database.ref('messages').push({
            username: usuarioAtual,
            text: message,
            time: `${hora}:${minuto}`,
            timestamp: Date.now()
        });
        messageInput.value = "";
    }
}

// Função para APAGAR a mensagem
function removerMensagem(id) {
    if (confirm("Deseja apagar esta mensagem?")) {
        database.ref('messages/' + id).remove();
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// Escutar novas mensagens
database.ref('messages').on('child_added', (snapshot) => {
    renderizarMensagem(snapshot);
});

// ESCUTAR QUANDO UMA MENSAGEM FOR APAGADA (Para sumir da tela de todos)
database.ref('messages').on('child_removed', (snapshot) => {
    const msgParaRemover = document.getElementById(snapshot.key);
    if (msgParaRemover) msgParaRemover.remove();
});

function renderizarMensagem(snapshot) {
    const data = snapshot.val();
    const id = snapshot.key;
    const messageElement = document.createElement('div');
    const souEu = data.username === usuarioAtual;
    
    messageElement.id = id;
    messageElement.classList.add('message', souEu ? "minha-msg" : "outra-msg");

    // Botão de apagar (só aparece se a mensagem for sua)
    const botaoApagar = souEu ? `<span class="delete-btn" onclick="removerMensagem('${id}')">🗑️</span>` : "";

    messageElement.innerHTML = `
        <span class="user-name">${data.username} ${botaoApagar}</span>
        <p class="text-msg">${data.text}</p>
        <span class="time-msg">${data.time || 'Novo'}</span>
    `;
    
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
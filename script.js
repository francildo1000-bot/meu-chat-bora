// Configuração do seu Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAT3yJEb0VYpz-KEydMJ5Ug4rvPnTbPcf0",
    authDomain: "meuchatbora.firebaseapp.com",
    databaseURL: "https://meuchatbora-default-rtdb.firebaseio.com",
    projectId: "meuchatbora",
    storageBucket: "meuchatbora.firebasestorage.app",
    messagingSenderId: "203988694746",
    appId: "1:203988694746:web:002ace8fb51ffa203417e3"
};

// Inicializa o Firebase e o Banco de Dados
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Pergunta o nome e define se é Admin
let usuarioAtual = prompt("Qual é o seu nome?");
if (!usuarioAtual || usuarioAtual.trim() === "") usuarioAtual = "Anônimo";
const SOU_ADMIN = (usuarioAtual === "Admin-Hells~");

// Seleciona os elementos da tela
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const somNotificacao = document.getElementById('notificacao-som');

// Função para ENVIAR mensagem
function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (messageText !== "") {
        const agora = new Date();
        const horaFormatada = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');

        database.ref('messages').push({
            username: usuarioAtual,
            text: messageText,
            time: horaFormatada,
            timestamp: Date.now()
        }).then(() => {
            messageInput.value = ""; // Limpa o campo após sucesso
        }).catch((error) => {
            console.error("Erro ao enviar:", error);
            alert("Erro ao enviar mensagem!");
        });
    }
}

// Função para APAGAR mensagem
window.removerMensagem = function(id) {
    if (confirm("Deseja apagar esta mensagem?")) {
        database.ref('messages/' + id).remove();
    }
};

// Eventos de clique e teclado
sendBtn.onclick = sendMessage;
messageInput.onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
};

// Escuta novas mensagens (Recebimento)
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const id = snapshot.key;
    
    // Tocar som se não for minha mensagem
    if (data.username !== usuarioAtual && somNotificacao) {
        somNotificacao.play().catch(() => {});
    }

    const messageElement = document.createElement('div');
    const souEu = data.username === usuarioAtual;
    
    messageElement.id = id;
    messageElement.classList.add('message', souEu ? "minha-msg" : "outra-msg");

    // Lógica do botão apagar
    const podeApagar = souEu || SOU_ADMIN;
    const botaoApagar = podeApagar ? `<span class="delete-btn" onclick="removerMensagem('${id}')">🗑️</span>` : "";

    messageElement.innerHTML = `
        <span class="user-name">${data.username} ${botaoApagar}</span>
        <p class="text-msg">${data.text}</p>
        <span class="time-msg">${data.time || '--:--'}</span>
    `;
    
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Remove da tela se alguém apagar no banco
database.ref('messages').on('child_removed', (snapshot) => {
    const msgParaRemover = document.getElementById(snapshot.key);
    if (msgParaRemover) msgParaRemover.remove();
});
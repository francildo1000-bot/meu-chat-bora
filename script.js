// Configuração do seu Firebase (Dados reais do seu projeto)
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

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- SISTEMA DE NOME: Pergunta ao entrar no link ---
let usuarioAtual = prompt("Qual é o seu nome para o chat?");

// Se a pessoa cancelar ou deixar em branco, o nome será "Anônimo"
if (!usuarioAtual || usuarioAtual.trim() === "") {
    usuarioAtual = "Anônimo";
}
// --------------------------------------------------

const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');

// Função para enviar mensagem usando o nome capturado
function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== "") {
        database.ref('messages').push({
            username: usuarioAtual, 
            text: message,
            timestamp: Date.now()
        });
        messageInput.value = ""; 
    }
}

// Eventos de clique e tecla Enter
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Receber e exibir as mensagens com os nomes corretos
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const messageElement = document.createElement('div');
    messageElement.style.marginBottom = "8px";
    
    // Mostra o nome em negrito e depois a mensagem
    messageElement.innerHTML = `<strong>${data.username}:</strong> ${data.text}`;
    
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; 
});
// Configuração oficial do seu Firebase (conforme seu print)
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

// Inicializando o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Selecionando os elementos da tela
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');

// Função para enviar mensagem
function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== "") {
        database.ref('messages').push({
            username: "Admin-Hells~",
            text: message,
            timestamp: Date.now()
        });
        messageInput.value = ""; // Limpa o campo
    }
}

// Escutar o botão e a tecla Enter
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Receber e exibir mensagens em tempo real
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // Formatação: Nome em negrito + Mensagem
    messageElement.innerHTML = `<strong>${data.username}:</strong> ${data.text}`;
    
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Rola o chat para o final
});
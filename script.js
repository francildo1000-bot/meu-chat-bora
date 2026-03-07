// Configuração oficial do seu Firebase (Baseado nos seus prints)
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

// Selecionando os elementos da interface
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');

// Função para enviar mensagem ao Firebase
function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== "") {
        database.ref('messages').push({
            username: "Admin-Hells~",
            text: message,
            timestamp: Date.now()
        }).then(() => {
            console.log("Mensagem enviada com sucesso!");
            messageInput.value = ""; // Limpa o campo
        }).catch((error) => {
            console.error("Erro ao enviar mensagem: ", error);
            alert("Erro ao enviar! Verifique as regras (Rules) no Firebase.");
        });
    }
}

// Aguarda o carregamento para ativar os botões e mostrar mensagens
window.onload = function() {
    console.log("Chat pronto para uso!");

    // Escutar o clique no botão de enviar
    sendBtn.addEventListener('click', sendMessage);

    // Escutar a tecla Enter no teclado
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Escutar e exibir novas mensagens em tempo real
    database.ref('messages').on('child_added', (snapshot) => {
        const data = snapshot.val();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        // Estrutura: Nome em negrito + Texto da mensagem
        messageElement.innerHTML = `<strong>${data.username}:</strong> ${data.text}`;
        
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight; // Rola o chat para o fim
    });
};
// 1. Configuração do seu Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAT3yJEb0VYpz-KEydMJ5Ug4rvPnTbPcf0",
    authDomain: "meuchatbora.firebaseapp.com",
    databaseURL: "https://meuchatbora-default-rtdb.firebaseio.com",
    projectId: "meuchatbora",
    storageBucket: "meuchatbora.firebasestorage.app",
    messagingSenderId: "203988694746",
    appId: "1:203988694746:web:002ace8fb51ffa203417e3"
};

// Inicializa o Firebase
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const database = firebase.database();

// 2. Identificação e Admin
let usuarioAtual = prompt("Qual é o seu nome?");
if (!usuarioAtual || usuarioAtual.trim() === "") usuarioAtual = "Anônimo";
const SOU_ADMIN = (usuarioAtual === "Admin-Hells~");

// 3. Seleção de Elementos (Certifique-se que o index.html tem o botão 'gif-btn')
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const som = document.getElementById('notificacao-som');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');

// 4. Lista de GIFs Rápidos
const meusGifs = [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzR5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxWlHXYrde/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzR5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26gsjCZpPolPr3sBy/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzR5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfORVpPcI8l9K/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzR5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif"
];

// 5. Funções de Envio
function enviarParaBanco(conteudo) {
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
    
    database.ref('messages').push({
        username: usuarioAtual,
        text: conteudo,
        time: hora
    });
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (text !== "") {
        enviarParaBanco(text);
        messageInput.value = "";
    }
}

//
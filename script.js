// 1. Configuração (Usando suas chaves das imagens)
const firebaseConfig = {
    apiKey: "AIzaSyAT3yJEb0VYpz-KEydMJ5Ug4rvPnTbPcf0",
    authDomain: "meuchatbora.firebaseapp.com",
    databaseURL: "https://meuchatbora-default-rtdb.firebaseio.com",
    projectId: "meuchatbora",
    storageBucket: "meuchatbora.firebasestorage.app",
    messagingSenderId: "203988694746",
    appId: "1:203988694746:web:002ace8fb51ffa203417e3"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const database = firebase.database();

// 2. Elementos (Declarados UMA única vez)
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const micBtn = document.getElementById('mic-btn');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');
const gifSearch = document.getElementById('gif-search');

let usuarioAtual = prompt("Qual seu nome?") || "Anônimo";

// 3. Enviar Mensagem
function enviar(conteudo) {
    if (!conteudo) return;
    database.ref('messages').push({
        nome: usuarioAtual,
        texto: conteudo,
        hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
}

// 4. Áudio (Lógica corrigida)
let mediaRecorder;
let audioChunks = [];

micBtn.onclick = async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/mpeg' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => enviar(reader.result);
        };
        mediaRecorder.start();
        micBtn.innerText = "🛑";
    } else {
        mediaRecorder.stop();
        micBtn.innerText = "🎤";
    }
};

// 5. Receber Mensagens
database.ref('messages').on('child_added', snap => {
    const data = snap.val();
    const div = document.createElement('div');
    div.className = `message ${data.nome === usuarioAtual ? 'minha-msg' : 'outra-msg'}`;
    
    if (data.texto.startsWith('data:audio')) {
        div.innerHTML = `<strong>${data.nome}</strong><br><audio controls src="${data.texto}" style="width:200px"></audio>`;
    } else if (data.texto.includes('giphy.com')) {
        div.innerHTML = `<strong>${data.nome}</strong><br><img src="${data.texto}" style="width:150px">`;
    } else {
        div.innerHTML = `<strong>${data.nome}</strong><br>${data.texto}`;
    }
    
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// 6. Botão Enviar e GIFs
sendBtn.onclick = () => { enviar(messageInput.value); messageInput.value = ""; };
gifBtn.onclick = () => { gifModal.style.display = gifModal.style.display === 'none' ? 'block' : 'none'; };
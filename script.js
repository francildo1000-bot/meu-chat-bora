// 1. Configuração do Firebase
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

// 2. Seleção de Elementos (SEM DUPLICATAS)
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');
const gifSearchInput = document.getElementById('gif-search'); 
const micBtn = document.getElementById('mic-btn');

let usuarioAtual = prompt("Qual é o seu nome?") || "Visitante";

// 3. Função de Envio
function enviarMensagem(conteudo) {
    if (!conteudo) return;
    const agora = new Date();
    const hora = agora.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    database.ref('messages').push({
        username: usuarioAtual,
        text: conteudo,
        time: hora
    });
}

// 4. Lógica do Microfone (CORRIGIDA)
let mediaRecorder;
let audioChunks = [];

if (micBtn) {
    micBtn.onclick = async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob); 
                    reader.onloadend = () => enviarMensagem(reader.result);
                };
                mediaRecorder.start();
                micBtn.innerText = "🛑";
                micBtn.style.color = "red";
            } catch (err) { alert("Ative o microfone nas permissões!"); }
        } else {
            mediaRecorder.stop();
            micBtn.innerText = "🎤";
            micBtn.style.color = "";
        }
    };
}

// 5. Exibir Mensagens (GIF e Áudio)
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const msgDiv = document.createElement('div');
    const souEu = data.username === usuarioAtual;
    msgDiv.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

    let conteudoFinal;
    if (data.text.startsWith('data:audio')) {
        conteudoFinal = `<audio controls src="${data.text}" style="width: 200px; height: 35px;"></audio>`;
    } else if (data.text.includes('giphy.com')) {
        conteudoFinal = `<img src="${data.text}" style="max-width:200px; border-radius:10px;">`;
    } else {
        conteudoFinal = `<p>${data.text}</p>`;
    }

    msgDiv.innerHTML = `<span class="user-name">${data.username}</span>${conteudoFinal}`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});
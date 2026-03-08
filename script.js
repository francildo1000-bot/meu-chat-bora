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
const somNotificacao = document.getElementById('notificacao-som');
const micBtn = document.getElementById('mic-btn');
const onlineCountSpan = document.getElementById('online-count');

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

// 4. Lógica do Microfone (Áudio)
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
            } catch (err) { alert("Ative o microfone!"); }
        } else {
            mediaRecorder.stop();
            micBtn.innerText = "🎤";
            micBtn.style.color = "";
        }
    };
}

// 5. Busca de GIFs
async function buscarGifs(termo = '') {
    const apiKey = 'Yul3vV8u0jSzwIQSNjVNsu5weoTaAhPB'; 
    const endpoint = termo ? 'search' : 'trending';
    const url = `https://api.giphy.com/v1/gifs/${endpoint}?api_key=${apiKey}&q=${termo}&limit=12&rating=g`;

    try {
        const response = await fetch(url);
        const { data } = await response.json();
        gifList.innerHTML = ""; 
        data.forEach(gif => {
            const img = document.createElement('img');
            img.src = gif.images.fixed_height_small.url;
            img.onclick = () => {
                enviarMensagem(gif.images.original.url);
                gifModal.style.display = 'none';
            };
            gifList.appendChild(img);
        });
    } catch (e) { console.error("Erro nos GIFs:", e); }
}

// 6. Exibição em Tempo Real
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const msgDiv = document.createElement('div');
    const souEu = data.username === usuarioAtual;
    msgDiv.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

    let conteudoFinal;
    if (data.text.startsWith('data:audio')) {
        conteudoFinal = `<audio controls src="${data.text}"></audio>`;
    } else if (data.text.includes('giphy.com')) {
        conteudoFinal = `<img src="${data.text}" style="max-width:200px;">`;
    } else {
        conteudoFinal = `<p>${data.text}</p>`;
    }

    msgDiv.innerHTML = `<span class="user-name">${data.username}</span>${conteudoFinal}`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Eventos de clique
if (gifBtn) gifBtn.onclick = () => {
    gifModal.style.display = gifModal.style.display === 'none' ? 'block' : 'none';
    if (gifModal.style.display === 'block') buscarGifs();
};

if (gifSearchInput) gifSearchInput.oninput = (e) => buscarGifs(e.target.value);

if (sendBtn) sendBtn.onclick = () => {
    enviarMensagem(messageInput.value);
    messageInput.value = "";
};
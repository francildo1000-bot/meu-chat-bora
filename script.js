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

// 2. Seleção de Elementos
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');
const gifSearchInput = document.getElementById('gif-search'); // ID corrigido conforme o novo HTML
const somNotificacao = document.getElementById('notificacao-som');
const micBtn = document.getElementById('mic-btn');
const clearBtn = document.getElementById('clear-chat-btn');
const onlineCountSpan = document.getElementById('online-count');

let usuarioAtual = prompt("Qual é o seu nome?") || "Visitante";

// Mostrar botão ADM
if (usuarioAtual === "Admin-Hells~" && clearBtn) {
    clearBtn.style.display = "block";
}

// 3. Funções de Enviar
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
            } catch (err) {
                alert("Permita o uso do microfone!");
            }
        } else {
            mediaRecorder.stop();
            micBtn.innerText = "🎤";
            micBtn.style.color = "";
        }
    };
}

// 5. Exibir Mensagens em Tempo Real
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const messageId = snapshot.key;
    
    // Tocar som se for de outro usuário
    if (data.username !== usuarioAtual && somNotificacao) {
        somNotificacao.play().catch(() => {});
    }

    const msgDiv = document.createElement('div');
    const souEu = data.username === usuarioAtual;
    msgDiv.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;
    msgDiv.id = `msg-${messageId}`;

    // Identificar tipo de conteúdo (GIF, Áudio ou Texto)
    let conteudoFinal;
    if (data.text.startsWith('data:audio')) {
        conteudoFinal = `<audio controls src="${data.text}" style="width: 200px; height: 35px;"></audio>`;
    } else if (data.text.includes('giphy.com')) {
        conteudoFinal = `<img src="${data.text}" style="max-width:200px; border-radius:10px;">`;
    } else {
        conteudoFinal = `<p>${data.text}</p>`;
    }

    const botaoApagar = souEu ? `<button class="delete-btn" onclick="apagarMinhaMensagem('${messageId}')">🗑️</button>` : "";

    msgDiv.innerHTML = `
        <span class="user-name">${data.username}</span>
        ${conteudoFinal}
        <div class="footer-msg">
            <span class="time-msg">${data.time || 'Agora'}</span>
            ${botaoApagar}
        </div>
    `;
    
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// 6. Apagar Mensagens
window.apagarMinhaMensagem = (id) => {
    if (confirm("Deseja apagar sua mensagem?")) {
        database.ref('messages/' + id).remove();
    }
};

database.ref('messages').on('child_removed', (snapshot) => {
    const elemento = document.getElementById(`msg-${snapshot.key}`);
    if (elemento) elemento.remove();
});

if (clearBtn) {
    clearBtn.onclick = () => {
        if (confirm("Apagar todo o histórico?")) database.ref('messages').remove();
    };
}

// 7. Contador Online
const userStatusRef = database.ref('status/' + usuarioAtual.replace(/[.#$[\]]/g, "_"));
database.ref(".info/connected").on("value", (snapshot) => {
    if (snapshot.val() === true) {
        userStatusRef.onDisconnect().remove();
        userStatusRef.set(true);
    }
});
database.ref('status').on('value', (snapshot) => {
    if (onlineCountSpan) onlineCountSpan.innerText = snapshot.numChildren();
});

// 8. GIFs e Envio de Texto
if (gifBtn) {
    gifBtn.onclick = () => {
        gifModal.style.display = gifModal.style.display === 'block' ? 'none' : 'block';
    };
}

if (sendBtn) {
    sendBtn.onclick = () => {
        if (messageInput.value.trim()) {
            enviarMensagem(messageInput.value);
            messageInput.value = "";
        }
    };
}
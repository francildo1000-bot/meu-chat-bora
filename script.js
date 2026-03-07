// ... (mantenha seu firebaseConfig igual) ...

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let usuarioAtual = prompt("Qual é o seu nome?");
if (!usuarioAtual || usuarioAtual.trim() === "") usuarioAtual = "Anônimo";

// SENHA DE ADMIN: Se o nome for esse, você pode apagar tudo!
const SOU_ADMIN = (usuarioAtual === "Admin-Hells~"); 

const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const som = document.getElementById('notificacao-som');

function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== "") {
        const agora = new Date();
        database.ref('messages').push({
            username: usuarioAtual,
            text: message,
            time: agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0'),
            timestamp: Date.now()
        });
        messageInput.value = "";
    }
}

function removerMensagem(id) {
    if (confirm("Deseja apagar esta mensagem?")) {
        database.ref('messages/' + id).remove();
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// Escutar novas mensagens
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    
    // Tocar som se a mensagem NÃO for minha
    if (data.username !== usuarioAtual) {
        som.play().catch(e => console.log("Som bloqueado pelo navegador até o primeiro clique."));
    }
    
    renderizarMensagem(snapshot);
});

database.ref('messages').on('child_removed', (snapshot) => {
    const msg = document.getElementById(snapshot.key);
    if (msg) msg.remove();
});

function renderizarMensagem(snapshot) {
    const data = snapshot.val();
    const id = snapshot.key;
    const messageElement = document.createElement('div');
    const souEu = data.username === usuarioAtual;
    
    messageElement.id = id;
    messageElement.classList.add('message', souEu ? "minha-msg" : "outra-msg");

    // LÓGICA DE APAGAR: Aparece se for minha OU se eu for o Admin
    const podeApagar = souEu || SOU_ADMIN;
    const botaoApagar = podeApagar ? `<span class="delete-btn" onclick="removerMensagem('${id}')">🗑️</span>` : "";

    messageElement.innerHTML = `
        <span class="user-name">${data.username} ${botaoApagar}</span>
        <p class="text-msg">${data.text}</p>
        <span class="time-msg">${data.time || 'Novo'}</span>
    `;
    
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
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

let usuarioAtual = prompt("Qual é o seu nome?");
if (!usuarioAtual || usuarioAtual.trim() === "") usuarioAtual = "Anônimo";
const SOU_ADMIN = (usuarioAtual === "Admin-Hells~");

const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const som = document.getElementById('notificacao-som');

function sendMessage() {
    const text = messageInput.value.trim();
    if (text !== "") {
        const agora = new Date();
        const hora = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
        
        database.ref('messages').push({
            username: usuarioAtual,
            text: text,
            time: hora
        });
        messageInput.value = "";
    }
}

sendBtn.onclick = sendMessage;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

// ESSA PARTE FAZ APARECER NA TELA
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const id = snapshot.key;
    const souEu = data.username === usuarioAtual;
    
    // Tocar som se não for meu
    if (!souEu && som) som.play().catch(() => {});

    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.classList.add('message', souEu ? 'minha-msg' : 'outra-msg');

    const ehImagem = data.text.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
    const conteudo = ehImagem ? `<img src="${data.text}" style="max-width:180px; border-radius:8px; display:block; margin-top:5px;">` : `<p class="text-msg">${data.text}</p>`;
    const btnApagar = (souEu || SOU_ADMIN) ? `<span class="delete-btn" onclick="removerMensagem('${id}')">🗑️</span>` : "";

    msgDiv.innerHTML = `
        <span class="user-name">${data.username} ${btnApagar}</span>
        ${conteudo}
        <span class="time-msg">${data.time || '--:--'}</span>
    `;

    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

window.removerMensagem = (id) => { if(confirm("Apagar?")) database.ref('messages/'+id).remove(); };
database.ref('messages').on('child_removed', (snapshot) => { document.getElementById(snapshot.key)?.remove(); });
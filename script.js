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

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const database = firebase.database();

// 2. Identificação
let usuarioAtual = prompt("Qual é o seu nome?");
if (!usuarioAtual || usuarioAtual.trim() === "") usuarioAtual = "Anônimo";
const SOU_ADMIN = (usuarioAtual === "Admin-Hells~");

// 3. Seleção de Elementos (Com proteção para não travar)
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const som = document.getElementById('notificacao-som');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');

// 4. Lista de GIFs
const meusGifs = [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzR5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxWlHXYrde/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzR5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26gsjCZpPolPr3sBy/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzRyeXF4ZzR5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfORVpPcI8l9K/giphy.gif"
];

// 5. Função de Enviar
function enviarMensagem(conteudo) {
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
    database.ref('messages').push({
        username: usuarioAtual,
        text: conteudo,
        time: hora
    }).catch(err => console.error("Erro ao enviar:", err));
}

if(sendBtn) {
    sendBtn.onclick = () => {
        if (messageInput.value.trim() !== "") {
            enviarMensagem(messageInput.value);
            messageInput.value = "";
        }
    };
}

if(messageInput) {
    messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendBtn.click(); };
}

// 6. Lógica do GIF (Só roda se os elementos existirem)
if (gifBtn && gifModal) {
    gifBtn.onclick = () => {
        gifModal.style.display = gifModal.style.display === 'none' ? 'block' : 'none';
        if (gifModal.style.display === 'block' && gifList) {
            gifList.innerHTML = "";
            meusGifs.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.style.width = "100%";
                img.style.cursor = "pointer";
                img.onclick = () => {
                    enviarMensagem(url);
                    gifModal.style.display = 'none';
                };
                gifList.appendChild(img);
            });
        }
    };
}

// 7. CARREGAR MENSAGENS (O coração do chat)
database.ref('messages').on('child_added', (snapshot) => {
    try {
        const data = snapshot.val();
        const id = snapshot.key;
        const souEu = data.username === usuarioAtual;
        
        if (!souEu && som) som.play().catch(() => {});

        const msgDiv = document.createElement('div');
        msgDiv.id = id;
        msgDiv.classList.add('message', souEu ? 'minha-msg' : 'outra-msg');

        const textoLimpo = data.text.toLowerCase();
        const ehImagem = textoLimpo.includes('.jpg') || textoLimpo.includes('.png') || textoLimpo.includes('.gif') || textoLimpo.includes('.webp');

        const conteudo = ehImagem ? 
            `<img src="${data.text}" style="max-width:180px; border-radius:8px; display:block; margin-top:5px;">` : 
            `<p class="text-msg">${data.text}</p>`;

        const btnApagar = (souEu || SOU_ADMIN) ? `<span class="delete-btn" onclick="removerMensagem('${id}')">🗑️</span>` : "";

        msgDiv.innerHTML = `<span class="user-name">${data.username} ${btnApagar}</span>${conteudo}<span class="time-msg">${data.time || '--:--'}</span>`;
        
        if(chatWindow) {
            chatWindow.appendChild(msgDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    } catch (e) { console.error("Erro ao processar mensagem:", e); }
});

window.removerMensagem = (id) => { if(confirm("Apagar?")) database.ref('messages/'+id).remove(); };
database.ref('messages').on('child_removed', (snapshot) => { 
    const el = document.getElementById(snapshot.key);
    if(el) el.remove();
});
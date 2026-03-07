// 1. Configuração do Firebase (Mantenha seus dados originais)
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

// 3. Seleção de Elementos (Com proteção '?' para não dar erro no VS Code)
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');
const gifSearchInput = document.getElementById('gif-search-input');

// 4. Função de Enviar
function enviarMensagem(conteudo) {
    if (!conteudo) return;
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
    
    database.ref('messages').push({
        username: usuarioAtual,
        text: conteudo,
        time: hora
    }).catch(err => console.error("Erro Firebase:", err));
}

// 5. Eventos de Clique
if (sendBtn) {
    sendBtn.onclick = () => {
        if (messageInput && messageInput.value.trim() !== "") {
            enviarMensagem(messageInput.value);
            messageInput.value = "";
        }
    };
}

// 6. Busca de GIFs (API Giphy)
async function buscarGifs(termo = 'trending') {
    if (!gifList) return;
    const apiKey = 'dc6zaTOxFJmzC'; 
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${termo}&limit=12&rating=g`;
    
    try {
        const response = await fetch(url);
        const { data } = await response.json();
        gifList.innerHTML = "";
        data.forEach(gif => {
            const img = document.createElement('img');
            img.src = gif.images.fixed_height_small.url;
            img.style.width = "100%";
            img.style.cursor = "pointer";
            img.onclick = () => {
                enviarMensagem(gif.images.original.url);
                if (gifModal) gifModal.style.display = 'none';
            };
            gifList.appendChild(img);
        });
    } catch (e) { console.error("Erro Giphy:", e); }
}

if (gifBtn && gifModal) {
    gifBtn.onclick = () => {
        gifModal.style.display = gifModal.style.display === 'none' ? 'block' : 'none';
        if (gifModal.style.display === 'block') buscarGifs();
    };
}

if (gifSearchInput) {
    gifSearchInput.oninput = (e) => {
        if (e.target.value.length > 2) buscarGifs(e.target.value);
    };
}

// 7. Carregar Mensagens do Banco
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!chatWindow || !data) return;

    const msgDiv = document.createElement('div');
    msgDiv.id = snapshot.key;
    const souEu = data.username === usuarioAtual;
    msgDiv.classList.add('message', souEu ? 'minha-msg' : 'outra-msg');

    const ehImagem = data.text.includes('http') && (data.text.includes('.gif') || data.text.includes('giphy.com'));
    const conteudo = ehImagem ? 
        `<img src="${data.text}" style="max-width:180px; border-radius:8px;">` : 
        `<p class="text-msg">${data.text}</p>`;

    msgDiv.innerHTML = `<span class="user-name">${data.username}</span>${conteudo}<span class="time-msg">${data.time || ''}</span>`;
    
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});
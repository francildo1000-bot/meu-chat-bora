// 1. Configuração (Mantenha suas chaves aqui)
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

// 3. Seleção de Elementos com Verificação (Evita que o chat trave)
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const som = document.getElementById('notificacao-som');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');
const gifSearchInput = document.getElementById('gif-search-input');

// 4. Função Principal de Envio
function enviarMensagem(conteudo) {
    if (!conteudo) return;
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
    
    database.ref('messages').push({
        username: usuarioAtual,
        text: conteudo,
        time: hora
    }).catch(err => alert("Erro ao enviar para o Firebase: " + err.message));
}

// 5. Controles do Botão Enviar e Teclado
if (sendBtn && messageInput) {
    sendBtn.onclick = () => {
        const txt = messageInput.value.trim();
        if (txt !== "") {
            enviarMensagem(txt);
            messageInput.value = "";
        }
    };

    messageInput.onkeypress = (e) => { 
        if (e.key === 'Enter') {
            e.preventDefault();
            sendBtn.click(); 
        }
    };
}

// 6. Lógica de Busca de GIFs (API Giphy)
async function buscarGifs(termo = 'trending') {
    if (!gifList) return;
    const apiKey = 'dc6zaTOxFJmzC'; 
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${termo}&limit=15&rating=g`;
    
    try {
        const response = await fetch(url);
        const { data } = await response.json();
        gifList.innerHTML = "";
        data.forEach(gif => {
            const img = document.createElement('img');
            img.src = gif.images.fixed_height_small.url;
            img.style.cursor = "pointer";
            img.onclick = () => {
                enviarMensagem(gif.images.original.url);
                gifModal.style.display = 'none';
            };
            gifList.appendChild(img);
        });
    } catch (e) { console.error("Erro Giphy:", e); }
}

if (gifBtn && gifModal) {
    gifBtn.onclick = () => {
        const abrindo = gifModal.style.display === 'none';
        gifModal.style.display = abrindo ? 'block' : 'none';
        if (abrindo) buscarGifs();
    };
}

if (gifSearchInput) {
    gifSearchInput.oninput = (e) => {
        if (e.target.value.length > 2) buscarGifs(e.target.value);
    };
}

// 7. Receber Mensagens (Faz o chat carregar na tela)
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const id = snapshot.key;
    if (!data || !chatWindow) return;

    const souEu = data.username === usuarioAtual;
    if (!souEu && som) som.play().catch(() => {});

    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.classList.add('message', souEu ? 'minha-
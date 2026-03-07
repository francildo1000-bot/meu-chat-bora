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

// 3. Seleção de Elementos
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const som = document.getElementById('notificacao-som');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');
const gifSearchInput = document.getElementById('gif-search-input'); // Novo campo de busca

// 4. Função para Buscar GIFs no Giphy (Infinitos)
async function buscarGifs(termo = 'trending') {
    const apiKey = 'dc6zaTOxFJmzC'; // Chave pública de teste do Giphy
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${termo}&limit=15&rating=g`;
    
    try {
        const response = await fetch(url);
        const { data } = await response.json();
        
        if (gifList) {
            gifList.innerHTML = "";
            data.forEach(gif => {
                const img = document.createElement('img');
                // Usamos a versão pequena para o menu carregar rápido
                img.src = gif.images.fixed_height_small.url;
                img.style.width = "100%";
                img.style.cursor = "pointer";
                img.style.borderRadius = "5px";
                img.onclick = () => {
                    // Enviamos a versão original/grande para o chat
                    enviarMensagem(gif.images.original.url);
                    gifModal.style.display = 'none';
                };
                gifList.appendChild(img);
            });
        }
    } catch (error) {
        console.error("Erro ao buscar GIFs:", error);
    }
}

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

// 6. Eventos de Clique e Teclado
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

// 7. Lógica do Modal e Pesquisa de GIF
if (gifBtn && gifModal) {
    gifBtn.onclick = () => {
        const abrindo = gifModal.style.display === 'none';
        gifModal.style.display = abrindo ? 'block' : 'none';
        if (abrindo) buscarGifs(); // Carrega os "em alta" ao abrir
    };
}

if (gifSearchInput) {
    gifSearchInput.oninput = (e) => {
        const termo = e.target.value;
        if (termo.length > 2) {
            buscarGifs(termo); // Busca conforme você digita
        }
    };
}

// 8. CARREGAR MENSAGENS NO CHAT
database.ref('messages').on('child_added', (snapshot) => {
    try {
        const data
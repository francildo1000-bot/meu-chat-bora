// 1. Configuração do Firebase (Mantenha seus dados)
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

// 2. Variáveis de Elementos (Garante que o JS ache o HTML)
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');
const gifSearchInput = document.getElementById('gif-search-input');

let usuarioAtual = prompt("Qual é o seu nome?") || "Anônimo";

// 3. Função de Enviar (Texto ou Link de GIF)
function enviarMensagem(conteudo) {
    if (!conteudo) return;
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
    
    database.ref('messages').push({
        username: usuarioAtual,
        text: conteudo,
        time: hora
    });
}

// 4. Lógica de Busca de GIFs (O QUE ESTAVA FALTANDO)
async function buscarGifs(termo = 'trending') {
    if (!gifList) return;
    const apiKey = 'dc6zaTOxFJmzC'; // Chave pública do Giphy
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${termo}&limit=12&rating=g`;
    
    try {
        const response = await fetch(url);
        const { data } = await response.json();
        
        gifList.innerHTML = ""; // Limpa a lista antes de mostrar novos
        data.forEach(gif => {
            const img = document.createElement('img');
            img.src = gif.images.fixed_height_small.url;
            img.style.width = "100%";
            img.style.cursor = "pointer";
            img.style.borderRadius = "5px";
            
            // Ao clicar no GIF, envia o link original
            img.onclick = () => {
                enviarMensagem(gif.images.original.url);
                gifModal.style.display = 'none';
            };
            gifList.appendChild(img);
        });
    } catch (e) { console.error("Erro Giphy:", e); }
}

// 5. Eventos dos Botões
if (gifBtn) {
    gifBtn.onclick = () => {
        const visivel = gifModal.style.display === 'block';
        gifModal.style.display = visivel ? 'none' : 'block';
        if (!visivel) buscarGifs(); // Carrega os iniciais ao abrir
    };
}

if (gifSearchInput) {
    gifSearchInput.oninput = (e) => {
        if (e.target.value.length > 2) {
            buscarGifs(e.target.value); // Busca enquanto você digita
        }
    };
}

if (sendBtn) {
    sendBtn.onclick = () => {
        if (messageInput.value.trim() !== "") {
            enviarMensagem(messageInput.value);
            messageInput.value = "";
        }
    };
}

// 6. Mostrar mensagens na tela (Balões verdes)
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!chatWindow) return;

    const msgDiv = document.createElement('div');
    const souEu = data.username === usuarioAtual;
    msgDiv.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

    const ehGif = data.text.includes('giphy.com') || data.text.match(/\.(gif|jpg|png)$/);
    const conteudo = ehGif ? `<img src="${data.text}" style="max-width:200px; border-radius:10px;">` : `<p>${data.text}</p>`;

    msgDiv.innerHTML = `<span class="user-name">${data.username}</span>${conteudo}<span class="time-msg">${data.time}</span>`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});
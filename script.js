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
const gifSearchInput = document.getElementById('gif-search-input');

let usuarioAtual = prompt("Qual é o seu nome?") || "Visitante";

// 3. Função de Enviar (Texto ou link de GIF)
function enviarMensagem(conteudo) {
    if (!conteudo) return;
    const agora = new Date();
    const hora = agora.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    database.ref('messages').push({
        username: usuarioAtual,
        text: conteudo,
        time: hora // Garante que não apareça "undefined"
    });
}

// 4. Busca de GIFs (Ajustada para funcionar no seu layout)
async function buscarGifs(termo = '') {
    const lista = document.getElementById('gif-list');
    if (!lista) return;

    // COLOQUE SUA CHAVE NOVA AQUI DENTRO DAS ASPAS
    const apiKey = 'SUA_NOVA_CHAVE_AQUI'; 
    const endpoint = termo ? 'search' : 'trending';
    const url = `https://api.giphy.com/v1/gifs/${endpoint}?api_key=${apiKey}&q=${termo}&limit=12&rating=g`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na API'); // Pega o erro 403 se a chave estiver ruim
        
        const { data } = await response.json();
        lista.innerHTML = ""; 

        data.forEach(gif => {
            const img = document.createElement('img');
            img.src = gif.images.fixed_height_small.url;
            img.onclick = () => {
                enviarMensagem(gif.images.original.url);
                document.getElementById('gif-modal').style.display = 'none';
            };
            lista.appendChild(img);
        });
    } catch (e) { 
        console.error("Erro na busca:", e);
        lista.innerHTML = "<p style='color:red; font-size:12px;'>Erro ao carregar. Verifique sua chave API.</p>";
    }
}

// 5. Eventos de Interface
if (gifBtn) {
    gifBtn.onclick = () => {
        const visivel = gifModal.style.display === 'block';
        gifModal.style.display = visivel ? 'none' : 'block';
        if (!visivel) buscarGifs(); // Carrega os trending ao abrir
    };
}

if (gifSearchInput) {
    gifSearchInput.oninput = (e) => {
        const valor = e.target.value.trim();
        if (valor.length > 2) {
            buscarGifs(valor); // Dispara a busca enquanto digita
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

// 6. Exibir Mensagens em Tempo Real
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!chatWindow) return;

    const msgDiv = document.createElement('div');
    const souEu = data.username === usuarioAtual;
    msgDiv.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

    const ehGif = data.text.includes('giphy.com');
    const conteudo = ehGif ? `<img src="${data.text}" style="max-width:200px; border-radius:10px;">` : `<p>${data.text}</p>`;

    msgDiv.innerHTML = `
        <span class="user-name">${data.username}</span>
        ${conteudo}
        <span class="time-msg">${data.time || 'Agora'}</span>
    `;
    
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});
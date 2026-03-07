// 1. Configuração do Firebase (Dados extraídos do seu projeto)
const firebaseConfig = {
    apiKey: "AIzaSyAT3yJEb0VYpz-KEydMJ5Ug4rvPnTbPcf0",
    authDomain: "meuchatbora.firebaseapp.com",
    databaseURL: "https://meuchatbora-default-rtdb.firebaseio.com",
    projectId: "meuchatbora",
    storageBucket: "meuchatbora.firebasestorage.app",
    messagingSenderId: "203988694746",
    appId: "1:203988694746:web:002ace8fb51ffa203417e3"
};

// Inicializa o Firebase apenas se não houver um app rodando
if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const database = firebase.database();

// 2. Seleção de Elementos do HTML
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');
const gifSearchInput = document.getElementById('gif-search-input');

// 3. Identificação do Usuário
let usuarioAtual = prompt("Qual é o seu nome?") || "Visitante";

// 4. Função Principal de Envio
function enviarMensagem(conteudo) {
    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    database.ref('messages').push({
        username: usuarioAtual,
        text: conteudo,
        time: horaFormatada
    });
}

// Evento do botão de enviar texto
if (sendBtn) {
    sendBtn.onclick = () => {
        if (messageInput.value.trim() !== "") {
            enviarMensagem(messageInput.value);
            messageInput.value = "";
        }
    };
}

// 5. Lógica de GIFs (API Giphy)
async function buscarGifs(termo = 'trending') {
    const lista = document.getElementById('gif-list');
    if (!lista) return;

    const apiKey = 'dc6zaTOxFJmzC';
    const endpoint = termo ? 'search' : 'trending';
    const url = `https://api.giphy.com/v1/gifs/${endpoint}?api_key=${apiKey}&q=${termo}&limit=12&rating=g`;

    try {
        const response = await fetch(url);
        const { data } = await response.json();
        
        lista.innerHTML = ""; // ISSO AQUI LIMPA A BUSCA ANTERIOR
        
        data.forEach(gif => {
            const img = document.createElement('img');
            img.src = gif.images.fixed_height_small.url;
            img.onclick = () => {
                enviarMensagem(gif.images.original.url);
                document.getElementById('gif-modal').style.display = 'none';
            };
            lista.appendChild(img);
        });
    } catch (e) { console.error(e); }
}

// Abrir/Fechar modal de GIFs
if (gifBtn) {
    gifBtn.onclick = () => {
        const estaAberto = gifModal.style.display === 'block';
        gifModal.style.display = estaAberto ? 'none' : 'block';
        if (!estaAberto) buscarGifs();
    };
}

// Pesquisar GIFs ao digitar
if (gifSearchInput) {
    gifSearchInput.oninput = (e) => {
        if (e.target.value.length > 2) buscarGifs(e.target.value);
    };
}

// 6. Escutar o Banco de Dados e Mostrar na Tela
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!chatWindow) return;

    const msgDiv = document.createElement('div');
    const souEu = data.username === usuarioAtual;
    msgDiv.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

    // Verifica se a mensagem é um link de imagem/GIF
    const ehImagem = data.text.includes('http') && (data.text.includes('giphy') || data.text.match(/\.(gif|jpg|png)$/));
    const conteudoHTML = ehImagem ? 
        `<img src="${data.text}" style="max-width:100%; border-radius:8px;">` : 
        `<p>${data.text}</p>`;

    msgDiv.innerHTML = `
        <span class="user-name">${data.username}</span>
        ${conteudoHTML}
        <span class="time-msg">${data.time || 'Agora'}</span>
    `;
    
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Rola para a última mensagem
});
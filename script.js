// 1. Configurações do Firebase
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

// 2. Elementos da Interface
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const micBtn = document.getElementById('mic-btn');
const imgBtn = document.getElementById('img-btn');
const imgInput = document.getElementById('img-input');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');

// 3. Controle de Usuário e ADMIN
const ADMIN_NAME = "Admin-Hells~"; 
let usuario = prompt("Como quer ser chamado?") || "Visitante";
const eAdmin = (usuario === ADMIN_NAME);

// 4. Função Global para Apagar
window.apagarMensagem = (id) => {
    if (confirm("Deseja apagar esta mensagem permanentemente?")) {
        database.ref('messages/' + id).remove();
    }
};

database.ref('messages').on('child_removed', snapshot => {
    const msgDiv = document.getElementById(snapshot.key);
    if (msgDiv) msgDiv.remove();
});

// 5. Função para Enviar
function enviar(conteudo) {
    if (!conteudo) return;
    database.ref('messages').push({
        user: usuario,
        msg: conteudo,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
}

// 6. Lógica de Fotos e Áudio
imgBtn.onclick = () => imgInput.click();
imgInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => enviar(reader.result);
    }
};

let recorder;
let chunks = [];
micBtn.onclick = async () => {
    try {
        // Verifica se o navegador suporta a mídia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Seu celular bloqueou o acesso ao microfone no APK.");
            return;
        }

        if (!recorder || recorder.state === "inactive") {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recorder = new MediaRecorder(stream);
            chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/mpeg' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => enviar(reader.result);
            };
            recorder.start();
            micBtn.innerText = "🛑";
        } else {
            recorder.stop();
            micBtn.innerText = "🎤";
        }
    } catch (err) {
        // Isso vai nos dizer exatamente por que o Android recusou
        alert("Erro técnico: " + err.name + " - " + err.message);
    }
};
// 7. Exibir Mensagens com Trava de Segurança (AJUSTADO)
database.ref('messages').on('child_added', snapshot => {
    const data = snapshot.val();
    const id = snapshot.key;

    // TRAVA DE SEGURANÇA: Evita erro de 'undefined' se a msg for nula
    if (!data || !data.msg) return;

    const div = document.createElement('div');
    const souEu = data.user === usuario;
    
    div.id = id; 
    div.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

    const podeApagar = souEu || eAdmin;
    const btnApagar = podeApagar ? `<button onclick="apagarMensagem('${id}')" style="background:none; border:none; color:red; cursor:pointer; float:right; font-size:14px;">🗑️</button>` : "";

    let conteudoHtml;
    // Verificação segura do conteúdo da mensagem
    if (data.msg.startsWith('data:audio')) {
        conteudoHtml = `<audio controls src="${data.msg}" style="width:200px; height:35px;"></audio>`;
    } else if (data.msg.startsWith('data:image')) {
        conteudoHtml = `<img src="${data.msg}" style="width:100%; max-width:250px; border-radius:10px; cursor:pointer;" onclick="window.open(this.src)">`;
    } else {
        conteudoHtml = `<p style="margin:0">${data.msg}</p>`;
    }

    div.innerHTML = `
        <div style="margin-bottom:5px;">
            <small><b>${data.user}</b></small> 
            ${btnApagar}
        </div>
        ${conteudoHtml}
        <div style="text-align:right; font-size:10px; margin-top:5px; opacity:0.7;">${data.time || ''}</div>
    `;
    
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// 8. Botões Extras
sendBtn.onclick = () => { if(messageInput.value.trim()) { enviar(messageInput.value); messageInput.value = ""; } };
gifBtn.onclick = () => { gifModal.style.display = gifModal.style.display === 'none' ? 'block' : 'none'; };
// 9. Lógica de GIFs (CORRIGIDO)
const gifSearch = document.getElementById('gif-search');
const gifList = document.getElementById('gif-list');
const GIPHY_KEY = "dc6zaTOxFJmzC"; // API Key pública para teste

// Função para buscar no Giphy
gifSearch.oninput = async () => {
    const termo = gifSearch.value;
    if (termo.length < 3) return; // Só busca se digitar mais de 2 letras

    try {
        const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${termo}&limit=10&rating=g`);
        const json = await response.json();
        
        gifList.innerHTML = ""; // Limpa a lista antes de mostrar novos

        json.data.forEach(gif => {
            const img = document.createElement('img');
            img.src = gif.images.fixed_height_small.url;
            img.style.width = "45%";
            img.style.margin = "2%";
            img.style.cursor = "pointer";
            img.style.borderRadius = "8px";
            
            // Ao clicar no GIF, envia como imagem
            img.onclick = () => {
                enviar(gif.images.fixed_height.url);
                gifModal.style.display = 'none'; // Fecha o modal
                gifSearch.value = ""; // Limpa a busca
            };
            gifList.appendChild(img);
        });
    } catch (erro) {
        console.error("Erro no Giphy:", erro);
    }
};
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

// 2. Variáveis Globais (Definidas mas preenchidas depois)
let messageInput, sendBtn, chatWindow, micBtn, imgBtn, imgInput, gifBtn, gifModal, displayName, userInfo, countNumber;
const ADMIN_NAME = "Admin-Hells~"; 
let usuario = localStorage.getItem('dz_username') || "Visitante";

// 3. Inicialização Segura
document.addEventListener('DOMContentLoaded', () => {
    // Vincular elementos agora que o HTML existe
    messageInput = document.getElementById('message-input');
    sendBtn = document.getElementById('send-btn');
    chatWindow = document.getElementById('chat-window');
    micBtn = document.getElementById('mic-btn');
    imgBtn = document.getElementById('img-btn');
    imgInput = document.getElementById('img-input');
    gifBtn = document.getElementById('gif-btn');
    gifModal = document.getElementById('gif-modal');
    displayName = document.getElementById('display-name');
    userInfo = document.getElementById('user-info');
    countNumber = document.getElementById('count-number');

    if (!localStorage.getItem('dz_username')) {
        const novo = prompt("Bem-vindo ao Distrito Zero! Qual o seu vulgo?");
        if(novo) {
            usuario = novo;
            localStorage.setItem('dz_username', usuario);
        }
    }

    if (displayName) displayName.innerText = usuario;
    
    if (userInfo) {
        userInfo.onclick = () => {
            const novoNome = prompt("Qual será seu novo vulgo?", usuario);
            if (novoNome && novoNome.trim() !== "") {
                localStorage.setItem('dz_username', novoNome);
                location.reload(); 
            }
        };
    }

    // --- LÓGICA DE PRESENÇA ---
    const myPresenceRef = database.ref('presence/' + usuario);
    const totalPresenceRef = database.ref('presence');

    database.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val() === true) {
            myPresenceRef.onDisconnect().remove();
            myPresenceRef.set(true);
        }
    });

    totalPresenceRef.on('value', (snapshot) => {
        const total = snapshot.numChildren() || 0;
        if (countNumber) countNumber.innerText = total;
    });

    // Iniciar escuta de mensagens
    iniciarMensagens();
});

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
function configurarBotoes() {
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
            if (!navigator.mediaDevices) {
                alert("Navegador não suporta áudio."); return;
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
        } catch (err) { alert("Erro microfone: " + err.message); }
    };

    sendBtn.onclick = () => { if(messageInput.value.trim()) { enviar(messageInput.value); messageInput.value = ""; } };
    gifBtn.onclick = () => { gifModal.style.display = gifModal.style.display === 'none' ? 'block' : 'none'; };
}

// 7. Exibir Mensagens
function iniciarMensagens() {
    configurarBotoes();
    database.ref('messages').on('child_added', snapshot => {
        const data = snapshot.val();
        const id = snapshot.key;
        if (!data || !data.msg) return;

        const div = document.createElement('div');
        const souEu = data.user === usuario;
        div.id = id; 
        div.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

        const podeApagar = souEu || eAdmin;
        const btnApagar = podeApagar ? `<button onclick="apagarMensagem('${id}')" style="background:none; border:none; color:red; cursor:pointer; float:right; font-size:14px;">🗑️</button>` : "";

        let conteudoHtml;
        if (data.msg.startsWith('data:audio')) {
            conteudoHtml = `<audio controls src="${data.msg}" style="width:200px; height:35px;"></audio>`;
        } else if (data.msg.startsWith('data:image') || data.msg.includes('giphy.com')) {
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
}

// 9. Lógica de GIFs
const GIPHY_KEY = "dc6zaTOxFJmzC"; 
document.addEventListener('DOMContentLoaded', () => {
    const gifSearch = document.getElementById('gif-search');
    const gifList = document.getElementById('gif-list');
    if(!gifSearch) return;
    gifSearch.oninput = async () => {
        const termo = gifSearch.value;
        if (termo.length < 3) return; 
        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${termo}&limit=10&rating=g`);
            const json = await response.json();
            gifList.innerHTML = ""; 
            json.data.forEach(gif => {
                const img = document.createElement('img');
                img.src = gif.images.fixed_height_small.url;
                img.style.width = "45%"; img.style.margin = "2%"; img.style.cursor = "pointer"; img.style.borderRadius = "8px";
                img.onclick = () => {
                    enviar(gif.images.fixed_height.url);
                    gifModal.style.display = 'none'; 
                    gifSearch.value = ""; 
                };
                gifList.appendChild(img);
            });
        } catch (erro) { console.error(erro); }
    };
});
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

// 2. Variáveis Globais
let messageInput, sendBtn, chatWindow, micBtn, imgBtn, imgInput, gifBtn, gifModal, displayName, userInfo, countNumber;
const ADMIN_NAME = "Admin-Hells~"; 
let usuario = localStorage.getItem('dz_username') || "Visitante";

// 3. Inicialização Segura
document.addEventListener('DOMContentLoaded', () => {
    // Vincular elementos do HTML
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

    // Boas-vindas para novos usuários
    if (!localStorage.getItem('dz_username')) {
        const novo = prompt("Qual o seu vulgo no Distrito Zero?");
        if(novo && novo.trim() !== "") {
            usuario = novo.trim();
            localStorage.setItem('dz_username', usuario);
        }
    }

    if (displayName) displayName.innerText = usuario;
    
    // Sistema de troca de vulgo
    if (userInfo) {
        userInfo.onclick = () => {
            const novoNome = prompt("Novo vulgo:", usuario);
            if (novoNome && novoNome.trim() !== "") {
                localStorage.setItem('dz_username', novoNome.trim());
                location.reload(); 
            }
        };
    }

    // --- LÓGICA DE PRESENÇA (ONLINE) ---
    const sanitizado = usuario.replace(/[.#$/[\]]/g, '_'); 
    const myPresenceRef = database.ref('presence/' + sanitizado);
    const totalPresenceRef = database.ref('presence');

    database.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val() === true) {
            myPresenceRef.onDisconnect().remove();
            myPresenceRef.set(true);
        }
    });

    totalPresenceRef.on('value', (snapshot) => {
        const total = snapshot.numChildren() || 0;
        if (countNumber) {
            countNumber.innerText = total;
            // Força a exibição caso o CSS esteja ocultando
            countNumber.parentElement.style.display = 'flex';
        }
    });

    iniciarApp();
});

// 4. Funções de Comunicação
function enviar(conteudo) {
    if (!conteudo) return;
    database.ref('messages').push({
        user: usuario,
        msg: conteudo,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

window.apagarMensagem = (id) => {
    if (confirm("Apagar esta mensagem permanentemente?")) {
        database.ref('messages/' + id).remove();
    }
};

function iniciarApp() {
    // Escutas do Firebase para deletar e adicionar mensagens
    database.ref('messages').on('child_removed', s => {
        const el = document.getElementById(s.key); 
        if(el) el.remove();
    });

    database.ref('messages').limitToLast(50).on('child_added', snapshot => {
        const data = snapshot.val();
        const id = snapshot.key;
        if (!data || !data.msg) return;

        const div = document.createElement('div');
        const souEu = data.user === usuario;
        div.id = id; 
        div.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

        const podeApagar = souEu || (usuario === ADMIN_NAME);
        const btnApagar = podeApagar ? `<button onclick="apagarMensagem('${id}')" class="btn-apagar" style="color:#ff4d4d; float:right; background:none; border:none; cursor:pointer;">🗑️</button>` : "";

        let htmlMsg;
        if (data.msg.startsWith('data:audio')) {
            htmlMsg = `<audio controls src="${data.msg}" style="width:100%; max-width:200px; height:35px;"></audio>`;
        } else if (data.msg.startsWith('data:image') || data.msg.includes('giphy.com')) {
            htmlMsg = `<img src="${data.msg}" style="width:100%; border-radius:10px; margin-top:5px; cursor:pointer;" onclick="window.open(this.src)">`;
        } else {
            htmlMsg = `<p style="margin:5px 0 0 0; line-height:1.4;">${data.msg}</p>`;
        }

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <small><b>${data.user}</b></small>
                ${btnApagar}
            </div>
            ${htmlMsg}
            <div style="text-align:right; font-size:10px; opacity:0.6; margin-top:5px;">${data.time || ''}</div>
        `;

        chatWindow.appendChild(div);
        chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
    });

    // Eventos de Clique e Teclado
    sendBtn.onclick = () => { 
        if(messageInput.value.trim()){ 
            enviar(messageInput.value); 
            messageInput.value=""; 
        } 
    };

    messageInput.onkeypress = (e) => {
        if(e.key === 'Enter' && messageInput.value.trim()){
            enviar(messageInput.value);
            messageInput.value = "";
        }
    };

    imgBtn.onclick = () => imgInput.click();
    imgInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => enviar(reader.result);
        }
    };

    // Lógica do Microfone (Gravador)
    let recorder, chunks = [];
    micBtn.onclick = async () => {
        try {
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
                micBtn.style.color = "red";
            } else { 
                recorder.stop(); 
                micBtn.innerText = "🎤"; 
                micBtn.style.color = "";
            }
        } catch (e) { alert("Permissão de microfone negada ou erro de hardware."); }
    };
    
    configurarGifs();
}

function configurarGifs() {
    const GIPHY_KEY = "dc6zaTOxFJmzC"; 
    const gifSearch = document.getElementById('gif-search');
    gifBtn.onclick = () => {
        gifModal.style.display = gifModal.style.display === 'none' ? 'block' : 'none';
        if(gifModal.style.display === 'block') gifSearch.focus();
    };
    
    gifSearch.oninput = async () => {
        if (gifSearch.value.length < 3) return;
        try {
            const resp = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${gifSearch.value}&limit=12&rating=g`);
            const json = await resp.json();
            const list = document.getElementById('gif-list');
            list.innerHTML = "";
            json.data.forEach(gif => {
                const img = document.createElement('img');
                img.src = gif.images.fixed_height_small.url;
                img.style.cssText = "width:46%; margin:2%; cursor:pointer; border-radius:8px;";
                img.onclick = () => { 
                    enviar(gif.images.fixed_height.url); 
                    gifModal.style.display='none'; 
                    gifSearch.value = "";
                };
                list.appendChild(img);
            });
        } catch (err) { console.error("Erro Giphy:", err); }
    };
}
// 1. Configurações do Firebase (Suas chaves oficiais)
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

// 4. Função Global para Apagar (Individual ou Admin)
window.apagarMensagem = (id) => {
    if (confirm("Deseja apagar esta mensagem permanentemente?")) {
        database.ref('messages/' + id).remove();
    }
};

// Remove da tela de todos quando o Firebase deletar
database.ref('messages').on('child_removed', snapshot => {
    const msgDiv = document.getElementById(snapshot.key);
    if (msgDiv) msgDiv.remove();
});

// 5. Função para Enviar ao Banco
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
};

// 7. Exibir Mensagens com Lixeira Individual
database.ref('messages').on('child_added', snapshot => {
    const data = snapshot.val();
    const id = snapshot.key;
    const div = document.createElement('div');
    const souEu = data.user === usuario;
    
    div.id = id; 
    div.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

    // REGRA: Lixeira aparece se (EU mandei) OU (EU sou Admin)
    const podeApagar = souEu || eAdmin;
    const btnApagar = podeApagar ? `<button onclick="apagarMensagem('${id}')" style="background:none; border:none; color:red; cursor:pointer; float:right; font-size:14px;">🗑️</button>` : "";

    let conteudoHtml;
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
        <div style="text-align:right; font-size:10px; margin-top:5px; opacity:0.7;">${data.time}</div>
    `;
    
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// 8. Botões Extras
sendBtn.onclick = () => { enviar(messageInput.value); messageInput.value = ""; };
gifBtn.onclick = () => { gifModal.style.display = gifModal.style.display === 'none' ? 'block' : 'none'; };
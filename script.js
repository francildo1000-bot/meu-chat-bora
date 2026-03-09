// 1. Configurações do seu Firebase
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

// 2. Captura de Elementos (SEM DUPLICATAS)
const imgBtn = document.getElementById('img-btn');
const imgInput = document.getElementById('img-input');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const micBtn = document.getElementById('mic-btn');
const gifBtn = document.getElementById('gif-btn');
const gifModal = document.getElementById('gif-modal');
const gifList = document.getElementById('gif-list');
const gifSearch = document.getElementById('gif-search');

let usuario = prompt("Como quer ser chamado?") || "Visitante";

// 3. Função para Enviar ao Firebase
function enviarMensagem(conteudo) {
    if (!conteudo) return;
    database.ref('messages').push({
        user: usuario,
        msg: conteudo,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
}

// 4. Lógica do Áudio
let recorder;
let chunks = [];

micBtn.onclick = async () => {
    if (!recorder || recorder.state === "inactive") {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recorder = new MediaRecorder(stream);
            chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/mpeg' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => enviarMensagem(reader.result);
            };
            recorder.start();
            micBtn.innerText = "🛑";
        } catch (err) { alert("Permita o acesso ao microfone!"); }
    } else {
        recorder.stop();
        micBtn.innerText = "🎤";
    }
};

// 5. Exibir Mensagens em Tempo Real
database.ref('messages').on('child_added', snapshot => {
    const data = snapshot.val();
    const div = document.createElement('div');
    const souEu = data.user === usuario;
    div.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

    let conteudoHtml;
    if (data.msg.startsWith('data:audio')) {
        conteudoHtml = `<audio controls src="${data.msg}" style="width:200px; height:35px;"></audio>`;
    } 
    // NOVA VERIFICAÇÃO PARA FOTOS:
    else if (data.msg.startsWith('data:image')) {
        conteudoHtml = `<img src="${data.msg}" style="width:100%; max-width:250px; border-radius:10px; cursor:pointer;" onclick="window.open(this.src)">`;
    } 
    else if (data.msg.includes('giphy.com')) {
        conteudoHtml = `<img src="${data.msg}" style="width:100%; border-radius:10px;">`;
    } else {
        conteudoHtml = `<p style="margin:0">${data.msg}</p>`;
    }

    div.innerHTML = `<small><b>${data.user}</b></small><br>${conteudoHtml}`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// 6. Botões e GIFs
sendBtn.onclick = () => { enviarMensagem(messageInput.value); messageInput.value = ""; };
gifBtn.onclick = () => { gifModal.style.display = gifModal.style.display === 'none' ? 'block' : 'none'; };
// 7. Quando clicar no ícone 🖼️, abre a escolha de arquivos
imgBtn.onclick = () => imgInput.click();

// 8. Quando escolher a foto, ela é lida e enviada
imgInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            enviarMensagem(reader.result); // Envia a imagem como texto para o Firebase
        };
    }
};
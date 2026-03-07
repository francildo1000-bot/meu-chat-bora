// 6. Lógica do Menu de GIFs (Protegida contra erros)
if (gifBtn && gifModal && gifList) {
    gifBtn.onclick = () => {
        // Abre ou fecha o modal
        gifModal.style.display = gifModal.style.display === 'none' ? 'block' : 'none';
        if (gifModal.style.display === 'block') carregarGifs();
    };
}

function carregarGifs() {
    gifList.innerHTML = ""; // Limpa a lista antes de carregar
    meusGifs.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.style.width = "100%";
        img.style.cursor = "pointer";
        img.style.borderRadius = "5px";
        img.onclick = () => {
            enviarParaBanco(url);
            gifModal.style.display = 'none'; // Fecha ao clicar
        };
        gifList.appendChild(img);
    });
}

// 7. Eventos de Clique e Teclado
sendBtn.onclick = sendMessage;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

// 8. Recebimento de Mensagens (O que faz elas aparecerem na tela)
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const id = snapshot.key;
    const souEu = data.username === usuarioAtual;
    
    // Tocar som se a mensagem for de outra pessoa
    if (!souEu && som) som.play().catch(() => {});

    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.classList.add('message', souEu ? 'minha-msg' : 'outra-msg');

    // Detecta se o texto é um link de imagem ou GIF
    const textoMsg = data.text.toLowerCase();
    const ehImagem = textoMsg.includes('.jpg') || 
                     textoMsg.includes('.jpeg') || 
                     textoMsg.includes('.gif') || 
                     textoMsg.includes('.png') || 
                     textoMsg.includes('.webp');

    const conteudo = ehImagem ? 
        `<img src="${data.text}" style="max-width:180px; border-radius:8px; display:block; margin-top:5px;" onerror="this.outerHTML='<p class=text-msg>${data.text}</p>'">` : 
        `<p class="text-msg">${data.text}</p>`;

    // Botão de apagar para o autor ou Admin
    const btnApagar = (souEu || SOU_ADMIN) ? `<span class="delete-btn" onclick="removerMensagem('${id}')">🗑️</span>` : "";

    msgDiv.innerHTML = `
        <span class="user-name">${data.username} ${btnApagar}</span>
        ${conteudo}
        <span class="time-msg">${data.time || '--:--'}</span>
    `;

    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// 9. Sistema de Exclusão
window.removerMensagem = (id) => { 
    if(confirm("Deseja apagar esta mensagem?")) database.ref('messages/'+id).remove(); 
};

database.ref('messages').on('child_removed', (snapshot) => { 
    const elemento = document.getElementById(snapshot.key);
    if (elemento) elemento.remove(); 
});
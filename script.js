// ... (mantenha sua configuração do Firebase e seleção de elementos aqui)

const ADMIN_NAME = "Admin-Hells~"; // Defina o nome do Administrador aqui
let usuario = prompt("Como quer ser chamado?") || "Visitante";
const eAdmin = (usuario === ADMIN_NAME);

// 1. Função para Apagar Mensagem
window.apagarMensagem = (id) => {
    if (confirm("Deseja realmente apagar esta mensagem?")) {
        database.ref('messages/' + id).remove();
    }
};

// 2. Escutar remoção de mensagens (para sumir da tela na hora)
database.ref('messages').on('child_removed', snapshot => {
    const msgDiv = document.getElementById(snapshot.key);
    if (msgDiv) msgDiv.remove();
});

// 3. Exibir Mensagens (Atualizado com Botão Apagar)
database.ref('messages').on('child_added', snapshot => {
    const data = snapshot.val();
    const id = snapshot.key;
    const div = document.createElement('div');
    const souEu = data.user === usuario;
    
    div.id = id; // Define o ID da div como a chave do Firebase para facilitar a remoção
    div.className = `message ${souEu ? 'minha-msg' : 'outra-msg'}`;

    // Lógica do Botão Apagar: aparece se for MINHA mensagem OU se eu for ADMIN
    const podeApagar = souEu || eAdmin;
    const btnApagarHtml = podeApagar ? `<button class="btn-apagar" onclick="apagarMensagem('${id}')">🗑️</button>` : "";

    let conteudoHtml;
    if (data.msg.startsWith('data:audio')) {
        conteudoHtml = `<audio controls src="${data.msg}" style="width:200px; height:35px;"></audio>`;
    } else if (data.msg.includes('giphy.com')) {
        conteudoHtml = `<img src="${data.msg}" style="width:100%; border-radius:10px;">`;
    } else {
        conteudoHtml = `<p style="margin:0">${data.msg}</p>`;
    }

    div.innerHTML = `
        <small><b>${data.user}</b></small> 
        ${btnApagarHtml}
        <br>${conteudoHtml}
    `;
    
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});
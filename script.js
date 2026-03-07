function adicionarMensagemNaTela(usuario, texto, tipo) {
    const div = document.createElement('div');
    div.classList.add('message', tipo);
    
    // Pega a hora atual formatada
    const agora = new Date();
    const horario = agora.getHours().toString().padStart(2, '0') + ':' + 
                    agora.getMinutes().toString().padStart(2, '0');

    // Monta o visual: Nome em negrito, Texto e Horário pequeno
    div.innerHTML = `
        <div style="font-size: 11px; font-weight: bold; margin-bottom: 3px; color: #075E54;">
            ${usuario}
        </div>
        <div style="word-wrap: break-word;">
            ${texto}
        </div>
        <div style="font-size: 9px; text-align: right; margin-top: 4px; opacity: 0.6;">
            ${horario}
        </div>
    `;
    
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Rola para a última mensagem
}
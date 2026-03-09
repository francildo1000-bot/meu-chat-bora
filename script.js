// No início, declare as variáveis sem valor
let countNumber, toggleMenu, attachmentMenu;

window.addEventListener('load', () => {
    // Só agora pegamos os elementos do HTML
    countNumber = document.getElementById('count-number');
    toggleMenu = document.getElementById('toggle-menu');
    attachmentMenu = document.getElementById('attachment-menu');

    // Lógica da Bandeja
    toggleMenu.onclick = (e) => {
        e.stopPropagation();
        const display = attachmentMenu.style.display;
        attachmentMenu.style.display = display === 'flex' ? 'none' : 'flex';
    };

    // Fecha a bandeja se clicar fora
    document.addEventListener('click', () => {
        attachmentMenu.style.display = 'none';
    });

    // Inicia a Presença (Firebase)
    const totalPresenceRef = database.ref('presence');
    totalPresenceRef.on('value', (snapshot) => {
        const total = snapshot.numChildren() || 0;
        if (countNumber) countNumber.innerText = total;
    });
});
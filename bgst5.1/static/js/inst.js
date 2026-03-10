
function abrirModal(nome, cargo, descricao, urlFoto) {
    document.getElementById('modal-nome').innerText = nome;
    document.getElementById('modal-cargo').innerText = cargo;
    document.getElementById('modal-desc').innerText = descricao;
    document.getElementById('modal-foto').src = urlFoto;

    document.getElementById('modal-equipe').style.display = 'flex';
}


function fecharModal() {
    document.getElementById('modal-equipe').style.display = 'none';
}

window.onclick = function (event) {
    let modal = document.getElementById('modal-equipe');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
console.log("JS carregado");

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("formAuth");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;

        // Validação básica
        if (!email || !senha) {
            showBigStreetMessage("Preencha todos os campos!", "error");
            return;
        }

        try {
           const response = await fetch("/auth", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        acao: "login",
        email: email,
        senha: senha
    })
});

const resultado = await response.json();


            // Só entra se o backend confirmar
            if (response.ok && resultado.success) {
                showBigStreetMessage("Login autorizado!", "success");
                window.location.href = "/home";
            } else {
                showBigStreetMessage(resultado.message || "Credenciais inválidas!", "error");
            }

        } catch (error) {
            console.error("Erro:", error);
            showBigStreetMessage("Erro ao conectar com o servidor. Verifique se o Flask está rodando.", "error");
        }

    });

});
function showBigStreetMessage(text, type = "default") {
    let container = document.getElementById("message-container");
    
    // Se o container não existir no HTML, ele cria um agora
    if (!container) {
        container = document.createElement("div");
        container.id = "message-container";
        document.body.prepend(container);
    }

    const card = document.createElement("div");
    card.classList.add("bigstreet-card");

    // Define a cor baseada no tipo
    if (type === "success") card.classList.add("bigstreet-success");
    if (type === "error") card.classList.add("bigstreet-error");

    card.innerText = text;
    container.appendChild(card);

    // Remove a mensagem após 4 segundos com efeito de sumiço
    setTimeout(() => {
        card.style.opacity = "0";
        card.style.transform = "translateY(-10px)";
        setTimeout(() => card.remove(), 300);
    }, 4000);
}
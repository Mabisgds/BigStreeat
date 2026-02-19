console.log("JS carregado");

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("formAuth");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;

        // Validação básica
        if (!email || !senha) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/auth", {
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
                alert("Login autorizado!");
                window.location.href = "htmlhomepage.html";
            } else {
                alert(resultado.message || "Credenciais inválidas!");
            }

        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao conectar com o servidor. Verifique se o Flask está rodando.");
        }

    });

});

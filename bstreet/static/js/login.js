document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formAuth");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        if (email && senha) {
            window.location.href = "htmlhomepage.html";
        } else {
            alert("Preencha todos os campos!");
        }
    });
});

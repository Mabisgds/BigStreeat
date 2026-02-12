const isCadastro = window.location.href.includes("cadastro.html");

window.soNumeros = function (input, limite) {
    input.value = input.value.replace(/\D/g, '');
    if (input.value.length > limite) input.value = input.value.slice(0, limite);
}
const campoData = document.getElementById("dataNasc");
if (campoData) {
    campoData.setAttribute("max", new Date().toISOString().split("T")[0]);
}

function validarSenha(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(senha);
}

document.getElementById("formAuth").addEventListener("submit", async function (e) {
    e.preventDefault();

    const dados = {
        email: document.getElementById("email").value.trim(),
        senha: document.getElementById("senha").value,
        acao: isCadastro ? 'cadastrar' : 'login'
    };

    if (isCadastro && !validarSenha(dados.senha)) {
        alert(
            "A senha deve conter:\n\n" +
            "• No mínimo 8 caracteres\n" +
            "• 1 letra maiúscula\n" +
            "• 1 letra minúscula\n" +
            "• 1 número\n" +
            "• 1 caractere especial"
        );
        return;
    }

    if (isCadastro) {
        dados.nome = document.getElementById("nome").value.trim();
        dados.cpf = document.getElementById("cpf").value;
        dados.dataNasc = document.getElementById("dataNasc").value;
        dados.peso = document.getElementById("peso").value || null;
        dados.altura = document.getElementById("altura").value || null;
        dados.cep = document.getElementById("cep").value || null;
        dados.estado = document.getElementById("estado").value;
        dados.cidade = document.getElementById("cidade").value;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            throw new Error("Erro na rede ou servidor fora do ar");
        }

        const resultado = await response.json();

        if (resultado.success) {
            alert(isCadastro ? "Cadastro realizado com sucesso!" : "Login autorizado!");
            window.location.href = isCadastro ? "login.html" : "htmlhomepage.html";
        } else {
            alert("Atenção: " + resultado.message);
        }

    } catch (error) {
        console.error("Erro de conexão:", error);
        alert(
            "ERRO: O servidor Python (app.py) não respondeu.\n" +
            "Verifique se ele está rodando no terminal."
        );
    }
});

function openCreateModal() {
    if (!currentUser) {
        openModal("authModal");
        return;
    }
    openModal("createModal");
}

document.getElementById("createEventForm").addEventListener("submit", e => {
    e.preventDefault();

    const evt = {
        id: Date.now(),
        name: evtName.value,
        owner: currentUser.nick,
        city: evtCity.value,
        state: evtState.value,
        max: evtMax.value,
        participants: [],
        status: "aberto"
    };

    events.push(evt);
    closeModal("createModal");
    renderHome();
});


document.addEventListener('DOMContentLoaded', () => {
    let users = [{ id: "000000001", nick: "Admin", name: "Administrador", weight: "80", height: "1.80", email: "admin@gmail.com", pass: "Admin@123", reputation: { pos: 10, neg: 0, miss: 0 }, city: "São Paulo", state: "SP", neighborhood: "Centro", friends: [], avatar: null }];
    let currentUser = null;
    let events = [];
    let fakeUserDatabase = {};
    let privateChats = {};
    const fakeNames = ["Carlos S.", "Pedro H.", "Ana M.", "João V.", "Lucas D.", "Mariana T.", "Bruno K.", "Julia R.", "Gustavo P.", "Beatriz L."];

    function formatId(num) { return String(num).padStart(9, '0'); }
    function getFakeUser(name) {
        if (!fakeUserDatabase[name]) {
            const id = formatId(Math.floor(Math.random() * 900000) + 100000);
            fakeUserDatabase[name] = { id: id, nick: name, name: "Jogador Convidado", weight: Math.floor(Math.random() * 30 + 60), height: (Math.random() * 0.3 + 1.60).toFixed(2), reputation: { pos: Math.floor(Math.random() * 5), neg: 0, miss: 0 }, friends: [], avatar: null };
        } return fakeUserDatabase[name];
    }
    window.getUserOrFake = function (nick) { const real = users.find(u => u.nick === nick); return real || getFakeUser(nick); }

    function generateEvents() {
        const cities = [{ city: "São Paulo", state: "SP", hood: "Pinheiros" }, { city: "Rio de Janeiro", state: "RJ", hood: "Copacabana" }, { city: "Belo Horizonte", state: "MG", hood: "Savassi" }, { city: "São Paulo", state: "SP", hood: "Vila Madalena" }];
        const sports = ["Futebol", "Basquete", "Vôlei", "Tênis", "Corrida"];

        for (let i = 0; i < 20; i++) {
            const cityObj = cities[i % 4];
            const sport = sports[i % 5];
            const max = (sport === 'Futebol' || sport === 'Basquete' || sport === 'Vôlei') ? 10 : 4;
            const current = Math.floor(Math.random() * max);
            let parts = []; for (let j = 0; j < current; j++) parts.push(fakeNames[j % fakeNames.length]);
            const isPaid = i % 2 === 0;
            events.push({
                id: i + 1, name: `${sport} ${['Treino', 'Racha', 'Torneio'][i % 3]}`,
                sport, gender: ["Masculino", "Misto", "Feminino"][i % 3],
                date: `2024-12-${10 + (i % 20)}`, time: "18:00", city: cityObj.city, state: cityObj.state, neighborhood: cityObj.hood, reference: "Perto do Metrô", location: `Quadra ${i + 1}`,
                current, max, status: i % 4 === 0 ? 'acontecendo' : (current === max ? 'cheio' : 'aberto'),
                owner: i === 0 ? "Admin" : `bot${i}`, description: "Evento da comunidade.", rules: "Fair play.", participants: parts, hasTeams: (max > 4), chatMessages: [],
                type: isPaid ? 'paid' : 'public',
                price: isPaid ? '100.00' : null, endTime: isPaid ? '19:00' : null, hoursRented: isPaid ? 1 : null,
                pixKey: isPaid ? '12345678900' : null, pixName: isPaid ? 'Dono da Quadra' : null, pixBank: isPaid ? 'Nubank' : null,
                distance: sport === 'Corrida' ? 5 : null, startPoint: sport === 'Corrida' ? 'Praça A' : null, endPoint: sport === 'Corrida' ? 'Praça B' : null
            });
        }
    }
    generateEvents();

    const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('sidebarOverlay');
    window.toggleSidebar = function () { sidebar.classList.toggle('active'); overlay.classList.toggle('active'); }
    document.getElementById('menu-btn').addEventListener('click', toggleSidebar); overlay.addEventListener('click', toggleSidebar);
    window.navigate = function (to) {
        sidebar.classList.remove('active'); overlay.classList.remove('active');
        document.getElementById('home-view').style.display = to === 'home' ? 'block' : 'none';
        document.getElementById('search-view').style.display = to === 'search' ? 'block' : 'none';
        document.getElementById('filter-msg').style.display = 'none';
        if (to === 'home') renderHome(); else renderSearch();
        window.scrollTo(0, 0);
    }

    function updateHeaderUI() {
        const c = document.getElementById('authContainer');
        if (currentUser) {
            const avatarContent = currentUser.avatar ? `<img src="${currentUser.avatar}">` : currentUser.nick[0];
            c.innerHTML = `<div class="user-avatar" onclick="document.getElementById('userDropdown').classList.toggle('active')">${avatarContent}</div>
                <div class="dropdown-menu" id="userDropdown">
                    <div class="dropdown-item" onclick="openProfileModal()"><i class="fas fa-user"></i> Perfil</div>
                    <div class="dropdown-item" onclick="openFriendsModal()"><i class="fas fa-user-friends"></i> Meus Amigos</div>
                    <div class="dropdown-item" onclick="openSettingsModal()"><i class="fas fa-cog"></i> Configurações</div>
                    <div class="dropdown-item" onclick="filterEvents('myEvents')"><i class="fas fa-calendar-check"></i> Meus Eventos</div>
                    <div class="dropdown-item" onclick="filterEvents('createdEvents')"><i class="fas fa-plus-square"></i> Eventos Criados</div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" style="color:var(--danger)" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Sair</div>
                </div>`;
        } else c.innerHTML = `<button class="auth-btn" onclick="openAuthModal()">Login</button>`;
    }
    window.onclick = e => { if (!e.target.closest('.auth-container')) { const dd = document.getElementById('userDropdown'); if (dd) dd.classList.remove('active'); } if (e.target.classList.contains('modal')) closeModal(e.target.id); };

    function createCard(evt) {
        const isOwner = currentUser && evt.owner === currentUser.nick;
        let btn = ''; if (currentUser) {
            const isJoined = currentUser && evt.participants.includes(currentUser.nick);
            const isFull = evt.current >= evt.max;
            if (isOwner) btn = `<button class="action-btn btn-edit" onclick="openEditModal(${evt.id})">Editar</button>`;
            else if (isJoined) btn = `<button class="action-btn btn-leave" onclick="leaveEvent(${evt.id},event)">Sair</button>`;
            else if (evt.status === 'aberto' && !isFull) btn = `<button class="action-btn btn-join" onclick="joinEvent(${evt.id},event)">Registrar</button>`;
        }
        const typeLabel = evt.type === 'paid' ? `<span style="color:var(--warning); font-weight:bold; font-size:0.8rem; margin-left:5px;">🔴 Aluguel</span>` : '<span style="color:var(--success); font-weight:bold; font-size:0.8rem; margin-left:5px;">🟢 Pública</span>';
        const priceRow = evt.type === 'paid' ? `<div style="font-size:0.9rem; font-weight:bold; color:var(--text-main); margin-top:2px;">Valor: R$ ${evt.price}</div>` : '';

        return `<div class="event-card ${isOwner ? 'my-event' : ''}" onclick="if(event.target.tagName!=='BUTTON')openDetails(${evt.id})">
                <div class="card-header"><div><div class="event-title">${evt.name}</div><div class="event-sport">${evt.sport} • <small>${evt.city}</small></div></div><span class="status-badge status-${evt.status}">${evt.status}</span></div>
                <div class="event-info">
                    <div class="info-row"><i class="far fa-calendar"></i> ${formatDate(evt.date)}</div>
                    <div class="info-row"><i class="far fa-clock"></i> ${evt.time}</div>
                    <div class="info-row"><i class="fas fa-map-marker-alt"></i> ${evt.location}</div>
                    <div class="info-row" style="margin-top:5px; justify-content:space-between; border-top:1px solid var(--border); padding-top:5px; flex-wrap:wrap;">
                        <span>Líder: <span style="color:var(--success); font-weight:800;">${evt.owner}</span></span>
                        <div>${typeLabel} ${priceRow}</div>
                    </div>
                </div>
                <div class="card-footer"><span class="participants"><i class="fas fa-users"></i> ${evt.current}/${evt.max}</span>${btn}</div>
            </div>`;
    }

    function renderHome() {
        document.getElementById('my-events-section').style.display = (currentUser && events.some(e => e.participants.includes(currentUser.nick))) ? 'block' : 'none';
        if (currentUser && document.getElementById('my-events-section').style.display === 'block') {
            document.getElementById('carousel-my-events').innerHTML = events.filter(e => e.participants.includes(currentUser.nick)).map(createCard).join('');
        }
        if (currentUser) {
            document.getElementById('nearby-section').style.display = 'block';
            document.getElementById('user-location-display').innerText = `(${currentUser.city} - ${currentUser.state})`;
            const nearby = events.filter(e => e.city.toLowerCase() === currentUser.city.toLowerCase() && e.state === currentUser.state);
            document.getElementById('carousel-nearby').innerHTML = nearby.length ? nearby.map(createCard).join('') : '<p style="padding:10px; color:var(--text-muted)">Nenhum evento na sua cidade.</p>';
        } else document.getElementById('nearby-section').style.display = 'none';

        const renderCat = (id, filterFn, sportName) => { const list = events.filter(filterFn); let html = list.map(createCard).join(''); if (list.length > 5) html += `<div class="card-more" onclick="setSearchFilter('${sportName}')">Ver Mais <br><i class="fas fa-plus-circle" style="margin-top:10px;"></i></div>`; document.getElementById(id).innerHTML = html || '<p style="padding:10px; color:var(--text-muted)">Vazio</p>'; };
        renderCat('carousel-highlights', (e, i) => i < 5, '');
        renderCat('carousel-futebol', e => e.sport === 'Futebol', 'Futebol');
        renderCat('carousel-volei', e => e.sport === 'Vôlei', 'Vôlei');
        renderCat('carousel-basquete', e => e.sport === 'Basquete', 'Basquete');
        renderCat('carousel-others', e => !['Futebol', 'Vôlei', 'Basquete'].includes(e.sport), '');
    }
    window.setSearchFilter = function (s) { if (s) document.getElementById('filterSport').value = s; navigate('search'); }
    window.toggleFilterPrice = function () {
        const type = document.getElementById('filterType').value;
        document.getElementById('filterPriceContainer').style.display = type === 'paid' ? 'block' : 'none';
    }
    window.renderSearch = function () {
        const txt = document.getElementById('filterText').value.toLowerCase();
        const sp = document.getElementById('filterSport').value;
        const type = document.getElementById('filterType').value;
        const maxPrice = document.getElementById('filterMaxPrice').value;

        const res = events.filter(e => {
            const matchText = (e.name.toLowerCase().includes(txt) || e.city.toLowerCase().includes(txt));
            const matchSport = !sp || e.sport === sp;
            const matchType = !type || e.type === type;
            let matchPrice = true;
            if (type === 'paid' && maxPrice && e.price) {
                matchPrice = parseFloat(e.price) <= parseFloat(maxPrice);
            }
            return matchText && matchSport && matchType && matchPrice;
        });
        document.getElementById('search-results-container').innerHTML = res.map(createCard).join('');
    }
    window.filterEvents = function (type) { const msg = document.getElementById('filter-msg'); msg.style.display = 'block'; msg.innerText = type === 'myEvents' ? 'Exibindo: Eventos que participo' : 'Exibindo: Eventos que criei'; document.getElementById('userDropdown').classList.remove('active'); navigate('search'); const list = events.filter(e => type === 'myEvents' ? e.participants.includes(currentUser.nick) : e.owner === currentUser.nick); document.getElementById('search-results-container').innerHTML = list.map(createCard).join(''); }
    window.resetFilters = function () { document.getElementById('filterText').value = ''; renderSearch(); }

    let currentEventId = null;
    window.openDetails = function (id) { currentEventId = id; renderDetails(); openModal('detailsModal'); switchTab('info'); }
    function renderDetails() {
        const evt = events.find(e => e.id === currentEventId); if (!evt) return;
        document.getElementById('detTitle').innerText = evt.name;
        const isOwner = currentUser && evt.owner === currentUser.nick;

        const start = new Date(`${evt.date}T${evt.time}`);
        const now = new Date();
        const diffMin = (start - now) / 60000;
        const isClosed = diffMin <= 30;

        let playersHtml = evt.participants.map(p => {
            const isP_Owner = p === evt.owner;
            let manageBtns = ''; if (isOwner && p !== currentUser.nick) manageBtns = `<div class="manage-actions"><button class="icon-btn btn-pos" onclick="ratePlayer('${p}','pos')"><i class="fas fa-thumbs-up"></i></button><button class="icon-btn btn-neg" onclick="ratePlayer('${p}','neg')"><i class="fas fa-thumbs-down"></i></button><button class="icon-btn btn-warn" onclick="ratePlayer('${p}','miss')"><i class="fas fa-user-slash"></i></button><button class="icon-btn btn-kick" onclick="kickPlayer('${p}')"><i class="fas fa-ban"></i></button></div>`;
            return `<div class="player-row"><span class="player-name ${isP_Owner ? 'player-owner' : ''}" onclick="showUserProfile('${p}')">${p} ${isP_Owner ? '<i class="fas fa-crown"></i>' : ''}</span>${manageBtns}</div>`;
        }).join('');

        const typeInfo = evt.type === 'paid' ? `• <span style="color:var(--danger)">Aluguel (R$ ${evt.price} / ${evt.hoursRented}h)</span>` : '• <span style="color:var(--success)">Pública</span>';

        let runningHtml = '';
        if (evt.sport === 'Corrida') {
            runningHtml = `<div class="running-details"><span class="running-label">Distância:</span> <span class="running-val">${evt.distance} KM</span><br><span class="running-label">Início:</span> <span class="running-val">${evt.startPoint}</span><br><span class="running-label">Chegada:</span> <span class="running-val">${evt.endPoint}</span></div>`;
        }

        document.getElementById('detContent').innerHTML = `
                <div class="details-section"><span class="details-label">Descrição</span><p class="details-text">${evt.description}</p></div>
                ${runningHtml}
                <div class="details-section"><span class="details-label">Info</span><p class="details-text">${evt.sport} (${evt.gender}) • ${evt.city}/${evt.state} ${typeInfo}</p><p class="details-text">${evt.location} • ${formatDate(evt.date)} ${evt.time}</p><p class="details-text">Líder: <strong style="color:var(--success)">${evt.owner}</strong></p></div>
                <div class="details-section"><span class="details-label">Participantes (${evt.current}/${evt.max})</span>${playersHtml}</div>
            `;

        const paySec = document.getElementById('paymentSection');
        document.getElementById('paymentInfoBox').style.display = 'none';
        if (evt.type === 'paid') {
            paySec.style.display = 'block';
            document.getElementById('pixQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(evt.pixKey)}`;
            document.getElementById('pixKeyDisplay').innerText = evt.pixKey;
            document.getElementById('pixNameDisplay').innerText = evt.pixName;
            document.getElementById('pixBankDisplay').innerText = evt.pixBank;
            document.getElementById('rentalTimeDisplay').innerText = `${evt.time} até ${evt.endTime || '?'}`;

            const cost = parseFloat(evt.price);
            const count = evt.current || 1;

            document.getElementById('totalRentValue').innerText = `R$ ${evt.price}`;
            let rateioText = "";
            if (isClosed) {
                const finalPrice = (cost / count).toFixed(2);
                rateioText = `R$ ${finalPrice}`;
            } else {
                rateioText = "O valor por pessoa será o aluguel da quadra dividido pelo número de pessoa";
            }
            document.getElementById('perPersonValue').innerText = rateioText;
        } else {
            paySec.style.display = 'none';
        }

        const btn = document.getElementById('detActionBtn'); const btnInv = document.getElementById('detInviteBtn');
        const isJoined = currentUser && evt.participants.includes(currentUser.nick);
        btn.style.display = 'block'; btn.className = 'btn-block'; btnInv.style.display = currentUser ? 'block' : 'none';

        if (!currentUser) { btn.innerText = "Login"; btn.onclick = () => { closeModal('detailsModal'); openAuthModal() }; }
        else if (isOwner) { btn.innerText = "Editar"; btn.className += " btn-edit"; btn.onclick = () => { closeModal('detailsModal'); openEditModal(evt.id) }; }
        else if (isJoined) {
            if (isClosed && evt.type === 'paid') {
                btn.innerText = "Inscrições Encerradas (Não pode sair)"; btn.className = "btn-block"; btn.style.background = "#ccc"; btn.onclick = null;
            } else {
                btn.innerText = "Sair"; btn.className += " btn-leave"; btn.onclick = () => leaveEvent(evt.id);
            }
        } else if (evt.status === 'cheio') { btn.style.display = 'none'; }
        else if (isClosed && evt.type === 'paid') {
            btn.innerText = "Inscrições Encerradas"; btn.className = "btn-block"; btn.style.background = "#ccc"; btn.onclick = null;
        }
        else { btn.innerText = "Entrar"; btn.className += " btn-join"; btn.onclick = () => joinEvent(evt.id); }
        renderChat(evt);
    }
    window.togglePaymentInfo = function () { const box = document.getElementById('paymentInfoBox'); box.style.display = box.style.display === 'block' ? 'none' : 'block'; }

    function validateEventForm(name, sport, gender, date, time, loc, city, state, hood, maxVal, type, price, endTime, pixKey, pixName, pixBank) {
        if (!name || !sport || !gender || !date || !time || !loc || !city || !state || !hood || !maxVal) return "Preencha os campos básicos.";
        if (type === 'paid' && (!price || !endTime || !pixKey || !pixName || !pixBank)) return "Preencha os dados de pagamento do local.";
        const dt = new Date(`${date}T${time}`); const now = new Date();
        if (dt < now) return "Data passada"; if (dt < new Date(now.getTime() + 3600000)) return "Min 1h ant.";
        return null;
    }
    window.toggleEventFields = function (mode) {
        const sport = document.getElementById(mode === 'create' ? 'evtSport' : 'editSport').value;
        const type = document.getElementById(mode === 'create' ? 'evtType' : 'editType').value;
        document.getElementById(mode === 'create' ? 'createRunningFields' : 'editRunningFields').style.display = sport === 'Corrida' ? 'block' : 'none';
        document.getElementById(mode === 'create' ? 'createPaidFields' : 'editPaidFields').style.display = type === 'paid' ? 'block' : 'none';
    }
    window.togglePaidFields = function (mode) { window.toggleEventFields(mode); }
    window.toggleTeamInputs = function (mode) { document.getElementById(mode === 'create' ? 'teamInputs' : 'editTeamInputs').style.display = document.getElementById(mode === 'create' ? 'evtHasTeams' : 'editHasTeams').checked ? 'flex' : 'none'; }

    window.openCreateModal = function () { if (!currentUser) { openAuthModal(); return; } sidebar.classList.remove('active'); overlay.classList.remove('active'); openModal('createModal'); }
    document.getElementById('createEventForm').addEventListener('submit', e => {
        e.preventDefault();
        const sport = document.getElementById('evtSport').value;
        const type = document.getElementById('evtType').value;
        const name = document.getElementById('evtName').value;
        if (!name) return alert("Nome obrigatório");

        const hasTeams = document.getElementById('evtHasTeams').checked;
        const maxVal = parseInt(document.getElementById('evtMax').value);
        if (hasTeams) {
            const teams = parseInt(document.getElementById('evtTeamCount').value);
            const perTeam = parseInt(document.getElementById('evtPlayersPerTeam').value);
            if (teams * perTeam !== maxVal) {
                alert(`ERRO DE MATEMÁTICA:\n${teams} times x ${perTeam} jogadores = ${teams * perTeam}\nMas o máximo definido foi ${maxVal}.`);
                return;
            }
        }

        let price = null, endTime = null, hoursRented = null, pixKey = null, pixName = null, pixBank = null;
        if (type === 'paid') {
            price = document.getElementById('evtPrice').value;
            hoursRented = document.getElementById('evtRentHours').value;
            endTime = document.getElementById('evtEndTime').value;
            pixKey = document.getElementById('evtPixKey').value;
            pixName = document.getElementById('evtPixName').value;
            pixBank = document.getElementById('evtPixBank').value;
            if (!price || !hoursRented || !endTime || !pixKey || !pixName || !pixBank) return alert("Preencha todos os dados de pagamento.");
        }
        let dist = null, startP = null, endP = null;
        if (sport === 'Corrida') {
            dist = document.getElementById('evtDistance').value;
            startP = document.getElementById('evtStartPoint').value;
            endP = document.getElementById('evtEndPoint').value;
            if (!dist || !startP || !endP) return alert("Preencha dados da corrida.");
        }

        const leaderParticipates = document.getElementById('evtParticipate').checked;
        const participants = leaderParticipates ? [currentUser.nick] : [];
        const currentCount = leaderParticipates ? 1 : 0;

        events.unshift({
            id: Date.now(), name: name, sport: sport, gender: document.getElementById('evtGender').value,
            date: document.getElementById('evtDate').value, time: document.getElementById('evtTime').value,
            city: document.getElementById('evtCity').value, state: document.getElementById('evtState').value, neighborhood: document.getElementById('evtNeighborhood').value,
            location: document.getElementById('evtLocation').value, reference: document.getElementById('evtRef').value,
            current: currentCount, max: maxVal, status: 'aberto',
            owner: currentUser.nick, description: "Novo evento", participants: participants, chatMessages: [],
            type: type, price, endTime, hoursRented, pixKey, pixName, pixBank,
            distance: dist, startPoint: startP, endPoint: endP
        });
        closeModal('createModal'); navigate('home'); alert("Criado!");
    });

    window.openEditModal = function (id) {
        const evt = events.find(e => e.id === id); document.getElementById('editEvtId').value = id; document.getElementById('editName').value = evt.name;
        document.getElementById('editType').value = evt.type || 'public';
        document.getElementById('editSport').value = evt.sport;
        toggleEventFields('edit');
        if (evt.type === 'paid') { document.getElementById('editPrice').value = evt.price; document.getElementById('editRentHours').value = evt.hoursRented; document.getElementById('editEndTime').value = evt.endTime; document.getElementById('editPixKey').value = evt.pixKey; document.getElementById('editPixName').value = evt.pixName; document.getElementById('editPixBank').value = evt.pixBank; }
        if (evt.sport === 'Corrida') { document.getElementById('editDistance').value = evt.distance; document.getElementById('editStartPoint').value = evt.startPoint; document.getElementById('editEndPoint').value = evt.endPoint; }
        document.getElementById('editGender').value = evt.gender; document.getElementById('editDate').value = evt.date; document.getElementById('editTime').value = evt.time; document.getElementById('editCity').value = evt.city; document.getElementById('editState').value = evt.state; document.getElementById('editNeighborhood').value = evt.neighborhood; document.getElementById('editLocation').value = evt.location; document.getElementById('editRef').value = evt.reference || ""; document.getElementById('editMax').value = evt.max;
        openModal('editModal');
    }
    window.deleteEvent = function () {
        const id = parseInt(document.getElementById('editEvtId').value);
        const evt = events.find(e => e.id === id);
        const start = new Date(`${evt.date}T${evt.time}`);
        const diff = (start - new Date()) / 60000;
        if (evt.type === 'paid' && diff <= 30) return alert("ERRO: Não é possível excluir um evento pago após o fechamento das inscrições (30min antes).");
        if (!confirm("Excluir evento?")) return; events = events.filter(e => e.id !== id); closeModal('editModal'); navigate('home'); alert("Excluído");
    }
    document.getElementById('editEventForm').addEventListener('submit', e => { e.preventDefault(); closeModal('editModal'); renderHome(); alert("Salvo (Simulação)"); });

    function validateAuth(email, pass) {
        const emailRegex = /^[a-zA-Z0-9._-]+@(gmail|hotmail|outlook|yahoo|live)\.com$/;
        if (!emailRegex.test(email)) return "Erro: O email deve ser @gmail.com, @hotmail.com, etc.";
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
        if (!passRegex.test(pass)) return "Erro na Senha: Deve ter 8-16 caracteres, 1 Maiúscula, 1 Minúscula, 1 Número e 1 Símbolo Especial.";
        return null;
    }
    let isLoginMode = true;
    window.toggleAuthMode = function () { isLoginMode = !isLoginMode; updateAuthUI(); }
    function updateAuthUI() {
        document.getElementById('authTitle').innerText = isLoginMode ? 'Login' : 'Cadastro';
        document.getElementById('authSubmitBtn').innerText = isLoginMode ? 'Entrar' : 'Cadastrar';
        document.getElementById('registerFields').style.display = isLoginMode ? 'none' : 'block';
        document.getElementById('authToggleText').innerText = isLoginMode ? 'Não tem conta?' : 'Já tem conta?';
        document.getElementById('authToggleLink').innerText = isLoginMode ? 'Cadastre-se' : 'Login';
    }
    window.openAuthModal = function () { isLoginMode = true; updateAuthUI(); openModal('authModal'); }

    document.getElementById('authForm').addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('authEmail').value; const pass = document.getElementById('authPass').value;

        if (isLoginMode) {
            const u = users.find(x => x.email === email && x.pass === pass);
            if (u) { currentUser = u; closeModal('authModal'); updateHeaderUI(); navigate('home'); }
            else { if (validateAuth(email, pass)) alert(validateAuth(email, pass)); else alert("Email ou senha incorretos."); }
        } else {
            const err = validateAuth(email, pass); if (err) return alert(err);
            const nick = document.getElementById('regNick').value; const name = document.getElementById('regRealName').value;
            if (!nick || !name) return alert("Preencha todos os dados.");
            const fileInput = document.getElementById('regPhoto');
            const registerUser = (imgUrl) => {
                const id = formatId(users.length + 2);
                users.push({ id, nick, name, weight: document.getElementById('regWeight').value, height: document.getElementById('regHeight').value, email, pass, city: document.getElementById('regCity').value, state: document.getElementById('regState').value, neighborhood: document.getElementById('regNeighborhood').value, reputation: { pos: 0, neg: 0, miss: 0 }, friends: [], avatar: imgUrl });
                alert("Cadastrado com sucesso! Seu ID: " + id); toggleAuthMode();
            };
            if (fileInput.files && fileInput.files[0]) { const reader = new FileReader(); reader.onload = function (e) { registerUser(e.target.result); }; reader.readAsDataURL(fileInput.files[0]); } else { registerUser(null); }
        }
    });
    window.logout = function () { currentUser = null; updateHeaderUI(); navigate('home'); }

    function renderChat(evt) { const list = document.getElementById('chatMessages'); list.innerHTML = evt.chatMessages.map(m => `<div class="chat-msg"><strong onclick="showUserProfile('${m.nick}')">${m.nick}:</strong> ${m.text}</div>`).join(''); list.scrollTop = list.scrollHeight; const canSend = currentUser && (evt.owner === currentUser.nick || evt.participants.includes(currentUser.nick)); document.getElementById('chatInput').disabled = !canSend; document.getElementById('chatSendBtn').disabled = !canSend; document.getElementById('chatRestrictionMsg').style.display = canSend ? 'none' : 'block'; document.getElementById('chatSendBtn').onclick = () => { const v = document.getElementById('chatInput').value.trim(); if (!v) return; evt.chatMessages.push({ nick: currentUser.nick, text: v }); document.getElementById('chatInput').value = ''; renderChat(evt); }; }
    window.joinEvent = function (id, e) {
        if (e) e.stopPropagation(); const evt = events.find(ev => ev.id === id);
        if (evt.participants.includes(currentUser.nick)) return alert("Você já está inscrito neste evento.");
        const target = new Date(`${evt.date}T${evt.time}`); for (let ev of events) { if (ev.id !== id && ev.participants.includes(currentUser.nick)) { const diff = Math.abs(target - new Date(`${ev.date}T${ev.time}`)) / 36e5; if (diff < 5) return alert("ERRO: Conflito de horário! Intervalo mínimo de 5h necessário."); } }
        if (evt.type === 'paid') { const method = prompt("EVENTO PAGO! Qual a forma de pagamento?"); if (!method) return; alert(`ATENÇÃO: Pagamento via ${method}. O líder conferirá 10min antes.`); }
        if (evt.current < evt.max) { evt.current++; evt.participants.push(currentUser.nick); if (evt.current === evt.max) evt.status = 'cheio'; renderHome(); closeModal('detailsModal'); }
    }
    window.leaveEvent = function (id, e) { if (e) e.stopPropagation(); const evt = events.find(ev => ev.id === id); evt.current--; evt.participants = evt.participants.filter(p => p !== currentUser.nick); evt.status = 'aberto'; renderHome(); closeModal('detailsModal'); }
    window.openModal = function (id) { document.getElementById(id).classList.add('active'); }
    window.closeModal = function (id) { document.getElementById(id).classList.remove('active'); }
    function formatDate(s) { return new Date(s).toLocaleDateString('pt-BR'); }
    window.switchTab = function (tab) { document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active')); document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active')); document.getElementById(`tab-${tab}`).classList.add('active'); event.target.classList.add('active'); }
    window.toggleDarkMode = function () { document.body.classList.toggle('dark-mode'); }
    window.openSettingsModal = function () { document.getElementById('userDropdown').classList.remove('active'); openModal('settingsModal'); }
    window.updateAccount = function (e) { e.preventDefault(); const n = document.getElementById('setNick').value; const o = document.getElementById('oldPass').value; const p = document.getElementById('setPass').value; if (!o) return alert("Senha antiga necessária."); if (o !== currentUser.pass) return alert("Senha incorreta."); if (p && p === o) return alert("Nova senha igual a antiga."); if (n) currentUser.nick = n; if (p) currentUser.pass = p; alert("Atualizado!"); closeModal('settingsModal'); updateHeaderUI(); e.target.reset(); }
    window.showUserProfile = function (nick) {
        const u = getUserOrFake(nick); const c = events.filter(e => e.owner === nick).length; let btn = ''; if (currentUser && currentUser.nick !== nick) { if (currentUser.friends.includes(nick)) btn = `<button class="btn-block btn-delete" onclick="removeFriend('${nick}')">Remover Amigo</button>`; else btn = `<button class="btn-block btn-join" onclick="addFriend('${nick}')">Adicionar Amigo</button>`; }
        document.getElementById('publicProfileContent').innerHTML = `<div class="profile-stats"><div class="stat-item"><h4>ID</h4><p>${u.id}</p></div><div class="stat-item"><h4>Nome</h4><p>${u.name}</p></div><div class="stat-item"><h4>Nick</h4><p>${u.nick}</p></div><div class="stat-item"><h4>Criados</h4><p>${c}</p></div></div><div class="details-section"><span class="details-label">Reputação</span><div class="rep-badge"><span class="rep-item rep-green"><i class="fas fa-thumbs-up"></i> ${u.reputation.pos}</span><span class="rep-item rep-red"><i class="fas fa-thumbs-down"></i> ${u.reputation.neg}</span><span class="rep-item rep-yellow"><i class="fas fa-user-slash"></i> ${u.reputation.miss}</span></div></div>${btn}`; openModal('publicProfileModal');
    }
    window.openProfileModal = function () { if (!currentUser) return; const c = events.filter(e => e.owner === currentUser.nick).length; document.getElementById('profileContent').innerHTML = `<div class="profile-stats"><div class="stat-item"><h4>ID</h4><p>${currentUser.id}</p></div><div class="stat-item"><h4>Nome</h4><p>${currentUser.name}</p></div><div class="stat-item"><h4>Nick</h4><p>${currentUser.nick}</p></div><div class="stat-item"><h4>Criados</h4><p>${c}</p></div></div><div class="details-section"><span class="details-label">Reputação</span><div class="rep-badge"><span class="rep-item rep-green"><i class="fas fa-thumbs-up"></i> ${currentUser.reputation.pos}</span><span class="rep-item rep-red"><i class="fas fa-thumbs-down"></i> ${currentUser.reputation.neg}</span><span class="rep-item rep-yellow"><i class="fas fa-user-slash"></i> ${currentUser.reputation.miss}</span></div></div>`; const l = events.filter(e => e.participants.includes(currentUser.nick)); document.getElementById('profileHistoryList').innerHTML = l.length ? l.map(e => `<li class="history-item"><span>${e.name}</span><span>${e.status}</span></li>`).join('') : '<li class="history-item">Vazio</li>'; document.getElementById('userDropdown').classList.remove('active'); openModal('profileModal'); }
    window.addFriend = function (nick) { if (!currentUser) return openAuthModal(); if (currentUser.friends.includes(nick)) return alert("Já amigos!"); currentUser.friends.push(nick); const f = getUserOrFake(nick); if (!f.friends) f.friends = []; f.friends.push(currentUser.nick); alert("Adicionado!"); closeModal('publicProfileModal'); }
    window.removeFriend = function (nick) { if (!confirm(`Remover ${nick}?`)) return; currentUser.friends = currentUser.friends.filter(f => f !== nick); openFriendsModal(); }
    window.openFriendsModal = function () { document.getElementById('userDropdown').classList.remove('active'); const c = document.getElementById('friendsListContent'); if (!currentUser || !currentUser.friends.length) c.innerHTML = "<p>Sem amigos.</p>"; else c.innerHTML = currentUser.friends.map(f => `<div class="friend-row"><div class="friend-info"><div class="friend-avatar">${f[0]}</div><span>${f}</span></div><div class="friend-actions"><button class="small-btn btn-msg" onclick="openPrivateChat('${f}')">Chat</button><button class="small-btn btn-rm" onclick="removeFriend('${f}')">X</button></div></div>`).join(''); openModal('friendsModal'); }
    let currentChatFriend = null;
    window.openPrivateChat = function (nick) { currentChatFriend = nick; closeModal('friendsModal'); document.getElementById('privateChatTitle').innerText = `Chat: ${nick}`; renderPrivateChat(); openModal('privateChatModal'); }
    function renderPrivateChat() { const key = [currentUser.nick, currentChatFriend].sort().join('_'); if (!privateChats[key]) privateChats[key] = []; document.getElementById('privateChatMessages').innerHTML = privateChats[key].map(m => `<div class="chat-msg" style="text-align:${m.sender === currentUser.nick ? 'right' : 'left'}"><strong>${m.sender}:</strong> ${m.text}</div>`).join(''); document.getElementById('privateChatSendBtn').onclick = () => { const v = document.getElementById('privateChatInput').value.trim(); if (!v) return; privateChats[key].push({ sender: currentUser.nick, text: v }); document.getElementById('privateChatInput').value = ''; renderPrivateChat(); }; }
    window.openInviteModal = function () { if (!currentUser) return; const c = document.getElementById('inviteListContent'); c.innerHTML = currentUser.friends.length ? currentUser.friends.map(f => `<div class="friend-row"><span>${f}</span><button class="small-btn btn-inv" onclick="inviteFriend('${f}')">Convidar</button></div>`).join('') : "<p>Sem amigos.</p>"; openModal('inviteModal'); }
    window.inviteFriend = function (nick) { const evt = events.find(e => e.id === currentEventId); if (evt.participants.includes(nick)) return alert("Este amigo já está participando deste evento."); const k = [currentUser.nick, nick].sort().join('_'); if (!privateChats[k]) privateChats[k] = []; privateChats[k].push({ sender: currentUser.nick, text: `✉️ Convite: ${evt.name}` }); alert("Enviado!"); }
    window.ratePlayer = function (nick, type) { getUserOrFake(nick).reputation[type]++; alert("Avaliado"); }
    window.kickPlayer = function (nick) { if (!confirm("Expulsar?")) return; const evt = events.find(e => e.id === currentEventId); evt.participants = evt.participants.filter(p => p !== nick); evt.current--; renderDetails(); renderHome(); }

    updateHeaderUI(); renderHome();
});

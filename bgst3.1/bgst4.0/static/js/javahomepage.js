console.log("JS carregou");
"use strict";

const engine = (function () {

    // --------------------
    // ESTADO PRINCIPAL
    // --------------------
    const _state = {
        currentUser: {
            id: 1,
            name: "Felipe Silva",
            rank: "Elite Member",
            theme: localStorage.getItem('bs_v12_theme') || 'dark',
            reputation: 4.9
        },
        events: [],
        userSubscriptions: JSON.parse(localStorage.getItem('bs_v12_subs')) || [],
        userOwnedEvents: JSON.parse(localStorage.getItem('bs_v12_owned')) || [],
        userHistory: JSON.parse(localStorage.getItem('bs_v12_history')) || [],
        currentView: 'dashboard',
        searchQuery: '',
        isSidebarCollapsed: false
    };

    // --------------------
    // DADOS DE EXEMPLO (SEED)
    // --------------------
    const _courts = [
        { id: 1, nome: "Quadra Moema", cidade: "São Paulo", bairro: "Moema", rua: "Av. Moema", cep: "04510-001", capacidade: 10 },
        { id: 2, nome: "Quadra Ibirapuera", cidade: "São Paulo", bairro: "Ibirapuera", rua: "Rua Ibirapuera", cep: "04029-001", capacidade: 6 },
        { id: 3, nome: "Quadra Pampulha", cidade: "Belo Horizonte", bairro: "Pampulha", rua: "Av. Pampulha", cep: "31265-000", capacidade: 12 }
    ];

    const _initialSeed = [
        { id: 1001, nome: "Copa Moema Society", esporte: "Futebol", genero: "Masculino", max: 14, ocupadas: 10, descricao: "Racha tradicional de quarta-feira.", cidade: "São Paulo", bairro: "Moema", rua: "Av. Moema", cep: "04510-001", valor: 350.00, banco: "Itáu", titular: "Ricardo Mendes", pix: "ricardo@arena.com" },
        { id: 1002, nome: "Street Basketball 3x3", esporte: "Basquete", genero: "Misto", max: 6, ocupadas: 3, descricao: "Só para quem gosta de enterrar.", cidade: "São Paulo", bairro: "Ibirapuera", rua: "Rua Ibirapuera", cep: "04029-001", valor: 0.00, banco: "N/A", titular: "Prefeitura SP", pix: "Grátis" }
    ];

    // --------------------
    // INICIALIZAÇÃO
    // --------------------
    const init = () => {
        _loadPersistentData();
        _applyTheme(_state.currentUser.theme);
        _setupDOMListeners();
        _renderCourts();
        _renderAll();
        _showToast("Bem-vindo ao BigStreet v12!");
    };

    const _loadPersistentData = () => {
        const localEvents = localStorage.getItem('bs_v12_events');
        _state.events = localEvents ? JSON.parse(localEvents) : _initialSeed;
    };

    const _syncStorage = () => {
        localStorage.setItem('bs_v12_events', JSON.stringify(_state.events));
        localStorage.setItem('bs_v12_subs', JSON.stringify(_state.userSubscriptions));
        localStorage.setItem('bs_v12_owned', JSON.stringify(_state.userOwnedEvents));
        localStorage.setItem('bs_v12_history', JSON.stringify(_state.userHistory));
    };

    // --------------------
    // RENDERIZAÇÃO
    // --------------------
    const _renderAll = () => {
        _renderDashboard();
        _renderExplore();
        _renderHistory();
        _renderOwned();
    };

    const _renderDashboard = () => {
        const subContainer = document.getElementById('activeSubscriptionsList');
        const trendContainer = document.getElementById('trendingEventsList');
        const mySubs = _state.events.filter(e => _state.userSubscriptions.includes(e.id));
        const trends = _state.events.filter(e => !_state.userSubscriptions.includes(e.id));

        if (subContainer) subContainer.innerHTML = mySubs.length ? mySubs.map(ev => _createCardHTML(ev, true)).join('') : `<div class="empty-placeholder">Nenhuma partida marcada.</div>`;
        if (trendContainer) trendContainer.innerHTML = trends.slice(0, 4).map(ev => _createCardHTML(ev, false)).join('');
    };

    const _renderCourts = () => {
        const grid = document.getElementById('courtsGrid');
        if (!grid) return;
        grid.innerHTML = _courts.map(c => `
        <div class="court-card">
            <h3>${c.nome}</h3>
            <p>${c.bairro}, ${c.cidade}</p>
            <p>Capacidade: ${c.capacidade} jogadores</p>
            <button class="btn-modal-submit" onclick="engine.ui.openModalWithData('createModal', { rua: '${c.rua}', bairro: '${c.bairro}', cidade: '${c.cidade}', cep: '${c.cep}' })">
                Criar Evento Aqui
            </button>
        </div>
    `).join('');
    };

    const _createCardHTML = (ev, isSubscribed, isHistory = false, isOwner = false) => {
        const vagas = ev.max - ev.ocupadas;
        const valorUnitario = ev.valor > 0 ? (ev.valor / ev.max).toFixed(2) : "0.00";

        return `
        <div class="event-big-card" onclick="this.classList.toggle('expanded')">
            <div class="card-top-info">
                <span class="card-sport-tag">${ev.esporte}</span>
                <div class="card-meta-icons">${isOwner ? '<i class="fas fa-crown orange-glow"></i>' : ''}</div>
            </div>
            <h3 class="card-h3">${ev.nome}</h3>
            <div class="card-details-grid">
                <div class="detail-row"><i class="fas fa-map-marker-alt"></i> ${ev.bairro}, ${ev.cidade}</div>
                <div class="detail-row"><i class="fas fa-users"></i> ${ev.ocupadas}/${ev.max} Atletas</div>
                <div class="detail-row"><i class="fas fa-venus-mars"></i> ${ev.genero}</div>
                <div class="detail-row"><i class="fas fa-tag"></i> R$ ${valorUnitario} /p</div>
            </div>
            <div class="card-expand-area" onclick="event.stopPropagation()">
                <p class="description-text">${ev.descricao}</p>
                <div class="finance-box">
                    <div><p class="stat-l">PIX</p><p class="stat-v">${ev.pix}</p></div>
                    <div><p class="stat-l">Banco</p><p class="stat-v">${ev.banco}</p></div>
                </div>
                <div class="card-actions-row" style="margin-top: 25px; display: flex; gap: 15px;">
                    <div style="flex: 1;">
                        ${isHistory ? '<button class="btn-modal-submit" style="width:100%" disabled>Concluída</button>' :
                isOwner ? `<button class="btn-modal-cancel" style="width:100%" onclick="engine.logic.deleteEvent(${ev.id})">Excluir</button>` :
                    isSubscribed ? `<button class="btn-modal-cancel" style="width:100%" onclick="engine.logic.handleSubscription(${ev.id})">Sair</button>` :
                        `<button class="btn-modal-submit" style="width:100%" onclick="engine.logic.handleSubscription(${ev.id})" ${vagas === 0 ? 'disabled' : ''}>${vagas === 0 ? 'Lotado' : 'Quero Jogar'}</button>`}
                    </div>
                    <button class="btn-card-secondary-outline" 
                            onclick="engine.ui.openModalWithData('createModal', { rua: '${ev.rua || ""}', bairro: '${ev.bairro}', cidade: '${ev.cidade}', cep: '${ev.cep || ""}' })" 
                            style="flex: 1; background: transparent !important; border: 2px solid var(--primary) !important; color: var(--primary) !important; cursor: pointer; border-radius: 12px; font-weight: bold; height: 45px;">
                        <i class="fas fa-plus-circle"></i> Criar Evento
                    </button>
                </div>
            </div>
        </div>`;
    };

    const _renderExplore = () => {
        const grid = document.getElementById('exploreGlobalGrid');
        if (!grid) return;
        let filtered = _state.events;
        if (_state.searchQuery) {
            const q = _state.searchQuery.toLowerCase();
            filtered = filtered.filter(e => e.nome.toLowerCase().includes(q) || e.bairro.toLowerCase().includes(q));
        }
        grid.innerHTML = filtered.map(ev => _createCardHTML(ev, _state.userSubscriptions.includes(ev.id))).join('');
    };

    const _renderHistory = () => {
        const container = document.getElementById('historyDetailedList');
        if (!container) return;
        const list = _state.events.filter(e => _state.userHistory.includes(e.id));
        container.innerHTML = list.map(ev => _createCardHTML(ev, false, true)).join('');
    };

    const _renderOwned = () => {
        const container = document.getElementById('ownedEventsList');
        if (!container) return;
        const list = _state.events.filter(e => _state.userOwnedEvents.includes(e.id));
        container.innerHTML = list.map(ev => _createCardHTML(ev, false, false, true)).join('');
    };

    // --------------------
    // LÓGICA DE NEGÓCIO
    // --------------------
    const _handleSubscription = (id) => {
        const ev = _state.events.find(e => e.id === id);
        const subIndex = _state.userSubscriptions.indexOf(id);
        if (subIndex > -1) {
            _state.userSubscriptions.splice(subIndex, 1);
            ev.ocupadas--;
            if (!_state.userHistory.includes(id)) _state.userHistory.push(id);
            _showToast("Você saiu da partida.");
        } else if (ev.ocupadas < ev.max) {
            _state.userSubscriptions.push(id);
            ev.ocupadas++;
            _showToast("Inscrição confirmada!");
        }
        _syncStorage();
        _renderAll();
    };

    const _createNewEvent = (formData) => {
        const newEv = { id: Date.now(), ...formData, ocupadas: 1 };
        _state.events.unshift(newEv);
        _state.userOwnedEvents.push(newEv.id);
        _state.userSubscriptions.push(newEv.id);
        _syncStorage();
        _renderAll();
        _closeModal('createModal');
        _showToast("Evento publicado!");
    };

    const _deleteEvent = (id) => {
        if (confirm("Excluir evento?")) {
            _state.events = _state.events.filter(e => e.id !== id);
            _state.userOwnedEvents = _state.userOwnedEvents.filter(oid => oid !== id);
            _state.userSubscriptions = _state.userSubscriptions.filter(sid => sid !== id);
            _syncStorage();
            _renderAll();
            _showToast("Evento excluído.");
        }
    };

    // --------------------
    // INTERFACE (UI AUX)
    // --------------------
    const _validarEBuscarCEP = async (cep) => {
        // Remove caracteres não numéricos
        const limpo = cep.replace(/\D/g, '');

        // Validação básica de formato (8 dígitos)
        if (limpo.length !== 8) {
            _showToast("CEP Inválido! Use 8 dígitos.");
            return;
        }

        try {
            _showToast("Validando CEP...");
            const response = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);

            }



            if (data.erro) {
                _showToast("CEP não encontrado na base de dados.");
                return;
            }

            // Se encontrou, preenche os campos automaticamente
            if (document.getElementById('sql_rua')) document.getElementById('sql_rua').value = data.logradouro;
            if (document.getElementById('sql_bairro')) document.getElementById('sql_bairro').value = data.bairro;
            if (document.getElementById('sql_cidade')) document.getElementById('sql_cidade').value = data.localidade;

            _showToast("Endereço validado com sucesso!");
        } catch (error) {
            _showToast("Erro ao validar CEP. Verifique sua conexão.");
        }
    };

    const _openModalWithData = (modalId, data) => {
        const campos = {
            'sql_rua': data.rua,
            'sql_bairro': data.bairro,
            'sql_cidade': data.cidade,
            'sql_cep': data.cep
        };

        for (const [id, value] of Object.entries(campos)) {
            const input = document.getElementById(id);
            if (input) input.value = value || '';
        }

        _openModal(modalId);
    };

    const _applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        _state.currentUser.theme = theme;
        localStorage.setItem('bs_v12_theme', theme);
    };

    const _openModal = (id) => {
        const m = document.getElementById(id);
        const o = document.getElementById('globalOverlay');
        if (m) m.classList.add('active');
        if (o) o.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const _closeModal = (id) => {
        const m = document.getElementById(id);
        const o = document.getElementById('globalOverlay');
        if (m) m.classList.remove('active');
        if (o) o.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    const _showToast = (msg) => {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };

    const _setupDOMListeners = () => {

        // Dentro de _setupDOMListeners:
        const cepInput = document.getElementById('sql_cep');
        if (cepInput) {
            // O evento 'blur' dispara quando o usuário sai do campo de texto
            cepInput.addEventListener('blur', (e) => {
                if (e.target.value.length > 0) {
                    _validarEBuscarCEP(e.target.value);
                }
            });
        }

        const sbToggle = document.getElementById('sidebarToggle');
        if (sbToggle) sbToggle.onclick = () => {
            _state.isSidebarCollapsed = !_state.isSidebarCollapsed;
            document.getElementById('sidebar').classList.toggle('collapsed');
        };

        document.querySelectorAll('.nav-link-item[data-view]').forEach(item => {
            item.onclick = () => {
                const view = item.getAttribute('data-view');
                document.querySelectorAll('.viewport-section').forEach(s => s.classList.remove('active'));
                document.querySelectorAll('.nav-link-item').forEach(l => l.classList.remove('active'));
                const target = document.getElementById(`view-${view}`);
                if (target) target.classList.add('active');
                item.classList.add('active');
                _state.currentView = view;
            };
        });

        if (document.getElementById('themeDarkBtn')) document.getElementById('themeDarkBtn').onclick = () => _applyTheme('dark');
        if (document.getElementById('themeLightBtn')) document.getElementById('themeLightBtn').onclick = () => _applyTheme('light');

        if (document.getElementById('triggerCreateModal')) document.getElementById('triggerCreateModal').onclick = () => _openModal('createModal');
        if (document.getElementById('closeCreateModal')) document.getElementById('closeCreateModal').onclick = () => _closeModal('createModal');
        if (document.getElementById('cancelEventBtn')) document.getElementById('cancelEventBtn').onclick = () => _closeModal('createModal');

        const search = document.getElementById('masterSearch');
        if (search) search.oninput = (e) => { _state.searchQuery = e.target.value; _renderExplore(); };

        document.getElementById('saveEventBtn').onclick = async () => {
            const now = new Date();
            const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
            const formData = {
                nome_evento: document.getElementById('sql_nome').value,
                esporte_evento: document.getElementById('sql_esporte').value,
                genero: document.getElementById('sql_genero').value,
                inicio: document.getElementById('sql_inicio').value,
                fim: document.getElementById('sql_fim').value,
                faixa_etaria: document.getElementById('sql_faixa').value,

                tipo: document.getElementById('sql_quadra').value,
                descricao_evento: document.getElementById('sql_desc').value,
                cidade_evento: document.getElementById('sql_cidade').value,
                bairro_evento: document.getElementById('sql_bairro').value,
                rua_numero: document.getElementById('sql_rua').value,
                valor_aluguel: parseFloat(document.getElementById('sql_valor').value || 0),
                banco: document.getElementById('sql_banco').value,
                beneficiario: document.getElementById('sql_titular').value,
                pix: document.getElementById('sql_pix').value,

                horario_inicio: formattedDate,
                horario_termino: formattedDate,

                cep_evento: parseInt(document.getElementById('sql_cep').value),

                usuario_id: parseInt(localStorage.getItem("usuario_id"))
            };

            if (!formData.nome_evento || !formData.pix) {
                _showToast("Preencha Nome e PIX.");
                return;
            }

            try {

                console.log("Dados enviados:", formData);

                const response = await fetch("http://127.0.0.1:5000/eventos", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {

                    const resultado = await response.json();  // LER UMA ÚNICA VEZ

                    if (resultado.success) {
                        _showToast("Evento criado com sucesso!");
                    } else {
                        _showToast("Erro: " + resultado.message);
                    }

                } else {
                    _showToast("Erro no servidor");
                }

            } catch (erro) {
                console.error("Erro:", erro);
                _showToast("Erro inesperado");
            }

            const logout = document.getElementById('logoutBtn');
            if (logout) logout.onclick = () => { if (confirm("Sair?")) window.location.href = "institucional.html"; };
        };
    }
    // --------------------
    // EXPOSIÇÃO DO MÓDULO
    // --------------------
    return {
        init,
        logic: {
            handleSubscription: _handleSubscription,
            deleteEvent: _deleteEvent,
            setTheme: _applyTheme
        },
        ui: {
            openModal: _openModal,
            closeModal: _closeModal,
            openModalWithData: _openModalWithData
        }
    };

}
)();

// --------------------
// INICIALIZAÇÃO ÚNICA
// --------------------
window.addEventListener('DOMContentLoaded', () => engine.init());
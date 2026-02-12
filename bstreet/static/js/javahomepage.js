"use strict";
const engine = (function() {
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
        currentSportFilter: 'Todos',
        searchQuery: '',
        isSidebarCollapsed: false
    };
    const _initialSeed = [
        { id: 1001, nome: "Copa Moema Society", esporte: "Futebol", genero: "Masculino", max: 14, ocupadas: 10, descricao: "Racha tradicional de quarta-feira. Nível intermediário.", cidade: "São Paulo", bairro: "Moema", valor: 350.00, banco: "Itáu", titular: "Ricardo Mendes", pix: "ricardo@arena.com" },
        { id: 1002, nome: "Street Basketball 3x3", esporte: "Basquete", genero: "Misto", max: 6, ocupadas: 3, descricao: "Só para quem gosta de enterrar.", cidade: "São Paulo", bairro: "Ibirapuera", valor: 0.00, banco: "N/A", titular: "Prefeitura SP", pix: "Grátis" },
        { id: 1003, nome: "Vôlei de Areia Sunset", esporte: "Volei", genero: "Misto", max: 12, ocupadas: 12, descricao: "Partida recreativa de final de tarde.", cidade: "Belo Horizonte", bairro: "Pampulha", valor: 180.00, banco: "Nubank", titular: "Ana Clara", pix: "ana.clara@pix.com" },
        { id: 1004, nome: "Beach Tennis Challenge", esporte: "Tenis", genero: "Misto", max: 4, ocupadas: 1, descricao: "Torneio amigável de duplas.", cidade: "Rio de Janeiro", bairro: "Barra", valor: 240.00, banco: "Santander", titular: "Bruno Costa", pix: "bruno.costa@santander.com" }
    ];
    const init = () => {
        _loadPersistentData();
        _applyTheme(_state.currentUser.theme);
        _setupDOMListeners();
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
        subContainer.innerHTML = mySubs.length ? mySubs.map(ev => _createCardHTML(ev, true)).join('') : `<div class="empty-placeholder">Nenhuma partida marcada.</div>`;
        trendContainer.innerHTML = trends.slice(0, 4).map(ev => _createCardHTML(ev, false)).join('');
    };
    const _renderExplore = () => {
        const grid = document.getElementById('exploreGlobalGrid');
        let filtered = _state.events;
        if (_state.searchQuery) {
            const q = _state.searchQuery.toLowerCase();
            filtered = filtered.filter(e => e.nome.toLowerCase().includes(q) || e.bairro.toLowerCase().includes(q));
        }
        grid.innerHTML = filtered.map(ev => _createCardHTML(ev, _state.userSubscriptions.includes(ev.id))).join('');
    };
    const _renderHistory = () => {
        const container = document.getElementById('historyDetailedList');
        const list = _state.events.filter(e => _state.userHistory.includes(e.id));
        container.innerHTML = list.map(ev => _createCardHTML(ev, false, true)).join('');
    };
    const _renderOwned = () => {
        const container = document.getElementById('ownedEventsList');
        const list = _state.events.filter(e => _state.userOwnedEvents.includes(e.id));
        container.innerHTML = list.map(ev => _createCardHTML(ev, false, false, true)).join('');
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
                        ${isHistory ? '<button class="btn-modal-submit" disabled>Concluída</button>' : 
                          isOwner ? `<button class="btn-modal-cancel" onclick="engine.logic.deleteEvent(${ev.id})">Excluir</button>` :
                          isSubscribed ? `<button class="btn-modal-cancel" onclick="engine.logic.handleSubscription(${ev.id})">Sair</button>` :
                          `<button class="btn-modal-submit" onclick="engine.logic.handleSubscription(${ev.id})" ${vagas === 0 ? 'disabled' : ''}>${vagas === 0 ? 'Lotado' : 'Quero Jogar'}</button>`
                        }
                    </div>
                </div>
            </div>`;
    };
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
    const _applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        _state.currentUser.theme = theme;
        localStorage.setItem('bs_v12_theme', theme);
        const dBtn = document.getElementById('themeDarkBtn'), lBtn = document.getElementById('themeLightBtn');
        if (theme === 'dark') { dBtn.classList.add('active'); lBtn.classList.remove('active'); }
        else { lBtn.classList.add('active'); dBtn.classList.remove('active'); }
    };
    const _openModal = (id) => { document.getElementById(id).classList.add('active'); document.getElementById('globalOverlay').classList.add('active'); document.body.style.overflow = 'hidden'; };
    const _closeModal = (id) => { document.getElementById(id).classList.remove('active'); document.getElementById('globalOverlay').classList.remove('active'); document.body.style.overflow = 'auto'; };
    const _showToast = (msg) => { const container = document.getElementById('toastContainer'), toast = document.createElement('div'); toast.className = 'toast'; toast.innerText = msg; container.appendChild(toast); setTimeout(() => toast.remove(), 4000); };
    const _setupDOMListeners = () => {
        document.getElementById('sidebarToggle').onclick = () => { _state.isSidebarCollapsed = !_state.isSidebarCollapsed; document.getElementById('sidebar').classList.toggle('collapsed'); };
        document.querySelectorAll('.nav-link-item[data-view]').forEach(item => {
            item.onclick = () => {
                const view = item.getAttribute('data-view');
                document.querySelectorAll('.viewport-section').forEach(s => s.classList.remove('active'));
                document.querySelectorAll('.nav-link-item').forEach(l => l.classList.remove('active'));
                document.getElementById(`view-${view}`).classList.add('active');
                item.classList.add('active');
                _state.currentView = view;
            };
        });
        document.getElementById('themeDarkBtn').onclick = () => _applyTheme('dark');
        document.getElementById('themeLightBtn').onclick = () => _applyTheme('light');
        document.getElementById('triggerCreateModal').onclick = () => _openModal('createModal');
        document.getElementById('closeCreateModal').onclick = () => _closeModal('createModal');
        document.getElementById('cancelEventBtn').onclick = () => _closeModal('createModal');
        document.getElementById('masterSearch').oninput = (e) => { _state.searchQuery = e.target.value; _renderExplore(); };
        document.getElementById('saveEventBtn').onclick = () => {
            const formData = {
                nome: document.getElementById('sql_nome').value,
                esporte: document.getElementById('sql_esporte').value,
                max: parseInt(document.getElementById('sql_max').value),
                genero: document.getElementById('sql_genero').value,
                descricao: document.getElementById('sql_desc').value,
                cidade: document.getElementById('sql_cidade').value,
                bairro: document.getElementById('sql_bairro').value,
                rua: document.getElementById('sql_rua').value,
                valor: parseFloat(document.getElementById('sql_valor').value || 0),
                banco: document.getElementById('sql_banco').value,
                titular: document.getElementById('sql_titular').value,
                pix: document.getElementById('sql_pix').value
            };
            if (formData.nome && formData.pix) _createNewEvent(formData);
            else _showToast("Preencha Nome e PIX.");
        };
        document.getElementById('logoutBtn').onclick = () => { if (confirm("Sair?")) window.location.href = "institucional.html"; };
        document.querySelectorAll('.s-nav-btn').forEach(btn => {
            btn.onclick = () => {
                const pane = btn.getAttribute('data-pane');
                document.querySelectorAll('.s-nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.settings-pane').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`pane-${pane}`).classList.add('active');
            };
        });
    };
    return { init, logic: { handleSubscription: _handleSubscription, deleteEvent: _deleteEvent, setTheme: _applyTheme }, ui: { openModal: _openModal, closeModal: _closeModal } };
})();
window.addEventListener('DOMContentLoaded', () => engine.init());
/**
 * © 2026 Central de Aplicativos — Marlon Sigales. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * Monta a página a partir do catálogo (js/apps.js) e liga a gamificação (js/gamificacao.js).
 */

'use strict';

const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const Central = {
    estado: Gamificacao.novoEstado(),

    ativos() { return APPS.filter((a) => a.ativo); },
    app(id) { return this.ativos().find((a) => a.id === id) || null; },
    categoriasComApps() { return CATEGORIAS.filter((c) => this.ativos().some((a) => a.categoria === c.id)); },
    fluxo() { return FLUXO.filter((f) => { const a = this.app(f.app); return a && a.url; }); },

    iniciar() {
        this.estado = Gamificacao.carregar();
        this.montarCategorias();
        this.montarFluxo();
        this.montarMenu();
        this.montarRegras();
        this.evento('visita');
        this.ligar();
    },

    // ------------------------------------------------------------ montagem
    montarCategorias() {
        $('#categorias').innerHTML = this.categoriasComApps().map((c) => `
            <section class="card categoria" id="cat-${esc(c.id)}">
                <div class="card-topo"><h2>${esc(c.nome)}</h2><small>${esc(c.descricao)}</small></div>
                <ul class="lista-apps">${this.ativos().filter((a) => a.categoria === c.id).map((a) => this.itemApp(a)).join('')}</ul>
            </section>`).join('');
    },

    itemApp(a) {
        const fig = a.imagem
            ? `<img src="${esc(a.imagem)}" alt="Tela do ${esc(a.nome)}" loading="lazy" width="240" height="150">`
            : `<span class="app-fig-vazia" aria-hidden="true">${esc(a.nome.slice(0, 2).toUpperCase())}</span>`;
        const abrir = (conteudo, cls) => (a.url
            ? `<a class="${cls}" href="${esc(a.url)}" target="_blank" rel="noopener" data-abrir="${esc(a.id)}">${conteudo}</a>`
            : `<span class="${cls}">${conteudo}</span>`);
        return `<li class="app-item" data-app="${esc(a.id)}">
            ${abrir(fig, 'app-fig')}
            <div class="app-texto">
                <div class="app-titulo">${abrir(esc(a.nome), 'app-nome')}<span class="app-estado" data-estado="${esc(a.id)}"></span></div>
                <p>${esc(a.descricao)}</p>
                <div class="app-rodape">
                    ${(a.etiquetas || []).map((t) => `<span class="etiqueta">${esc(t)}</span>`).join('')}
                    ${a.url ? '' : '<span class="etiqueta etiqueta-aviso">endereço a cadastrar</span>'}
                    ${a.codigo ? `<a class="app-codigo" href="${esc(a.codigo)}" target="_blank" rel="noopener" data-codigo="${esc(a.id)}">código ↗</a>` : ''}
                </div>
            </div>
        </li>`;
    },

    montarFluxo() {
        const f = this.fluxo();
        $('#fluxo').hidden = f.length < 2;
        $('#fluxo-lista').innerHTML = f.map((p, i) => {
            const a = this.app(p.app);
            return `<li><a class="fluxo-passo" href="${esc(a.url)}" target="_blank" rel="noopener" data-abrir="${esc(a.id)}" data-passo="${esc(a.id)}">
                <span class="sidebar-num">${i + 1}</span>
                <span><small>${esc(p.fase)}</small><b>${esc(a.nome)}</b><span>${esc(p.texto)}</span></span>
            </a></li>`;
        }).join('');
    },

    montarMenu() {
        const link = (href, txt, num) => `<a class="sidebar-link" href="${href}">${num ? `<span class="sidebar-num">${num}</span>` : ''}<span>${esc(txt)}</span></a>`;
        let h = link('#inicio', 'Início', '⌂') + (this.fluxo().length >= 2 ? link('#fluxo', 'Fluxo de projetos', '→') : '') + link('#progresso', 'Seu progresso', '★');
        h += '<span class="sidebar-grupo">Aplicativos</span>';
        h += this.categoriasComApps().map((c) => link(`#cat-${esc(c.id)}`, c.nome, this.ativos().filter((a) => a.categoria === c.id).length)).join('');
        h += '<span class="sidebar-grupo">Créditos</span>' + link('#agradecimento', 'Agradecimento', '♥');
        $('#sidebar-nav').innerHTML = h;
    },

    montarRegras() {
        const X = Gamificacao.XP;
        $('#regras-xp').innerHTML = [
            `Abrir um aplicativo pela primeira vez: <b>+${X.abrirPrimeira} XP</b>`,
            `Abrir de novo em outro dia: <b>+${X.abrirOutroDia} XP</b> (uma vez por app por dia)`,
            `Ver o código de um aplicativo: <b>+${X.codigo} XP</b>`,
            `Voltar à central em outro dia: <b>+${X.novoDia} XP</b>`,
            `Visitar a página do Prof. Falstad: <b>+${X.falstad} XP</b>`,
            'Cada conquista dá um bônus. Só conta o que é aberto a partir desta central, neste navegador.'
        ].map((t) => `<li>${t}</li>`).join('');
    },

    // ------------------------------------------------------------ progresso
    renderProgresso() {
        const e = this.estado, n = Gamificacao.nivel(e.xp);
        const barra = `<div class="barra-xp" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(n.frac * 100)}"><span style="width:${(n.frac * 100).toFixed(1)}%"></span></div>`;
        const prox = n.proximo ? `faltam ${n.falta} XP para <b>${esc(n.proximo.nome)}</b>` : 'nível máximo';
        $('#progresso-nivel').innerHTML = `<div class="nivel-selo"><span>${n.numero}</span></div>
            <div class="nivel-info"><b>Nível ${n.numero} · ${esc(n.nome)}</b> <small>${e.xp} XP · ${prox}</small>${barra}</div>`;
        $('#sidebar-nivel').innerHTML = `<b>Nível ${n.numero} · ${esc(n.nome)}</b><span>${e.xp} XP</span>${barra}`;
        $('#topbar-nivel').textContent = `Nível ${n.numero} · ${e.xp} XP`;

        const lista = Gamificacao.conquistasAtivas(APPS, FLUXO);
        const feitas = lista.filter(({ c }) => e.conquistas[c.id]).length;
        $('#conquistas-contagem').textContent = `${feitas} de ${lista.length}`;
        $('#conquistas-lista').innerHTML = lista.map(({ c }) => {
            const ok = !!e.conquistas[c.id];
            return `<li class="conquista ${ok ? 'feita' : ''}" title="${ok ? 'Conquistada em ' + esc(e.conquistas[c.id].split('-').reverse().join('/')) : 'Ainda não conquistada'}">
                <span class="conquista-icone">${ok ? c.icone : '🔒'}</span>
                <span><b>${esc(c.nome)}</b><small>${esc(c.texto)} · +${c.bonus} XP</small></span></li>`;
        }).join('');

        // estado de cada app e do fluxo
        document.querySelectorAll('[data-estado]').forEach((el) => {
            const r = e.abertos[el.dataset.estado];
            el.className = 'app-estado' + (r ? ' aberto' : '');
            el.textContent = r ? `✓ aberto ${r.vezes}×` : (this.app(el.dataset.estado)?.url ? 'novo' : '');
        });
        const seq = this.fluxo().map((f) => f.app);
        const proximo = seq.find((id) => !e.abertos[id]);
        document.querySelectorAll('[data-passo]').forEach((el) => {
            const id = el.dataset.passo;
            el.classList.toggle('estado-feito', !!e.abertos[id]);
            el.classList.toggle('estado-proximo', id === proximo);
        });
    },

    evento(tipo, id) {
        const { estado, ganho, novas } = Gamificacao.registrar(this.estado, tipo, id, APPS, FLUXO);
        this.estado = estado;
        Gamificacao.salvar(estado);
        this.renderProgresso();
        if (novas.length) this.avisar(novas.map((c) => `${c.icone} Conquista: <b>${esc(c.nome)}</b>`).join('<br>') + `<br><small>+${ganho} XP</small>`);
        else if (ganho > 0 && tipo !== 'visita') this.avisar(`+${ganho} XP`);
    },

    avisar(html) {
        const el = $('#aviso');
        el.innerHTML = html;
        el.classList.add('visivel');
        clearTimeout(this._aviso);
        this._aviso = setTimeout(() => el.classList.remove('visivel'), 3500);
    },

    // ------------------------------------------------------------ eventos
    ligar() {
        const clique = (ev) => {
            if (ev.type === 'auxclick' && ev.button !== 1) return;
            const a = ev.target.closest('a');
            if (!a) return;
            if (a.dataset.abrir) this.evento('abrir', a.dataset.abrir);
            else if (a.dataset.codigo) this.evento('codigo', a.dataset.codigo);
            else if (a.hasAttribute('data-falstad')) this.evento('falstad');
            if (a.closest('.sidebar') && a.getAttribute('href').startsWith('#')) this.menu(false);
        };
        document.addEventListener('click', clique);
        document.addEventListener('auxclick', clique);
        document.addEventListener('click', (ev) => {
            const b = ev.target.closest('[data-acao]');
            if (!b) return;
            if (b.dataset.acao === 'zerar' && confirm('Zerar o XP e as conquistas deste navegador?')) { this.estado = Gamificacao.zerar(); this.evento('visita'); }
            if (b.dataset.acao === 'fechar-menu') this.menu(false);
        });
        $('.sidebar-toggle').addEventListener('click', () => this.menu(!document.body.classList.contains('sidebar-aberta')));
        // outra aba mudou o progresso
        window.addEventListener('storage', () => { this.estado = Gamificacao.carregar(); this.renderProgresso(); });
    },

    menu(abrir) {
        document.body.classList.toggle('sidebar-aberta', abrir);
        $('.sidebar-toggle').setAttribute('aria-expanded', String(abrir));
    }
};

document.addEventListener('DOMContentLoaded', () => Central.iniciar());

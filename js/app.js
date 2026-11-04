/**
 * © 2026 Central de Aplicativos — Marlon Sigales. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * Monta a página a partir do catálogo (js/apps.js) e liga o jogo de missões (js/gamificacao.js).
 * Ordem: o app em destaque (Gestão de Projetos) primeiro; os apps separados depois, por categoria.
 */

'use strict';

const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dataBR = (d) => String(d).split('-').reverse().join('/');

const Central = {
    estado: Gamificacao.novoEstado(),

    ativos() { return APPS.filter((a) => a.ativo); },
    app(id) { return this.ativos().find((a) => a.id === id) || null; },
    destaque() { return this.ativos().find((a) => a.destaque) || null; },
    separados() { const d = this.destaque(); return this.ativos().filter((a) => a !== d); },
    categoriasComApps() { return CATEGORIAS.filter((c) => this.separados().some((a) => a.categoria === c.id)); },
    fluxo() { return FLUXO.filter((f) => { const a = this.app(f.app); return a && a.url; }); },

    iniciar() {
        this.estado = Gamificacao.carregar();
        this.montarDestaque();
        this.montarCategorias();
        this.montarFluxo();
        this.montarMenu();
        this.montarRegras();
        this.evento('visita');
        this.ligar();
    },

    // ------------------------------------------------------------ montagem
    linkApp(a, conteudo, cls) {
        return a.url
            ? `<a class="${cls}" href="${esc(a.url)}" target="_blank" rel="noopener" data-abrir="${esc(a.id)}">${conteudo}</a>`
            : `<span class="${cls}">${conteudo}</span>`;
    },
    figura(a) {
        return a.imagem
            ? `<img src="${esc(a.imagem)}" alt="Tela do ${esc(a.nome)}" loading="lazy" width="480" height="300">`
            : `<span class="app-fig-vazia" aria-hidden="true">${esc(a.nome.slice(0, 2).toUpperCase())}</span>`;
    },
    rodape(a) {
        return `<div class="app-rodape">
            ${(a.etiquetas || []).map((t) => `<span class="etiqueta">${esc(t)}</span>`).join('')}
            ${a.url ? '' : '<span class="etiqueta etiqueta-aviso">endereço a cadastrar</span>'}
            ${a.codigo ? `<a class="app-codigo" href="${esc(a.codigo)}" target="_blank" rel="noopener" data-codigo="${esc(a.id)}">código ↗</a>` : ''}
        </div>`;
    },

    montarDestaque() {
        const a = this.destaque(), el = $('#destaque');
        el.hidden = !a;
        if (!a) { el.innerHTML = ''; return; }
        el.innerHTML = `<div class="destaque" data-app="${esc(a.id)}">
            ${this.linkApp(a, this.figura(a), 'app-fig')}
            <div class="app-texto">
                <span class="destaque-rotulo">comece por aqui</span>
                <div class="app-titulo"><h2>${this.linkApp(a, esc(a.nome), 'app-nome')}</h2><span class="app-estado" data-estado="${esc(a.id)}"></span></div>
                <p>${esc(a.descricao)}</p>
                ${a.url ? `<p><a class="btn btn-primary" href="${esc(a.url)}" target="_blank" rel="noopener" data-abrir="${esc(a.id)}">Abrir ${esc(a.nome)} ▶</a></p>` : ''}
                ${this.rodape(a)}
            </div>
        </div>`;
    },

    montarCategorias() {
        const sep = this.separados();
        $('#separados').hidden = !sep.length;
        $('#categorias').innerHTML = this.categoriasComApps().map((c) => `
            <section class="card categoria" id="cat-${esc(c.id)}">
                <div class="card-topo"><h2>${esc(c.nome)}</h2><small>${esc(c.descricao)}</small></div>
                <ul class="lista-apps">${sep.filter((a) => a.categoria === c.id).map((a) => this.itemApp(a)).join('')}</ul>
            </section>`).join('');
    },

    itemApp(a) {
        return `<li class="app-item" data-app="${esc(a.id)}">
            ${this.linkApp(a, this.figura(a), 'app-fig')}
            <div class="app-texto">
                <div class="app-titulo">${this.linkApp(a, esc(a.nome), 'app-nome')}<span class="app-estado" data-estado="${esc(a.id)}"></span></div>
                <p>${esc(a.descricao)}</p>
                ${this.rodape(a)}
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
        const link = (href, txt, num) => `<a class="sidebar-link" href="${href}">${num !== undefined ? `<span class="sidebar-num">${num}</span>` : ''}<span>${esc(txt)}</span></a>`;
        const d = this.destaque();
        let h = link('#inicio', 'Início', '⌂');
        if (d) h += link('#destaque', d.nome, '★');
        if (this.categoriasComApps().length) {
            h += '<span class="sidebar-grupo">Apps separados</span>';
            if (this.fluxo().length >= 2) h += link('#fluxo', 'Fluxo de projetos', '→');
            h += this.categoriasComApps().map((c) => link(`#cat-${esc(c.id)}`, c.nome, this.separados().filter((a) => a.categoria === c.id).length)).join('');
        }
        h += '<span class="sidebar-grupo">Jogo</span>' + link('#progresso', 'Missões e medalhas', '🏅');
        h += '<span class="sidebar-grupo">Créditos</span>' + link('#agradecimento', 'Agradecimento', '💪');
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
            'Cada missão cumprida dá uma medalha e um bônus. Só conta o que é aberto a partir desta central, neste navegador.'
        ].map((t) => `<li>${t}</li>`).join('');
    },

    // ------------------------------------------------------------ placar
    renderProgresso() {
        const e = this.estado, n = Gamificacao.nivel(e.xp);
        const pct = Math.round(n.frac * 100);
        const barra = (cls) => `<span class="barra-xp ${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></span>`;
        const prox = n.proximo ? ` · faltam ${n.falta} XP para <b>${esc(n.proximo.nome)}</b>` : ' · nível máximo';
        $('#progresso-nivel').innerHTML = `<div class="nivel"><span class="nivel-icone">${n.icone}</span>
            <div><small>Seu nível</small><b>${esc(n.nome)}</b><span>${e.xp} XP${prox}</span></div></div>${barra('grande')}`;
        $('#sidebar-nivel').innerHTML = `<b>${n.icone} ${esc(n.nome)}</b><span>${e.xp} XP</span>${barra('')}`;
        $('#xp-topo').innerHTML = `<span>${n.icone} <b>${esc(n.nome)}</b></span>${barra('mini')}<span class="xp-num">${e.xp} XP</span>`;

        // próxima missão
        const pm = Gamificacao.proximaMissao(e, APPS, FLUXO);
        let botao = '';
        if (pm) {
            const al = pm.alvo, a = al.abrir ? this.app(al.abrir) : al.codigo ? this.app(al.codigo) : null;
            if (al.abrir && a) botao = `<a class="btn btn-primary" href="${esc(a.url)}" target="_blank" rel="noopener" data-abrir="${esc(a.id)}">Abrir ${esc(a.nome)} ▶</a>`;
            else if (al.codigo && a) botao = `<a class="btn btn-primary" href="${esc(a.codigo)}" target="_blank" rel="noopener" data-codigo="${esc(a.id)}">Ver o código de ${esc(a.nome)} ▶</a>`;
            else if (al.falstad) botao = '<a class="btn btn-primary" href="https://www.falstad.com/mathphysics.html" target="_blank" rel="noopener" data-falstad>Visitar a página do Prof. Falstad ▶</a>';
        }
        $('#proxima-missao').innerHTML = pm
            ? `<div class="proximo-passo"><div class="proximo-passo-texto"><span class="proximo-passo-rotulo">próxima missão</span> ${pm.missao.icone} <b>${esc(pm.missao.nome)}</b> <small>${esc(pm.missao.texto)} · +${pm.missao.bonus} XP</small></div>${botao}</div>`
            : '';

        const lista = Gamificacao.missoesAtivas(APPS, FLUXO);
        const feitas = lista.filter(({ m }) => e.medalhas[m.id]).length;
        $('#medalhas-contagem').textContent = `${feitas} de ${lista.length}`;
        $('#medalhas-lista').innerHTML = lista.map(({ m }) => {
            const ok = !!e.medalhas[m.id];
            return `<div class="medalha ${ok ? 'ganha' : ''}" title="${ok ? 'Ganha em ' + esc(dataBR(e.medalhas[m.id])) : 'Ainda não ganha'}">
                <span>${m.icone}</span><b>${esc(m.nome)}</b><small>${esc(m.texto)} · +${m.bonus} XP</small></div>`;
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
        const r = Gamificacao.registrar(this.estado, tipo, id, APPS, FLUXO);
        this.estado = r.estado;
        Gamificacao.salvar(r.estado);
        this.renderProgresso();
        if (r.ganho > 0 && tipo !== 'visita') this.soltarXP(r.ganho);
        if (r.novas.length) this.comemorarMedalha(r.novas[0]);
        if (r.subiu) { const n = Gamificacao.nivel(r.estado.xp); this.avisar(`${n.icone} Subiu de nível: <b>${esc(n.nome)}</b>!`); }
    },

    // ------------------------------------------------------------ efeitos (os mesmos do Apoio à Escrita de Patentes)
    soltarXP(n) {
        const el = document.createElement('div'); el.className = 'xp-voa'; el.textContent = `+${n} XP`;
        document.body.appendChild(el); setTimeout(() => el.remove(), 1400);
    },
    comemorarMedalha(m) {
        const el = document.createElement('div'); el.className = 'medalha-pop';
        el.innerHTML = `<span>${m.icone}</span><div><small>Nova medalha!</small><b>${esc(m.nome)}</b><small>${esc(m.texto)}</small></div>`;
        document.body.appendChild(el); setTimeout(() => el.classList.add('sai'), 3200); setTimeout(() => el.remove(), 3800);
        this.confete();
    },
    confete() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const c = document.createElement('div'); c.className = 'confete';
        for (let i = 0; i < 40; i++) {
            const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%';
            s.style.background = ['#a8e156', '#409580', '#d4a017', '#085357', '#e57373'][i % 5]; s.style.animationDelay = Math.random() * 0.4 + 's'; c.appendChild(s);
        }
        document.body.appendChild(c); setTimeout(() => c.remove(), 2200);
    },
    avisar(html) {
        const el = $('#aviso');
        el.innerHTML = html;
        el.classList.add('visivel');
        clearTimeout(this._aviso);
        this._aviso = setTimeout(() => el.classList.remove('visivel'), 4500);
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
            if (a.closest('.sidebar') && (a.getAttribute('href') || '').startsWith('#')) this.menu(false);
        };
        document.addEventListener('click', clique);
        document.addEventListener('auxclick', clique);
        document.addEventListener('click', (ev) => {
            const b = ev.target.closest('[data-acao]');
            if (!b) return;
            if (b.dataset.acao === 'zerar' && confirm('Zerar o XP e as medalhas deste navegador?')) { this.estado = Gamificacao.zerar(); this.evento('visita'); }
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

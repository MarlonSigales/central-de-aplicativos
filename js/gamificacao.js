/**
 * © 2026 Central de Aplicativos — Marlon Sigales. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * Gamificação: XP, níveis e conquistas. Conta só o que é feito a partir desta central, neste navegador
 * (localStorage). Nada sai do computador de quem usa.
 *
 * Regras de XP (tabela XP abaixo):
 *   abrir um app pela 1ª vez ........ +20    abrir de novo em outro dia ... +5 (1 vez por app por dia)
 *   ver o código de um app (1ª vez) .. +5     voltar à central em outro dia  +3
 *   visitar a página do Prof. Falstad  +10    cada conquista ............... bônus próprio
 *
 * As conquistas que dependem de um app somem sozinhas quando o app sai do catálogo (js/apps.js).
 * Funções puras (recebem o estado e devolvem o estado novo) para poderem ser testadas sem navegador.
 */

'use strict';

const Gamificacao = (() => {
    const CHAVE = 'central-apps-progresso';
    const VERSAO = 1;
    const XP = { abrirPrimeira: 20, abrirOutroDia: 5, codigo: 5, novoDia: 3, falstad: 10 };

    const NIVEIS = [
        { xp: 0, nome: 'Visitante' },
        { xp: 30, nome: 'Aprendiz' },
        { xp: 80, nome: 'Projetista' },
        { xp: 150, nome: 'Engenheiro' },
        { xp: 250, nome: 'Especialista' },
        { xp: 400, nome: 'Mestre' }
    ];

    /** Apps que contam: ativos e com endereço. */
    const appsContaveis = (apps) => apps.filter((a) => a.ativo && a.url);
    const idsFluxo = (apps, fluxo) => {
        const ok = new Set(appsContaveis(apps).map((a) => a.id));
        return fluxo.map((f) => f.app).filter((id) => ok.has(id));
    };
    const abriu = (e, id) => !!e.abertos[id];

    /**
     * Conquistas. requer(apps, fluxo) → ids de apps necessários (null = a conquista não se aplica e fica escondida).
     */
    const CONQUISTAS = [
        {
            id: 'primeiro-passo', icone: '🚀', nome: 'Primeiro passo', bonus: 5,
            texto: 'Abrir um aplicativo pela central.',
            requer: (apps) => (appsContaveis(apps).length ? [] : null),
            feita: (e) => Object.keys(e.abertos).length >= 1
        },
        {
            id: 'fluxo-projeto', icone: '🧭', nome: 'Fluxo de projeto', bonus: 25,
            texto: 'Abrir todos os apps do fluxo de projetos.',
            requer: (apps, fluxo) => { const ids = idsFluxo(apps, fluxo); return ids.length >= 2 ? ids : null; },
            feita: (e, ids) => ids.every((id) => abriu(e, id))
        },
        {
            id: 'fluxo-na-ordem', icone: '🪜', nome: 'Na ordem certa', bonus: 20,
            texto: 'Abrir pela 1ª vez os apps do fluxo na ordem das fases.',
            requer: (apps, fluxo) => { const ids = idsFluxo(apps, fluxo); return ids.length >= 2 ? ids : null; },
            feita: (e, ids) => {
                const seq = e.sequencia.filter((id) => ids.includes(id));
                return seq.length === ids.length && seq.every((id, i) => id === ids[i]);
            }
        },
        {
            id: 'energia-rural', icone: '⚡', nome: 'Energização rural', bonus: 15,
            texto: 'Abrir o Projeto Elétrico Agroindustrial e o Off-grid.',
            requer: (apps) => exigir(apps, ['eletrico', 'offgrid']),
            feita: (e, ids) => ids.every((id) => abriu(e, id))
        },
        {
            id: 'projeto-a-planta', icone: '🏭', nome: 'Do projeto à planta', bonus: 15,
            texto: 'Abrir a Gestão de Projetos e o Supervisório MQTT.',
            requer: (apps) => exigir(apps, ['gestao', 'mqtt']),
            feita: (e, ids) => ids.every((id) => abriu(e, id))
        },
        {
            id: 'colecionador', icone: '🏆', nome: 'Colecionador', bonus: 40,
            texto: 'Abrir todos os aplicativos da central.',
            requer: (apps) => { const ids = appsContaveis(apps).map((a) => a.id); return ids.length >= 2 ? ids : null; },
            feita: (e, ids) => ids.every((id) => abriu(e, id))
        },
        {
            id: 'curioso', icone: '🔍', nome: 'Curioso', bonus: 10,
            texto: 'Ver o código de 3 aplicativos.',
            requer: (apps) => (apps.filter((a) => a.ativo && a.codigo).length ? [] : null),
            feita: (e, _ids, apps) => {
                const com = apps.filter((a) => a.ativo && a.codigo).map((a) => a.id);
                return com.filter((id) => e.codigos[id]).length >= Math.min(3, com.length);
            }
        },
        {
            id: 'frequentador', icone: '📅', nome: 'Frequentador', bonus: 15,
            texto: 'Voltar à central em 3 dias diferentes.',
            requer: () => [],
            feita: (e) => e.dias.length >= 3
        },
        {
            id: 'obrigado-falstad', icone: '🙏', nome: 'Obrigado, Prof. Falstad', bonus: 5,
            texto: 'Visitar a página de aplicativos que inspirou esta central.',
            requer: () => [],
            feita: (e) => !!e.falstad
        }
    ];

    function exigir(apps, ids) {
        const ok = new Set(appsContaveis(apps).map((a) => a.id));
        return ids.every((id) => ok.has(id)) ? ids : null;
    }

    function hoje(d = new Date()) {
        const p = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }

    function novoEstado() {
        return { v: VERSAO, xp: 0, abertos: {}, codigos: {}, dias: [], sequencia: [], falstad: false, conquistas: {} };
    }

    /** Completa ou conserta um estado lido do navegador (nunca lança erro). */
    function normalizar(e) {
        const n = novoEstado();
        if (!e || typeof e !== 'object') return n;
        n.xp = Number.isFinite(e.xp) && e.xp >= 0 ? Math.floor(e.xp) : 0;
        if (e.abertos && typeof e.abertos === 'object') {
            Object.entries(e.abertos).forEach(([id, r]) => {
                if (r && typeof r === 'object') n.abertos[id] = { primeira: String(r.primeira || ''), ultimoDia: String(r.ultimoDia || ''), vezes: Math.max(1, parseInt(r.vezes, 10) || 1) };
            });
        }
        if (e.codigos && typeof e.codigos === 'object') Object.keys(e.codigos).forEach((id) => { if (e.codigos[id]) n.codigos[id] = true; });
        if (Array.isArray(e.dias)) n.dias = [...new Set(e.dias.filter((d) => typeof d === 'string'))];
        if (Array.isArray(e.sequencia)) n.sequencia = [...new Set(e.sequencia.filter((d) => typeof d === 'string'))];
        n.falstad = !!e.falstad;
        if (e.conquistas && typeof e.conquistas === 'object') Object.keys(e.conquistas).forEach((id) => { n.conquistas[id] = String(e.conquistas[id]); });
        return n;
    }

    /** Conquistas que se aplicam ao catálogo atual, com ids exigidos. */
    function conquistasAtivas(apps, fluxo) {
        return CONQUISTAS.map((c) => ({ c, ids: c.requer(apps, fluxo) })).filter((x) => x.ids !== null);
    }

    /** Dá as conquistas recém-cumpridas. Devolve { estado, novas: [conquista] }. */
    function verificar(e, apps, fluxo, dia) {
        const novas = [];
        conquistasAtivas(apps, fluxo).forEach(({ c, ids }) => {
            if (!e.conquistas[c.id] && c.feita(e, ids, apps)) {
                e.conquistas[c.id] = dia;
                e.xp += c.bonus;
                novas.push(c);
            }
        });
        return { estado: e, novas };
    }

    /**
     * Registra um evento e devolve { estado, ganho, novas }.
     * tipo: 'visita' | 'abrir' (id) | 'codigo' (id) | 'falstad'
     */
    function registrar(estado, tipo, id, apps, fluxo, dia = hoje()) {
        const e = normalizar(estado);
        const antes = e.xp;
        const contaveis = new Set(appsContaveis(apps).map((a) => a.id));
        const comCodigo = new Set(apps.filter((a) => a.ativo && a.codigo).map((a) => a.id));
        if (tipo === 'visita') {
            if (!e.dias.includes(dia)) { if (e.dias.length) e.xp += XP.novoDia; e.dias.push(dia); }
        } else if (tipo === 'abrir' && contaveis.has(id)) {
            const r = e.abertos[id];
            if (!r) { e.abertos[id] = { primeira: dia, ultimoDia: dia, vezes: 1 }; e.sequencia.push(id); e.xp += XP.abrirPrimeira; }
            else { r.vezes += 1; if (r.ultimoDia !== dia) { r.ultimoDia = dia; e.xp += XP.abrirOutroDia; } }
        } else if (tipo === 'codigo' && comCodigo.has(id)) {
            if (!e.codigos[id]) { e.codigos[id] = true; e.xp += XP.codigo; }
        } else if (tipo === 'falstad') {
            if (!e.falstad) { e.falstad = true; e.xp += XP.falstad; }
        }
        const { novas } = verificar(e, apps, fluxo, dia);
        return { estado: e, ganho: e.xp - antes, novas };
    }

    /** Nível atual, próximo nível e fração de progresso até ele. */
    function nivel(xp) {
        let i = 0;
        while (i + 1 < NIVEIS.length && xp >= NIVEIS[i + 1].xp) i++;
        const atual = NIVEIS[i], prox = NIVEIS[i + 1] || null;
        const frac = prox ? (xp - atual.xp) / (prox.xp - atual.xp) : 1;
        return { numero: i + 1, nome: atual.nome, xp, proximo: prox, falta: prox ? prox.xp - xp : 0, frac: Math.max(0, Math.min(1, frac)) };
    }

    // ---------------------------------------------------------------- navegador
    function carregar() {
        try { return normalizar(JSON.parse(localStorage.getItem(CHAVE) || 'null')); } catch (_) { return novoEstado(); }
    }
    function salvar(e) {
        try { localStorage.setItem(CHAVE, JSON.stringify(e)); return true; } catch (_) { return false; }
    }
    function zerar() {
        try { localStorage.removeItem(CHAVE); } catch (_) { /* sem armazenamento */ }
        return novoEstado();
    }

    return { XP, NIVEIS, CONQUISTAS, novoEstado, normalizar, registrar, verificar, conquistasAtivas, nivel, hoje, carregar, salvar, zerar };
})();

if (typeof module !== 'undefined') module.exports = Gamificacao;

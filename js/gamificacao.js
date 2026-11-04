/**
 * © 2026 Central de Aplicativos — Marlon Sigales. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * Jogo de missões (o mesmo do Apoio à Escrita de Patentes): cada missão cumprida dá XP, o XP sobe o nível
 * e cada missão rende uma medalha. Conta só o que é feito a partir desta central, neste navegador
 * (localStorage). Nada sai do computador de quem usa.
 *
 * Regras de XP (tabela XP abaixo):
 *   abrir um app pela 1ª vez ........ +20    abrir de novo em outro dia ... +5 (1 vez por app por dia)
 *   ver o código de um app (1ª vez) .. +5     voltar à central em outro dia  +3
 *   visitar a página do Prof. Falstad  +10    cada medalha ................. bônus próprio
 *
 * As missões que dependem de um app somem sozinhas quando o app sai do catálogo (js/apps.js).
 * Funções puras (recebem o estado e devolvem o estado novo) para poderem ser testadas sem navegador.
 */

'use strict';

const Gamificacao = (() => {
    const CHAVE = 'central-apps-progresso';
    const VERSAO = 2;
    const XP = { abrirPrimeira: 20, abrirOutroDia: 5, codigo: 5, novoDia: 3, falstad: 10 };

    const NIVEIS = [
        { xp: 0, nome: 'Curioso(a)', icone: '🌱' },
        { xp: 30, nome: 'Explorador(a)', icone: '🧭' },
        { xp: 80, nome: 'Projetista', icone: '🔧' },
        { xp: 150, nome: 'Engenheiro(a)', icone: '⚙️' },
        { xp: 250, nome: 'Especialista', icone: '🔬' },
        { xp: 400, nome: 'Mestre dos aplicativos', icone: '🏆' }
    ];

    /** Apps que contam: ativos e com endereço. */
    const appsContaveis = (apps) => apps.filter((a) => a.ativo && a.url);
    const comCodigo = (apps) => apps.filter((a) => a.ativo && a.codigo).map((a) => a.id);
    const idsFluxo = (apps, fluxo) => {
        const ok = new Set(appsContaveis(apps).map((a) => a.id));
        return fluxo.map((f) => f.app).filter((id) => ok.has(id));
    };
    const abriu = (e, id) => !!e.abertos[id];
    const primeiroSemAbrir = (e, ids) => ids.find((id) => !abriu(e, id)) || null;

    function exigir(apps, ids) {
        const ok = new Set(appsContaveis(apps).map((a) => a.id));
        return ids.every((id) => ok.has(id)) ? ids : null;
    }

    /**
     * Missões, na ordem em que são sugeridas. Cada uma rende a sua medalha.
     *   requer(apps, fluxo) → ids de apps necessários (null = a missão não se aplica e fica escondida)
     *   feita(estado, ids, apps) → true quando cumprida
     *   alvo(estado, ids, apps) → o que fazer para cumprir: { abrir: id } | { codigo: id } | { falstad: true } | null
     */
    const MISSOES = [
        {
            id: 'rumo-certo', icone: '🎯', nome: 'Rumo certo', bonus: 10,
            texto: 'Começar pela Gestão de Projetos: abrir ela antes dos outros apps.',
            requer: (apps) => exigir(apps, ['gestao']),
            feita: (e) => e.sequencia[0] === 'gestao',
            alvo: (e) => (e.sequencia.length ? null : { abrir: 'gestao' })
        },
        {
            id: 'primeiro-passo', icone: '🚀', nome: 'Primeiro passo', bonus: 5,
            texto: 'Abrir um aplicativo pela central.',
            requer: (apps) => (appsContaveis(apps).length ? [] : null),
            feita: (e) => Object.keys(e.abertos).length >= 1,
            alvo: (_e, _ids, apps) => ({ abrir: appsContaveis(apps)[0].id })
        },
        {
            id: 'fluxo-projeto', icone: '🧭', nome: 'Fluxo de projeto', bonus: 25,
            texto: 'Abrir os apps do fluxo de projetos.',
            requer: (apps, fluxo) => { const ids = idsFluxo(apps, fluxo); return ids.length >= 2 ? ids : null; },
            feita: (e, ids) => ids.every((id) => abriu(e, id)),
            alvo: (e, ids) => ({ abrir: primeiroSemAbrir(e, ids) })
        },
        {
            id: 'inventor', icone: '💡', nome: 'Inventor(a)', bonus: 10,
            texto: 'Abrir o Apoio à Escrita de Patentes.',
            requer: (apps) => exigir(apps, ['patentes']),
            feita: (e, ids) => ids.every((id) => abriu(e, id)),
            alvo: () => ({ abrir: 'patentes' })
        },
        {
            id: 'energia-rural', icone: '⚡', nome: 'Energização rural', bonus: 15,
            texto: 'Abrir o Projeto Elétrico Agroindustrial e o Off-grid.',
            requer: (apps) => exigir(apps, ['eletrico', 'offgrid']),
            feita: (e, ids) => ids.every((id) => abriu(e, id)),
            alvo: (e, ids) => ({ abrir: primeiroSemAbrir(e, ids) })
        },
        {
            id: 'projeto-a-planta', icone: '🏭', nome: 'Do projeto à planta', bonus: 15,
            texto: 'Abrir a Gestão de Projetos e o Supervisório MQTT.',
            requer: (apps) => exigir(apps, ['gestao', 'mqtt']),
            feita: (e, ids) => ids.every((id) => abriu(e, id)),
            alvo: (e, ids) => ({ abrir: primeiroSemAbrir(e, ids) })
        },
        {
            id: 'curioso', icone: '🔍', nome: 'Curioso(a) pelo código', bonus: 10,
            texto: 'Ver o código de 3 aplicativos.',
            requer: (apps) => (comCodigo(apps).length ? [] : null),
            feita: (e, _ids, apps) => { const c = comCodigo(apps); return c.filter((id) => e.codigos[id]).length >= Math.min(3, c.length); },
            alvo: (e, _ids, apps) => { const id = comCodigo(apps).find((x) => !e.codigos[x]); return id ? { codigo: id } : null; }
        },
        {
            id: 'obrigado-falstad', icone: '💪', nome: 'Obrigado, Prof. Falstad', bonus: 5,
            texto: 'Visitar a página de aplicativos que inspirou esta central.',
            requer: () => [],
            feita: (e) => !!e.falstad,
            alvo: () => ({ falstad: true })
        },
        {
            id: 'colecionador', icone: '🏆', nome: 'Colecionador(a)', bonus: 40,
            texto: 'Abrir todos os aplicativos da central.',
            requer: (apps) => { const ids = appsContaveis(apps).map((a) => a.id); return ids.length >= 2 ? ids : null; },
            feita: (e, ids) => ids.every((id) => abriu(e, id)),
            alvo: (e, ids) => ({ abrir: primeiroSemAbrir(e, ids) })
        },
        {
            id: 'frequentador', icone: '📅', nome: 'Frequentador(a)', bonus: 15,
            texto: 'Voltar à central em 3 dias diferentes.',
            requer: () => [],
            feita: (e) => e.dias.length >= 3,
            alvo: () => null
        }
    ];

    function hoje(d = new Date()) {
        const p = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }

    function novoEstado() {
        return { v: VERSAO, xp: 0, abertos: {}, codigos: {}, dias: [], sequencia: [], falstad: false, medalhas: {} };
    }

    /** Completa ou conserta um estado lido do navegador (nunca lança erro). Aceita a versão 1 (conquistas). */
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
        const med = e.medalhas || e.conquistas;
        if (med && typeof med === 'object') Object.keys(med).forEach((id) => { n.medalhas[id] = String(med[id]); });
        return n;
    }

    /** Missões que se aplicam ao catálogo atual, com os ids exigidos. */
    function missoesAtivas(apps, fluxo) {
        return MISSOES.map((m) => ({ m, ids: m.requer(apps, fluxo) })).filter((x) => x.ids !== null);
    }

    /** Dá as medalhas das missões recém-cumpridas. Devolve { estado, novas: [missão] }. */
    function verificar(e, apps, fluxo, dia) {
        const novas = [];
        missoesAtivas(apps, fluxo).forEach(({ m, ids }) => {
            if (!e.medalhas[m.id] && m.feita(e, ids, apps)) {
                e.medalhas[m.id] = dia;
                e.xp += m.bonus;
                novas.push(m);
            }
        });
        return { estado: e, novas };
    }

    /** A próxima missão que dá para cumprir agora: { missao, alvo } ou null. */
    function proximaMissao(e, apps, fluxo) {
        for (const { m, ids } of missoesAtivas(apps, fluxo)) {
            if (e.medalhas[m.id]) continue;
            const alvo = m.alvo(e, ids, apps);
            if (alvo && (alvo.abrir || alvo.codigo || alvo.falstad)) return { missao: m, alvo };
        }
        return null;
    }

    /**
     * Registra um evento e devolve { estado, ganho, novas, subiu }.
     * tipo: 'visita' | 'abrir' (id) | 'codigo' (id) | 'falstad'
     */
    function registrar(estado, tipo, id, apps, fluxo, dia = hoje()) {
        const e = normalizar(estado);
        const antes = e.xp;
        const contaveis = new Set(appsContaveis(apps).map((a) => a.id));
        if (tipo === 'visita') {
            if (!e.dias.includes(dia)) { if (e.dias.length) e.xp += XP.novoDia; e.dias.push(dia); }
        } else if (tipo === 'abrir' && contaveis.has(id)) {
            const r = e.abertos[id];
            if (!r) { e.abertos[id] = { primeira: dia, ultimoDia: dia, vezes: 1 }; e.sequencia.push(id); e.xp += XP.abrirPrimeira; }
            else { r.vezes += 1; if (r.ultimoDia !== dia) { r.ultimoDia = dia; e.xp += XP.abrirOutroDia; } }
        } else if (tipo === 'codigo' && comCodigo(apps).includes(id)) {
            if (!e.codigos[id]) { e.codigos[id] = true; e.xp += XP.codigo; }
        } else if (tipo === 'falstad') {
            if (!e.falstad) { e.falstad = true; e.xp += XP.falstad; }
        }
        const { novas } = verificar(e, apps, fluxo, dia);
        return { estado: e, ganho: e.xp - antes, novas, subiu: nivel(e.xp).numero > nivel(antes).numero };
    }

    /** Nível atual, próximo nível e fração de progresso até ele. */
    function nivel(xp) {
        let i = 0;
        while (i + 1 < NIVEIS.length && xp >= NIVEIS[i + 1].xp) i++;
        const atual = NIVEIS[i], prox = NIVEIS[i + 1] || null;
        const frac = prox ? (xp - atual.xp) / (prox.xp - atual.xp) : 1;
        return { numero: i + 1, nome: atual.nome, icone: atual.icone, xp, proximo: prox, falta: prox ? prox.xp - xp : 0, frac: Math.max(0, Math.min(1, frac)) };
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

    return { XP, NIVEIS, MISSOES, novoEstado, normalizar, registrar, verificar, missoesAtivas, proximaMissao, nivel, hoje, carregar, salvar, zerar };
})();

if (typeof module !== 'undefined') module.exports = Gamificacao;

/**
 * © 2026 Central de Aplicativos — Marlon Sigales. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * Testes automáticos do catálogo e da gamificação. Rodam no navegador (tests/testes.html) ou no Node:
 *   node tests/testes.js
 * Não mexem no progresso salvo.
 */

'use strict';

let G, CAT, APP, FLX;
if (typeof module !== 'undefined' && typeof window === 'undefined') {
    const fs = require('fs'), path = require('path'), vm = require('vm');
    const ctx = { module: { exports: {} } };
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/apps.js'), 'utf8') + ';this.CATEGORIAS=CATEGORIAS;this.APPS=APPS;this.FLUXO=FLUXO;', ctx);
    CAT = ctx.CATEGORIAS; APP = ctx.APPS; FLX = ctx.FLUXO;
    G = require('../js/gamificacao.js');
} else {
    G = Gamificacao; CAT = CATEGORIAS; APP = APPS; FLX = FLUXO; // eslint-disable-line no-undef
}

const TESTES = [];
function teste(nome, f) { TESTES.push({ nome, f }); }
function ok(c, msg) { if (!c) throw new Error(msg || 'condição falsa'); }
function igual(a, b, msg) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg || ''} esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`); }
const copia = (x) => JSON.parse(JSON.stringify(x));
const ids = (lista) => lista.map((x) => x.m.id);

// ---------------------------------------------------------------- catálogo
teste('Catálogo: ids únicos, categoria conhecida e campos obrigatórios', () => {
    const vistos = new Set(), cats = new Set(CAT.map((c) => c.id));
    APP.forEach((a) => {
        ok(/^[a-z0-9-]+$/.test(a.id), `id inválido: ${a.id}`);
        ok(!vistos.has(a.id), `id repetido: ${a.id}`); vistos.add(a.id);
        ok(cats.has(a.categoria), `${a.id}: categoria ${a.categoria} não existe`);
        ok(typeof a.ativo === 'boolean', `${a.id}: ativo deve ser true ou false`);
        ok(a.nome && a.descricao, `${a.id}: falta nome ou descrição`);
        ok(a.url === '' || /^https:\/\//.test(a.url), `${a.id}: url deve ser https ou vazia`);
    });
});

teste('Fluxo aponta só para apps do catálogo', () => {
    const t = new Set(APP.map((a) => a.id));
    FLX.forEach((f) => ok(t.has(f.app), `fluxo cita ${f.app}, que não está no catálogo`));
});

// ---------------------------------------------------------------- XP e níveis
teste('Abrir um app: +20 na 1ª vez, nada no mesmo dia, +5 em outro dia', () => {
    let r = G.registrar(G.novoEstado(), 'abrir', 'qfd', APP, FLX, '2026-11-03');
    igual(r.estado.abertos.qfd.vezes, 1); ok(r.subiu === false);
    ok(r.estado.medalhas['primeiro-passo'], 'primeiro passo');
    igual(r.estado.xp, 20 + 5, 'abrir + bônus do primeiro passo');
    r = G.registrar(r.estado, 'abrir', 'qfd', APP, FLX, '2026-11-03'); igual(r.ganho, 0, 'mesmo dia');
    r = G.registrar(r.estado, 'abrir', 'qfd', APP, FLX, '2026-11-04'); igual(r.ganho, 5, 'outro dia');
    igual(r.estado.abertos.qfd.vezes, 3);
});

teste('App inativo ou sem endereço não conta', () => {
    const apps = copia(APP); apps.find((a) => a.id === 'qfd').ativo = false;
    let r = G.registrar(G.novoEstado(), 'abrir', 'qfd', apps, FLX, '2026-11-03'); igual(r.ganho, 0, 'inativo');
    const sem = copia(APP); sem.find((a) => a.id === 'mcdac').url = '';
    r = G.registrar(G.novoEstado(), 'abrir', 'mcdac', sem, FLX, '2026-11-03'); igual(r.ganho, 0, 'sem url');
    r = G.registrar(G.novoEstado(), 'abrir', 'nao-existe', APP, FLX, '2026-11-03'); igual(r.ganho, 0, 'id desconhecido');
});

teste('Visita: 1º dia sem XP, outro dia +3; 3 dias dão Frequentador', () => {
    let e = G.registrar(G.novoEstado(), 'visita', null, APP, FLX, '2026-11-01').estado; igual(e.xp, 0);
    let r = G.registrar(e, 'visita', null, APP, FLX, '2026-11-01'); igual(r.ganho, 0, 'mesmo dia');
    r = G.registrar(r.estado, 'visita', null, APP, FLX, '2026-11-02'); igual(r.ganho, 3);
    r = G.registrar(r.estado, 'visita', null, APP, FLX, '2026-11-05');
    ok(r.estado.medalhas.frequentador); igual(r.ganho, 3 + 15);
});

teste('Níveis: limites e fração', () => {
    igual(G.nivel(0).numero, 1); igual(G.nivel(29).numero, 1); igual(G.nivel(30).numero, 2);
    igual(G.nivel(55).frac, 0.5); igual(G.nivel(9999).nome, 'Mestre dos aplicativos'); igual(G.nivel(9999).falta, 0);
});

// ---------------------------------------------------------------- conquistas
teste('Rumo certo só vale se a Gestão de Projetos for o primeiro app aberto', () => {
    let e = G.novoEstado();
    ['gestao', 'qfd', 'conceitual'].forEach((id) => { e = G.registrar(e, 'abrir', id, APP, FLX, '2026-11-03').estado; });
    ok(e.medalhas['rumo-certo'] && e.medalhas['fluxo-projeto'], 'gestão primeiro + fluxo');
    let f = G.novoEstado();
    ['qfd', 'gestao'].forEach((id) => { f = G.registrar(f, 'abrir', id, APP, FLX, '2026-11-03').estado; });
    ok(!f.medalhas['rumo-certo'], 'começou pelo QFD');
});

teste('Próxima missão: começa pela Gestão e avança sozinha', () => {
    let e = G.novoEstado();
    igual(G.proximaMissao(e, APP, FLX).alvo, { abrir: 'gestao' });
    e = G.registrar(e, 'abrir', 'gestao', APP, FLX, '2026-11-03').estado;
    igual(G.proximaMissao(e, APP, FLX).missao.id, 'fluxo-projeto'); igual(G.proximaMissao(e, APP, FLX).alvo, { abrir: 'qfd' });
    const apps = APP.filter((a) => a.id !== 'gestao');
    igual(G.proximaMissao(G.novoEstado(), apps, FLX).missao.id, 'primeiro-passo', 'sem Gestão, a missão Rumo certo some');
});

teste('Progresso da versão 1 (conquistas) é aproveitado', () => {
    const e = G.normalizar({ xp: 40, conquistas: { 'primeiro-passo': '2026-11-03' } });
    igual(e.medalhas['primeiro-passo'], '2026-11-03');
});

teste('Colecionador exige todos os apps com endereço', () => {
    let e = G.novoEstado();
    APP.filter((a) => a.ativo && a.url).forEach((a) => { e = G.registrar(e, 'abrir', a.id, APP, FLX, '2026-11-03').estado; });
    ok(e.medalhas.colecionador); ok(e.medalhas['energia-rural']); ok(e.medalhas['projeto-a-planta']); ok(e.medalhas.inventor);
});

teste('Código e Falstad dão XP uma vez só', () => {
    let r = G.registrar(G.novoEstado(), 'codigo', 'qfd', APP, FLX, '2026-11-03'); igual(r.ganho, 5);
    r = G.registrar(r.estado, 'codigo', 'qfd', APP, FLX, '2026-11-03'); igual(r.ganho, 0);
    r = G.registrar(r.estado, 'falstad', null, APP, FLX, '2026-11-03'); igual(r.ganho, 10 + 5);
    r = G.registrar(r.estado, 'falstad', null, APP, FLX, '2026-11-03'); igual(r.ganho, 0);
});

// ---------------------------------------------------------------- exclusão facilitada
teste('Desativar um app esconde as missões que dependem dele', () => {
    const apps = copia(APP); apps.find((a) => a.id === 'offgrid').ativo = false;
    ok(!ids(G.missoesAtivas(apps, FLX)).includes('energia-rural'), 'energia-rural some');
    ok(ids(G.missoesAtivas(APP, FLX)).includes('energia-rural'), 'com o app, aparece');
});

teste('Apagar o bloco de um app do fluxo: fluxo e missões se ajustam', () => {
    const apps = APP.filter((a) => a.id !== 'conceitual');
    let e = G.novoEstado();
    ['qfd', 'gestao'].forEach((id) => { e = G.registrar(e, 'abrir', id, apps, FLX, '2026-11-03').estado; });
    ok(e.medalhas['fluxo-projeto'] && e.medalhas['rumo-certo'] === undefined, 'fluxo com 2 fases (QFD aberto antes da Gestão)');
});

teste('Catálogo sem apps não quebra', () => {
    igual(G.missoesAtivas([], []).map((x) => x.m.id).sort(), ['frequentador', 'obrigado-falstad']);
    igual(G.registrar(G.novoEstado(), 'abrir', 'qfd', [], [], '2026-11-03').ganho, 0);
});

teste('Progresso salvo antigo ou corrompido é consertado', () => {
    igual(G.normalizar(null).xp, 0);
    const e = G.normalizar({ xp: -4, abertos: { qfd: { vezes: 'x' }, ruim: 3 }, dias: ['2026-11-01', 7, '2026-11-01'], conquistas: { a: '2026-11-01' } });
    igual(e.xp, 0); igual(e.abertos.qfd.vezes, 1); ok(!e.abertos.ruim); igual(e.dias, ['2026-11-01']);
    const r = G.registrar({ xp: 10, abertos: { appApagado: { primeira: '2026-10-01', ultimoDia: '2026-10-01', vezes: 2 } } }, 'visita', null, APP, FLX, '2026-11-03');
    igual(r.estado.abertos.appApagado.vezes, 2, 'app que saiu do catálogo não quebra o progresso');
});

// ---------------------------------------------------------------- execução
function rodar() {
    const res = TESTES.map(({ nome, f }) => { try { f(); return { nome, ok: true }; } catch (e) { return { nome, ok: false, erro: e.message }; } });
    const falhas = res.filter((r) => !r.ok).length;
    if (typeof document !== 'undefined') {
        document.getElementById('lista').innerHTML = res.map((r) => `<li class="${r.ok ? 'ok' : 'falha'}">${r.nome}${r.ok ? '' : `<small>${r.erro}</small>`}</li>`).join('');
        document.getElementById('resultado').textContent = falhas ? `${falhas} de ${res.length} falharam` : `Todos os ${res.length} testes passaram`;
    } else {
        res.forEach((r) => console.log(`${r.ok ? '✓' : '✗'} ${r.nome}${r.ok ? '' : ' — ' + r.erro}`));
        console.log(falhas ? `${falhas} de ${res.length} falharam` : `Todos os ${res.length} testes passaram`);
        process.exitCode = falhas ? 1 : 0;
    }
}
rodar();

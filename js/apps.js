/**
 * © 2026 Central de Aplicativos — Marlon Sigales. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * CATÁLOGO DOS APLICATIVOS — este é o único arquivo que precisa mudar para pôr ou tirar um aplicativo.
 *
 * TIRAR UM APLICATIVO (exclusão facilitada):
 *   - Esconder sem apagar: troque  ativo: true  por  ativo: false  no bloco do app.
 *   - Excluir de vez: apague o bloco inteiro do app, de  {  até  },  (e a figura em img/apps/, se quiser).
 *   Não precisa mexer em mais nada: a página, o fluxo de projetos, as conquistas e o XP ignoram sozinhos
 *   os apps que não estão ativos. O progresso já guardado no navegador não quebra.
 *
 * PÔR UM APLICATIVO: copie um bloco, troque o id (único, sem espaço) e preencha os campos.
 *   url vazia ('') = aparece como "endereço a cadastrar", sem botão de abrir.
 */

'use strict';

/** Categorias, na ordem em que aparecem (como as seções da página do Prof. Falstad). */
const CATEGORIAS = [
    { id: 'produto', nome: 'Projeto de produto', descricao: 'Do que o cliente quer até o projeto gerido, com TRL e relatórios.' },
    { id: 'decisao', nome: 'Apoio à decisão', descricao: 'Escolher entre alternativas com critérios explícitos.' },
    { id: 'eletrica', nome: 'Instalações elétricas e energia', descricao: 'Apps didáticos de Energização Rural e de Projeto de Instalações Elétricas Agroindustriais.' },
    { id: 'automacao', nome: 'Automação e supervisão', descricao: 'Acompanhar e comandar plantas pelo navegador.' }
];

/** Aplicativos. */
const APPS = [
    {
        id: 'qfd',
        ativo: true,
        categoria: 'produto',
        nome: 'Sistema QFD',
        descricao: 'Casa da Qualidade: requisitos de cliente e de projeto, matriz QFD, avaliação competitiva e especificações.',
        url: 'https://marlonsigales.github.io/QFD/index.html',
        codigo: 'https://github.com/MarlonSigales/QFD',
        imagem: 'img/apps/qfd.jpg',
        etiquetas: ['projeto informacional', 'QFD']
    },
    {
        id: 'conceitual',
        ativo: true,
        categoria: 'produto',
        nome: 'Projeto Conceitual e Preliminar',
        descricao: 'Função global, estrutura de funções, princípios de solução, matriz morfológica, concepção e rodadas de protótipo.',
        url: 'https://marlonsigales.github.io/ProjetoConceitual/',
        codigo: 'https://github.com/MarlonSigales/ProjetoConceitual',
        imagem: 'img/apps/conceitual.jpg',
        etiquetas: ['projeto conceitual', 'projeto preliminar']
    },
    {
        id: 'gestao',
        ativo: true,
        categoria: 'produto',
        nome: 'Gestão de Projetos',
        descricao: 'Projetos de P&D com macroentregas, cronograma, riscos, TRL e relatórios no padrão Inova Agro/EMBRAPII.',
        url: 'https://marlonsigales.github.io/gest-o-de-projetos/',
        codigo: 'https://github.com/MarlonSigales/gest-o-de-projetos',
        imagem: 'img/apps/gestao.jpg',
        etiquetas: ['TRL', 'macroentregas', 'NeDIP']
    },
    {
        id: 'mcdac',
        ativo: true,
        categoria: 'decisao',
        nome: 'MCDA-C Web',
        descricao: 'Metodologia multicritério construtivista (Ensslin et al.) em 17 passos, com o complemento ELECTRE de Roy.',
        url: '',            // endereço a cadastrar
        codigo: '',
        imagem: '',
        etiquetas: ['MCDA-C', 'ELECTRE']
    },
    {
        id: 'eletrico',
        ativo: true,
        categoria: 'eletrica',
        nome: 'Projeto Elétrico Agroindustrial',
        descricao: 'Roteiro de projeto: previsão de cargas, condutores e proteção pela NBR 5410, demanda, quadros, SPDA e PDF do projeto.',
        url: 'https://marlonsigales.github.io/app-projetos-de-instalacoes-eletricas-agroindustriais/',
        codigo: 'https://github.com/MarlonSigales/app-projetos-de-instalacoes-eletricas-agroindustriais',
        imagem: 'img/apps/eletrico.jpg',
        etiquetas: ['NBR 5410', 'aula']
    },
    {
        id: 'offgrid',
        ativo: true,
        categoria: 'eletrica',
        nome: 'Sistema Fotovoltaico Off-grid',
        descricao: 'Dimensiona um sistema isolado pelo pior mês: irradiação, cargas, baterias, gerador FV, controlador e inversor.',
        url: 'https://marlonsigales.github.io/projeto-solar-offgrid/',
        codigo: 'https://github.com/MarlonSigales/projeto-solar-offgrid',
        imagem: 'img/apps/offgrid.jpg',
        etiquetas: ['fotovoltaico', 'aula']
    },
    {
        id: 'mqtt',
        ativo: true,
        categoria: 'automacao',
        nome: 'Supervisório MQTT',
        descricao: 'Plantas com variáveis ao vivo, gráficos, alarmes ISA-18.2, horímetros, controle discreto e sinótico de pós-colheita.',
        url: 'https://marlonsigales.github.io/MQTT-Cliente-supervisorio/',
        codigo: 'https://github.com/MarlonSigales/MQTT-Cliente-supervisorio',
        imagem: 'img/apps/mqtt.jpg',
        etiquetas: ['MQTT', 'pós-colheita']
    }
];

/**
 * Fluxo de projetos (NeDIP): cada passo aponta para um app pelo id.
 * Passo cujo app não está ativo some sozinho.
 */
const FLUXO = [
    { app: 'qfd', fase: 'Informacional', texto: 'O que o cliente quer vira especificação.' },
    { app: 'conceitual', fase: 'Conceitual e preliminar', texto: 'Especificações viram funções, princípios e concepção.' },
    { app: 'gestao', fase: 'Gestão, TRL e relatórios', texto: 'O projeto inteiro gerido, com maturidade e aceite.' }
];

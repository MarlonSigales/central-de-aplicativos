/**
 * © 2026 Central de Aplicativos — Marlon Sigales. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * CATÁLOGO DOS APLICATIVOS — este é o único arquivo que precisa mudar para pôr ou tirar um aplicativo.
 *
 * TIRAR UM APLICATIVO (exclusão facilitada):
 *   - Esconder sem apagar: troque  ativo: true  por  ativo: false  no bloco do app.
 *   - Excluir de vez: apague o bloco inteiro do app, de  {  até  },  (e a figura em img/apps/, se quiser).
 *   Não precisa mexer em mais nada: a página, o fluxo de projetos, as missões, as medalhas e o XP ignoram
 *   sozinhos os apps que não estão ativos. O progresso já guardado no navegador não quebra.
 *
 * PÔR UM APLICATIVO: copie um bloco, troque o id (único, sem espaço) e preencha os campos.
 *   destaque: true = aparece primeiro, sozinho, no topo da página (hoje: Gestão de Projetos).
 *   url vazia ('') = aparece como "endereço a cadastrar", sem botão de abrir.
 */

'use strict';

/** Categorias dos apps separados (para casos específicos), na ordem em que aparecem. */
const CATEGORIAS = [
    { id: 'produto', nome: 'Projeto de produto', descricao: 'As fases do projeto em apps separados.' },
    { id: 'pi', nome: 'Propriedade intelectual', descricao: 'Do invento ao pedido de patente.' },
    { id: 'decisao', nome: 'Apoio à decisão', descricao: 'Escolher entre alternativas com critérios explícitos.' },
    { id: 'eletrica', nome: 'Instalações elétricas e energia', descricao: 'Apps didáticos de Energização Rural e de Projeto de Instalações Elétricas Agroindustriais.' },
    { id: 'automacao', nome: 'Automação e supervisão', descricao: 'Acompanhar e comandar plantas pelo navegador.' },
    { id: 'utilitarios', nome: 'Utilitários', descricao: 'Ferramentas pequenas do dia a dia.' }
];

/** Aplicativos. */
const APPS = [
    {
        id: 'gestao',
        ativo: true,
        destaque: true,
        categoria: 'produto',
        nome: 'Gestão de Projetos',
        descricao: 'Tudo num só: projetos de P&D com macroentregas, cronograma, riscos, QFD, projeto conceitual e preliminar, TRL e relatórios no padrão Inova Agro/EMBRAPII.',
        url: 'https://marlonsigales.github.io/Gest-o-de-projetos/index.html',
        codigo: 'https://github.com/MarlonSigales/Gest-o-de-projetos',
        imagem: 'img/apps/gestao.jpg',
        etiquetas: ['tudo num só', 'TRL', 'macroentregas', 'NeDIP']
    },
    {
        id: 'qfd',
        ativo: true,
        categoria: 'produto',
        nome: 'Sistema QFD - Quality Function Deployment',
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
        nome: 'Projeto Conceitual',
        descricao: 'Função global, estrutura de funções, princípios de solução, matriz morfológica, concepção e projeto preliminar.',
        url: 'https://marlonsigales.github.io/ProjetoConceitual/#/relatorio',
        codigo: 'https://github.com/MarlonSigales/ProjetoConceitual',
        imagem: 'img/apps/conceitual.jpg',
        etiquetas: ['projeto conceitual', 'projeto preliminar']
    },
    {
        id: 'patentes',
        ativo: true,
        categoria: 'pi',
        nome: 'Apoio à Escrita de Patentes',
        descricao: 'O pedido de patente passo a passo (Guia Básico do INPI): buscas de anterioridade, classificação e os 8 documentos para a universidade e o INPI.',
        url: 'https://marlonsigales.github.io/apoio-escrita-patentes/index.html',
        codigo: 'https://github.com/MarlonSigales/apoio-escrita-patentes',
        imagem: 'img/apps/patentes.jpg',
        etiquetas: ['INPI', 'anterioridade', 'missões']
    },
    {
        id: 'mcdac',
        ativo: true,
        categoria: 'decisao',
        nome: 'MCDA-C · Apoio à Decisão',
        descricao: 'Metodologia multicritério construtivista (Ensslin et al.) em 17 passos, com o complemento ELECTRE de Roy.',
        url: 'https://marlonsigales.github.io/metodologia-multicriterio-de-apoio-a-decisao/index.html',
        codigo: 'https://github.com/MarlonSigales/metodologia-multicriterio-de-apoio-a-decisao',
        imagem: 'img/apps/mcdac.jpg',
        etiquetas: ['MCDA-C', 'ELECTRE']
    },
    {
        id: 'eletrico',
        ativo: true,
        categoria: 'eletrica',
        nome: 'Projeto Elétrico Agroindustrial',
        descricao: 'Roteiro de projeto: previsão de cargas, condutores e proteção pela NBR 5410, demanda, quadros, SPDA e PDF do projeto.',
        url: 'https://marlonsigales.github.io/app-projetos-de-instalacoes-eletricas-agroindustriais/index.html',
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
        nome: 'Sinótico — Supervisório MQTT',
        descricao: 'Plantas com variáveis ao vivo, gráficos, alarmes ISA-18.2, horímetros, controle discreto e sinótico de pós-colheita.',
        url: 'https://marlonsigales.github.io/MQTT-Cliente-supervisorio/#/sinotico',
        codigo: 'https://github.com/MarlonSigales/MQTT-Cliente-supervisorio',
        imagem: 'img/apps/mqtt.jpg',
        etiquetas: ['MQTT', 'pós-colheita']
    },
    {
        id: 'qrcode',
        ativo: true,
        categoria: 'utilitarios',
        nome: 'Gerador de QR Code',
        descricao: 'Cole um link e gere o QR Code dele.',
        url: 'https://marlonsigales.github.io/gerador-de-qrcode-por-link/gerador-de-qrcode.html',
        codigo: 'https://github.com/MarlonSigales/gerador-de-qrcode-por-link',
        imagem: 'img/apps/qrcode.jpg',
        etiquetas: ['QR Code']
    }
];

/**
 * Fluxo de projetos com os apps separados (NeDIP): cada passo aponta para um app pelo id.
 * Passo cujo app não está ativo some sozinho. A Gestão de Projetos já faz o fluxo inteiro por dentro.
 */
const FLUXO = [
    { app: 'qfd', fase: 'Informacional', texto: 'O que o cliente quer vira especificação.' },
    { app: 'conceitual', fase: 'Conceitual e preliminar', texto: 'Especificações viram funções, princípios e concepção.' },
    { app: 'gestao', fase: 'Gestão, TRL e relatórios', texto: 'O projeto inteiro gerido, com maturidade e aceite.' }
];

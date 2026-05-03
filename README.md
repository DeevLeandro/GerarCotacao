# 🛫 Sistema de Propostas de Importação

Gerador de propostas comerciais para importação aeronáutica.  
Desenvolvido para **Boaz Aeronautical Technical Solutions**.

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 16+ instalado ([nodejs.org](https://nodejs.org))

### Passos

```bash
# 1. Entrar na pasta do projeto
cd proposta-importacao

# 2. Instalar dependências
npm install

# 3. Iniciar em modo desenvolvimento
npm start
```

O app abrirá em `http://localhost:3000`.

---

## 📁 Estrutura

```
src/
├── components/
│   ├── CostCalculator.jsx   — Formulário de custos (admin)
│   ├── ImportParser.jsx     — Extrai produtos de texto de invoice
│   ├── Notification.jsx     — Toast de feedback
│   ├── PDFModal.jsx         — Modal de preview + geração de PDF
│   ├── ProductList.jsx      — Lista editável de produtos
│   ├── ProposalPreview.jsx  — Documento visual (o que o cliente vê)
│   └── Sidebar.jsx          — Navegação lateral
│
├── pages/
│   ├── EditorPage.jsx       — Editor principal com abas
│   ├── SavedPage.jsx        — Histórico de propostas
│   └── SettingsPage.jsx     — Configurações da empresa
│
├── services/
│   ├── costCalculator.js    — Lógica de cálculo de importação
│   ├── pdfGenerator.js      — Geração e download do PDF
│   └── storage.js           — Persistência via localStorage
│
├── utils/
│   ├── helpers.js           — Formatação, datas, IDs
│   └── invoiceParser.js     — Parser de texto de invoice
│
├── styles/
│   └── global.css           — Design system completo
│
├── App.jsx                  — Componente raiz
└── index.js                 — Entry point
```

---

## 🔧 Como usar

### 1. Configurar a empresa
Vá em **Configurações** e preencha nome, subtítulo e contato da sua empresa.

### 2. Criar uma proposta
- Clique em **Nova Proposta**
- Aba **Produtos**: adicione os itens manualmente  
- Aba **Importar**: cole o texto de uma proforma invoice para extração automática  
- Aba **Custos** *(admin)*: preencha todos os custos de importação  
- Aba **Cliente**: nome, contato, validade, condições  

### 3. Ajuste de margem automático
No campo **"Valor Final Desejado (R$)"**, insira o valor que quer cobrar.  
Clique em **Ajustar Custos** — o sistema recalcula os honorários automaticamente.

### 4. Gerar PDF
Clique em **👁 Preview PDF** → confira o documento → **⬇ Baixar PDF**.

---

## 🔒 Separação Admin / Cliente

| O que aparece no PDF | Admin | Cliente |
|---|:---:|:---:|
| Lista de produtos | ✅ | ✅ |
| Observações | ✅ | ✅ |
| Valor total | ✅ | ✅ |
| Impostos e taxas | ✅ | ❌ |
| Câmbio / custo detalhado | ✅ | ❌ |

Use o toggle **Admin / Cliente** na sidebar para alternar a visualização.

---

## 📦 Dependências

- `react` + `react-dom` — interface
- `html2pdf.js` — geração de PDF a partir do HTML
- `react-scripts` — build/dev server (CRA)

---

## 💾 Dados

Tudo é salvo no **localStorage** do navegador — sem backend, sem servidor.  
Para exportar dados: abra o console e execute `localStorage.getItem('import_proposals_v2')`.

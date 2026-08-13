# Guia de Configuração do Google Apps Script
## Vitrine Oficial do Desafio Quilter Empreendedora 2026

Este guia orienta o passo a passo para conectar a planilha Google Sheets de inscrições do Desafio à Vitrine Web oficial de forma 100% segura, sem expor dados privados das participantes.

---

### 1. Estrutura das Colunas na Planilha

Na aba de respostas (nomeada por padrão como `Respostas ao formulário 1`), certifique-se de que os seguintes cabeçalhos de coluna existam na **Linha 1**:

#### Colunas vindas do Google Forms:
1. `Carimbo de data/hora`
2. `Endereço de e-mail`
3. `Nome Completo`
4. `Email`
5. `WhatsApp (com DDD)`
6. `Cidade`
7. `Estado`
8. `Nome da Peça`
9. `Tamanho da Peça`
10. `Valor da Peça (R$)`
11. `Upload das Fotos da Peça - Frente`
12. `Métodos de Pagamento Aceitos`
13. `Métodos de Envio Aceitos`
14. `Termo de Adesão`
15. `Qual é a sua principal motivação para participar deste desafio?`
16. `CEP`
17. `Descrição da peça`
18. `Qual curso/comunidade participa?`
19. `Esta peça foi produzida a partir de qual aula/projeto?`
20. `Upload das Fotos da Peça - Verso`
21. `Upload das Fotos da Peça - Detalhe`

#### Colunas Administrativas (Adicionar à direita na Linha 1):
22. `ID da peça`
23. `Status aprovação` *(Valores: Pendente | Aprovada | Reprovada)*
24. `Master confirmada` *(Valores: VERDADEIRO / FALSO ou Sim / Não)*
25. `Status da peça` *(Valores: Disponível | Reservada | Vendida)*
26. `Publicar na vitrine` *(Valores: Sim | Não)*
27. `Data publicação` *(Ex: 2026-08-20)*

---

### 2. Inserir o Código no Apps Script

1. Abra a sua planilha Google Sheets no navegador.
2. No menu superior, clique em **Extensões** > **Apps Script**.
3. No painel esquerdo do editor de código, apague o conteúdo do arquivo `Código.gs` (ou `Code.gs`).
4. Copie todo o conteúdo do arquivo `google-apps-script/Code.gs` deste projeto e cole no editor.
5. Clique no ícone de **Salvar** (ou `Ctrl + S` / `Cmd + S`).

---

### 3. Configurar o Gatilho Automático de Novas Inscrições

Para que o ID sequencial (ex: `QES-0001`) e os campos administrativos padrão sejam preenchidos automaticamente quando uma participante enviar o formulário:

1. No menu lateral esquerdo do Apps Script, clique no ícone de relógio (**Acionadores** / **Triggers**).
2. Clique no botão **+ Adicionar acionador** no canto inferior direito.
3. Configure os seguintes campos:
   - **Escolha qual função executar**: `onFormSubmit`
   - **Escolha qual implantação deve ser executada**: `Head`
   - **Selecione a fonte do evento**: `Da planilha`
   - **Selecione o tipo de evento**: `Ao enviar formulário`
4. Clique em **Salvar** e conclua a autorização de segurança da sua conta Google quando solicitado.

---

### 4. Implantar como Aplicativo da Web (Web App)

1. No canto superior direito do Apps Script, clique no botão azul **Implantar** > **Nova implantação**.
2. Clique no ícone de engrenagem ao lado de *Selecione o tipo* e escolha **Aplicativo da Web**.
3. Preencha as opções exatamente como abaixo:
   - **Descrição**: `Vitrine Quilter 2026 API`
   - **Executar como**: `Eu (seu-email@dominio.com)` *(Importante: mantém a planilha protegida)*
   - **Quem pode acessar**: `Qualquer pessoa` *(Necessário para o proxy do site consultar os dados públicos)*
4. Clique em **Implantar**.
5. Na janela seguinte, copie a **URL do aplicativo da Web** (ela começa com `https://script.google.com/macros/s/.../exec`).

---

### 5. Conectar à Vitrine Web

1. No ambiente da sua aplicação web, adicione a variável de ambiente:
   ```env
   APPS_SCRIPT_WEB_APP_URL="https://script.google.com/macros/s/SUA_URL_GERADA/exec"
   ```
2. Reinicie o servidor se necessário.
3. A vitrine passará a carregar automaticamente os dados reais da planilha!

---

### 6. Como Funciona a Aprovação e Publicação

- **Nova Inscrição Chega**: Recebe automaticamente `ID da peça` (ex: `QES-0001`), `Status aprovação: Pendente`, `Publicar na vitrine: Não`.
- **Para Publicar**: A organização analisa a peça na planilha, altera `Status aprovação` para **Aprovada** e `Publicar na vitrine` para **Sim**.
- **Selo Master Quilter**: Defina `Master confirmada` como **Sim** ou **VERDADEIRO** apenas para alunas certificadas da Comunidade Master Quilter.
- **Quando Vender**: Altere `Status da peça` para **Vendida** (a peça continuará na vitrine como portfólio, mas o botão de compra ficará desabilitado com o rótulo "Peça vendida").
- **Quando Reservar**: Altere para **Reservada** (o card exibirá o badge "Em negociação" e o botão "Consultar disponibilidade").

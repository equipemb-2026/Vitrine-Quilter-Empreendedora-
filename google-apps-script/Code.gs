/**
 * ==============================================================================================
 * VITRINE QUILTER EMPREENDEDORA 2026 - GOOGLE APPS SCRIPT
 * ==============================================================================================
 * Código oficial para integração segura entre Google Sheets e a Vitrine Web.
 * 
 * Funcionalidades:
 * 1. doGet(): Endpoint público que fornece dados sanitizados em formato JSON apenas para
 *    peças com Status aprovação = "Aprovada" E Publicar na vitrine = "Sim".
 * 2. onFormSubmit(): Gatilho instalável que gera o ID sequencial da peça (ex: QES-0001)
 *    e preenche os campos administrativos padrão apenas quando uma nova inscrição é recebida.
 * 3. Sanitização e Whitelist: Proteção total de dados privados (e-mails, consentimento e
 *    motivações nunca são expostos).
 * 4. Conversão de links do Google Drive para URLs públicas de alta resolução para a vitrine.
 * ==============================================================================================
 */

// Nome da aba principal de respostas
var SHEET_NAME = "Respostas ao formulário 1";

// Nomes exatos dos cabeçalhos das colunas (localizados dinamicamente pelo nome)
var HEADERS = {
  TIMESTAMP: "Carimbo de data/hora",
  EMAIL_COL1: "Endereço de e-mail",
  NAME: "Nome Completo",
  EMAIL_COL2: "Email",
  WHATSAPP: "WhatsApp (com DDD)",
  CITY: "Cidade",
  STATE: "Estado",
  TITLE: "Nome da Peça",
  SIZE: "Tamanho da Peça",
  PRICE: "Valor da Peça (R$)",
  PHOTO_FRONT: "Upload das Fotos da Peça - Frente",
  PAYMENTS: "Métodos de Pagamento Aceitos",
  SHIPPING: "Métodos de Envio Aceitos",
  TERM: "Termo de Adesão",
  MOTIVATION: "Qual é a sua principal motivação para participar deste desafio?",
  CEP: "CEP",
  DESCRIPTION: "Descrição da peça",
  COURSE: "Qual curso/comunidade participa?",
  LESSON: "Esta peça foi produzida a partir de qual aula/projeto?",
  PHOTO_BACK: "Upload das Fotos da Peça - Verso",
  PHOTO_DETAIL: "Upload das Fotos da Peça - Detalhe",
  
  // Colunas Administrativas
  ID: "ID da peça",
  APPROVAL: "Status aprovação",
  MASTER: "Master confirmada",
  PIECE_STATUS: "Status da peça",
  PUBLISH: "Publicar na vitrine",
  PUBLISHED_AT: "Data publicação"
};

/**
 * Endpoint HTTP GET chamado pelo proxy da Vitrine Web (/api/pieces)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ success: true, pieces: [], total: 0 });
    }
    
    var headerRow = data[0];
    var colMap = mapHeaders(headerRow);
    
    var approvedPieces = [];
    
    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      
      // Verifica se a linha tem dados válidos
      var rawTitle = getRowVal(row, colMap, HEADERS.TITLE);
      var rawAuthor = getRowVal(row, colMap, HEADERS.NAME);
      if (!rawTitle && !rawAuthor) continue;
      
      // Regra de Publicação:
      // Status aprovação == "Aprovada" E Publicar na vitrine == "Sim" (ou true)
      var approvalStatus = normalizeText(getRowVal(row, colMap, HEADERS.APPROVAL));
      var publishStatus = normalizeText(getRowVal(row, colMap, HEADERS.PUBLISH));
      
      var isApproved = (approvalStatus.toLowerCase() === "aprovada" || approvalStatus.toLowerCase() === "aprovado");
      var isPublishable = (publishStatus.toLowerCase() === "sim" || publishStatus.toLowerCase() === "true" || publishStatus === "1");
      
      if (isApproved && isPublishable) {
        // Regra do Selo Master:
        // Apenas quando a coluna administrativa "Master confirmada" for explicitamente verdadeira
        var rawMaster = getRowVal(row, colMap, HEADERS.MASTER);
        var isMaster = normalizeBoolean(rawMaster);
        
        // Status da Peça (Disponível, Reservada, Vendida)
        var rawPieceStatus = normalizeText(getRowVal(row, colMap, HEADERS.PIECE_STATUS)) || "Disponível";
        var pieceStatus = "Disponível";
        if (rawPieceStatus.toLowerCase().indexOf("reservad") !== -1 || rawPieceStatus.toLowerCase().indexOf("negocia") !== -1) {
          pieceStatus = "Reservada";
        } else if (rawPieceStatus.toLowerCase().indexOf("vendid") !== -1) {
          pieceStatus = "Vendida";
        }
        
        // Tratar imagens do Google Drive
        var frontRaw = getRowVal(row, colMap, HEADERS.PHOTO_FRONT);
        var backRaw = getRowVal(row, colMap, HEADERS.PHOTO_BACK);
        var detailRaw = getRowVal(row, colMap, HEADERS.PHOTO_DETAIL);
        
        var frontUrl = convertDriveUrl(frontRaw, true);
        var backUrl = convertDriveUrl(backRaw, true);
        var detailUrl = convertDriveUrl(detailRaw, true);
        
        // Parse de métodos e cursos em arrays
        var coursesArray = splitCommaList(getRowVal(row, colMap, HEADERS.COURSE));
        var paymentsArray = splitCommaList(getRowVal(row, colMap, HEADERS.PAYMENTS));
        var shippingArray = splitCommaList(getRowVal(row, colMap, HEADERS.SHIPPING));
        
        // Preço formatado como número
        var priceNumber = parsePriceToNumber(getRowVal(row, colMap, HEADERS.PRICE));
        
        // WhatsApp e CEP tratados rigorosamente como strings
        var rawWhatsApp = String(getRowVal(row, colMap, HEADERS.WHATSAPP) || "").trim();
        var rawCep = String(getRowVal(row, colMap, HEADERS.CEP) || "").trim();
        
        // Data de publicação formatada
        var publishedDate = formatDate(getRowVal(row, colMap, HEADERS.PUBLISHED_AT));
        
        // Whitelist estrita de campos públicos (campos privados NUNCA são incluídos)
        var publicPiece = {
          id: String(getRowVal(row, colMap, HEADERS.ID) || ("QES-" + padZero(r, 4))).trim(),
          author: normalizeText(rawAuthor),
          title: normalizeText(rawTitle),
          description: normalizeText(getRowVal(row, colMap, HEADERS.DESCRIPTION)),
          size: normalizeText(getRowVal(row, colMap, HEADERS.SIZE)),
          price: priceNumber,
          city: normalizeText(getRowVal(row, colMap, HEADERS.CITY)),
          state: normalizeText(getRowVal(row, colMap, HEADERS.STATE)),
          cep: rawCep,
          master: isMaster,
          courses: coursesArray,
          payments: paymentsArray,
          shipping: shippingArray,
          status: pieceStatus,
          images: {
            front: frontUrl,
            back: backUrl,
            detail: detailUrl
          },
          whatsapp: rawWhatsApp,
          publishedAt: publishedDate
        };
        
        approvedPieces.push(publicPiece);
      }
    }
    
    return createJsonResponse({
      success: true,
      pieces: approvedPieces,
      total: approvedPieces.length
    });
    
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.message || "Erro ao processar dados da planilha.",
      pieces: []
    });
  }
}

/**
 * Gatilho instalável executado ao enviar uma nova resposta no Google Forms
 */
function onFormSubmit(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;
    
    var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var colMap = mapHeaders(headerRow);
    
    // Se a coluna de ID não existe, não faz nada
    if (!colMap[HEADERS.ID]) return;
    
    var idColIndex = colMap[HEADERS.ID] + 1;
    var currentIdValue = sheet.getRange(lastRow, idColIndex).getValue();
    
    // Gera ID sequencial apenas se ainda não existir
    if (!currentIdValue || String(currentIdValue).trim() === "") {
      var nextSequence = calculateNextSequence(sheet, idColIndex, lastRow);
      var generatedId = "QES-" + padZero(nextSequence, 4);
      sheet.getRange(lastRow, idColIndex).setValue(generatedId);
    }
    
    // Define valores administrativos padrão para novas submissões
    setDefaultIfEmpty(sheet, lastRow, colMap, HEADERS.APPROVAL, "Pendente");
    setDefaultIfEmpty(sheet, lastRow, colMap, HEADERS.MASTER, false);
    setDefaultIfEmpty(sheet, lastRow, colMap, HEADERS.PIECE_STATUS, "Disponível");
    setDefaultIfEmpty(sheet, lastRow, colMap, HEADERS.PUBLISH, "Não");
    
  } catch (err) {
    Logger.log("Erro no onFormSubmit: " + err.toString());
  }
}

// ==============================================================================================
// FUNÇÕES AUXILIARES E UTILITÁRIOS
// ==============================================================================================

/**
 * Cria o mapa de nome do cabeçalho -> índice da coluna
 */
function mapHeaders(headerRow) {
  var map = {};
  for (var i = 0; i < headerRow.length; i++) {
    var name = String(headerRow[i] || "").trim();
    if (name) {
      map[name] = i;
    }
  }
  return map;
}

/**
 * Obtém o valor de uma linha com base no nome do cabeçalho
 */
function getRowVal(row, colMap, headerName) {
  if (colMap[headerName] !== undefined) {
    return row[colMap[headerName]];
  }
  return "";
}

/**
 * Converte URLs do Google Drive para links públicos utilizáveis diretamente na web
 * Se makePublic=true, ajusta o compartilhamento do arquivo individual para 'Qualquer pessoa com o link'
 */
function convertDriveUrl(rawUrl, makePublic) {
  if (!rawUrl) return "";
  var str = String(rawUrl).trim();
  if (!str) return "";
  
  // Se forem múltiplos links separados por vírgula, pega o primeiro
  if (str.indexOf(",") !== -1) {
    str = str.split(",")[0].trim();
  }
  
  // Extrai o ID do Google Drive
  var fileId = "";
  var idMatch = str.match(/[-\w]{25,}/);
  if (idMatch) {
    fileId = idMatch[0];
  }
  
  if (fileId) {
    if (makePublic) {
      try {
        var file = DriveApp.getFileById(fileId);
        // Garante que apenas este arquivo específico de peça aprovada possa ser lido
        if (file.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) {
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }
      } catch (e) {
        // Ignora caso não tenha permissão de alterar compartilhamento
      }
    }
    // Retorna URL de thumbnail de alta qualidade do Google UserContent
    return "https://lh3.googleusercontent.com/d/" + fileId;
  }
  
  return str;
}

/**
 * Converte texto em booleano tolerante a Sim, true, TRUE, 1
 */
function normalizeBoolean(val) {
  if (typeof val === "boolean") return val;
  if (!val) return false;
  var str = String(val).trim().toLowerCase();
  return (str === "true" || str === "sim" || str === "1" || str === "yes" || str === "v");
}

/**
 * Normaliza strings removendo espaços extras
 */
function normalizeText(val) {
  if (val === null || val === undefined) return "";
  return String(val).replace(/\s+/g, " ").trim();
}

/**
 * Divide strings separadas por vírgulas ou quebras de linha em arrays limpos
 */
function splitCommaList(val) {
  if (!val) return [];
  var str = String(val).trim();
  if (!str) return [];
  
  return str.split(/[\n,;]+/)
    .map(function(item) { return item.trim(); })
    .filter(function(item) { return item.length > 0; });
}

/**
 * Converte valor em formato de moeda ou número para float numérico
 */
function parsePriceToNumber(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  
  var clean = String(val)
    .replace(/[^\d.,]/g, "")
    .trim();
    
  if (!clean) return 0;
  
  // Formato brasileiro "550,00" ou "1.550,00"
  if (clean.indexOf(",") !== -1) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  }
  
  var parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata data para YYYY-MM-DD
 */
function formatDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  var str = String(val).trim();
  return str;
}

/**
 * Preenche com zeros à esquerda (ex: padZero(1, 4) -> "0001")
 */
function padZero(num, size) {
  var s = "000000000" + num;
  return s.substr(s.length - size);
}

/**
 * Calcula o próximo ID sequencial a partir dos IDs existentes
 */
function calculateNextSequence(sheet, idColIndex, lastRow) {
  var maxSeq = 0;
  var idValues = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();
  
  for (var i = 0; i < idValues.length; i++) {
    var val = String(idValues[i][0] || "").trim();
    var match = val.match(/QES-(\d+)/i);
    if (match) {
      var seq = parseInt(match[1], 10);
      if (seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  
  return maxSeq > 0 ? maxSeq + 1 : (lastRow - 1);
}

/**
 * Define valor padrão se a célula estiver vazia
 */
function setDefaultIfEmpty(sheet, row, colMap, headerName, defaultValue) {
  if (colMap[headerName] !== undefined) {
    var colIndex = colMap[headerName] + 1;
    var cell = sheet.getRange(row, colIndex);
    if (cell.getValue() === "" || cell.getValue() === null) {
      cell.setValue(defaultValue);
    }
  }
}

/**
 * Retorna resposta formatada com cabeçalho JSON
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

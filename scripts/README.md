# Embedding Scripts

Scripts para gerenciar e verificar embeddings no DevCache.

## 📋 Scripts Disponíveis

### 1. Check Embeddings (Verificação)

Verifica o status dos embeddings sem fazer alterações.

```bash
npm run check-embeddings
```

**O que faz:**
- Mostra estatísticas completas de embeddings
- Lista itens pendentes (primeiros 10)
- Exibe histórico de jobs recentes
- Progress bar visual
- Recomendações de ação

**Quando usar:**
- Verificar se todos os arquivos têm embeddings
- Ver quantos itens estão pendentes
- Checar histórico de jobs
- Antes de rodar geração manual

**Output exemplo:**
```
📊 EMBEDDING STATUS REPORT
══════════════════════════════════════════════════════════════

📁 PROJECT FILES:
────────────────────────────────────────────────────────────
   Total files:          25
   With embeddings:      23 (92%)
   Pending:              2

   Progress: ████████████████████████████████████░░░░ 92%

🤖 AGENT TEMPLATES (Public):
────────────────────────────────────────────────────────────
   Total agents:         10
   With embeddings:      10 (100%)
   Pending:              0

   Progress: ████████████████████████████████████████ 100%

📊 OVERALL STATUS:
────────────────────────────────────────────────────────────
   Total items:          35
   With embeddings:      33 (94%)
   Pending:              2

   Overall: ██████████████████████████████████████░░ 94%

⚠️  2 item(s) need embeddings
   Run the embedding generation script to process them.
```

---

### 2. Generate Embeddings V2 (Geração)

Gera embeddings para todos os itens pendentes.

```bash
npm run generate-embeddings-v2
```

**O que faz:**
- Busca até 100 itens pendentes
- Gera embeddings usando OpenAI/OpenRouter
- Salva no banco de dados
- Mostra progresso em tempo real
- Loga resultados no banco

**Quando usar:**
- Quando há itens pendentes
- Após fazer push de novos arquivos
- Para forçar geração imediata
- Quando cron job não rodou

**Output exemplo:**
```
🚀 EMBEDDING GENERATION
════════════════════════════════════════════════════════════

📍 Using: OpenRouter
🌐 Referer: https://devcache.dev

📦 Fetching pending items (max 100)...

   Found 2 items needing embeddings

────────────────────────────────────────────────────────────
[1/2] Processing project: architecture-overview.md... ✅ (234 tokens)
[2/2] Processing project: features-list.md... ✅ (189 tokens)
────────────────────────────────────────────────────────────

📊 RESULTS:
────────────────────────────────────────────────────────────
   Total processed:  2
   Succeeded:        2 ✅
   Failed:           0
   Execution time:   1234ms

✅ Run logged to database

════════════════════════════════════════════════════════════
✅ All embeddings generated successfully!
════════════════════════════════════════════════════════════
```

---

### 3. Generate Embeddings (Legacy)

Script antigo, mantido para compatibilidade.

```bash
npm run generate-embeddings
```

**Nota:** Use `generate-embeddings-v2` para a versão atualizada.

---

## 🔄 Workflow Recomendado

### Verificação Regular

```bash
# 1. Verificar status
npm run check-embeddings

# 2. Se houver pendentes, gerar
npm run generate-embeddings-v2

# 3. Verificar novamente
npm run check-embeddings
```

### Após Push de Arquivos

```bash
# Via CLI (recomendado)
devcache push
devcache embeddings

# Ou via script
npm run check-embeddings
npm run generate-embeddings-v2
```

### Troubleshooting

```bash
# 1. Verificar status detalhado
npm run check-embeddings

# 2. Ver logs de jobs anteriores
# (incluído no output do check-embeddings)

# 3. Forçar geração
npm run generate-embeddings-v2

# 4. Verificar se resolveu
npm run check-embeddings
```

---

## ⚙️ Configuração

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Key para Embeddings (escolha uma)
OPENROUTER_API_KEY=your-openrouter-key
# OU
OPENAI_API_KEY=your-openai-key

# App URL (opcional)
NEXT_PUBLIC_APP_URL=https://devcache.dev
```

### Obter API Keys

**OpenRouter (Recomendado):**
- Acesse: https://openrouter.ai/keys
- Crie uma conta
- Gere uma API key
- Adicione créditos (mínimo $5)

**OpenAI (Alternativa):**
- Acesse: https://platform.openai.com/api-keys
- Crie uma conta
- Gere uma API key
- Adicione créditos

---

## 📊 Entendendo os Resultados

### Progress Bar

```
████████████████████████████████████░░░░ 90%
```

- `█` = Arquivos com embeddings
- `░` = Arquivos pendentes
- Percentual = Cobertura atual

### Status dos Itens

- **Total**: Todos os arquivos/agents no sistema
- **With embeddings**: Itens que já têm embeddings
- **Pending**: Itens que precisam de embeddings

### Tipos de Itens

- **Project Files** (`📄`): Seus arquivos de documentação
- **Agent Templates** (`🤖`): Templates públicos de agents

---

## 🐛 Troubleshooting

### Erro: "Missing required environment variables"

**Solução:**
```bash
# Verifique se .env.local existe
cat .env.local

# Verifique se as variáveis estão definidas
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Erro: "Missing API key for embeddings"

**Solução:**
```bash
# Adicione uma das chaves ao .env.local
OPENROUTER_API_KEY=sk-or-v1-...
# OU
OPENAI_API_KEY=sk-...
```

### Erro: "Embedding API error (401)"

**Causa:** API key inválida ou sem créditos

**Solução:**
1. Verifique se a key está correta
2. Verifique se há créditos na conta
3. Tente gerar uma nova key

### Erro: "Failed to get pending items"

**Causa:** Problema de conexão com Supabase

**Solução:**
```bash
# Verifique a conexão
devcache connection

# Verifique as credenciais
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Muitos Itens Pendentes

**Causa:** Cron job não está rodando ou falhou

**Solução:**
```bash
# Gere manualmente
npm run generate-embeddings-v2

# Ou via CLI
devcache embeddings --trigger
```

---

## 💡 Dicas

1. **Verificação Regular**: Rode `check-embeddings` semanalmente
2. **Após Push**: Sempre verifique embeddings após push
3. **Batch Processing**: O script processa até 100 itens por vez
4. **Rate Limits**: Há delay de 100ms entre itens para evitar rate limits
5. **Logs**: Todos os runs são logados no banco para auditoria

---

## 📚 Mais Informações

- **CLI Guide**: `devcache guide`
- **Embedding Docs**: `packages/devcache/docs/EMBEDDINGS.md`
- **API Docs**: Veja comentários nos scripts

---

## 🆘 Suporte

Se encontrar problemas:

1. Rode `npm run check-embeddings` para diagnóstico
2. Verifique os logs de erro
3. Consulte a seção de troubleshooting
4. Abra uma issue no GitHub com os detalhes

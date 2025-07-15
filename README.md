# Agendador de Conteúdo

Uma plataforma web para agendamento e gerenciamento de conteúdo (textos, imagens e vídeos) com uma interface de calendário intuitiva.

## Funcionalidades

-   **Autenticação de Usuários:** Login e registro seguros via Supabase.
-   **CRUD Completo:** Crie, edite, visualize e exclua agendamentos.
-   **Suporte a Múltiplas Mídias:** Gerencie posts de texto, imagem e vídeo.
-   **Calendário Interativo:** Arraste e solte para reagendar, filtre por tipo de conteúdo e busque por título.
-   **Funcionalidades Avançadas:** Suporte para agendamentos recorrentes e duplicação de posts.
-   **Gerenciamento de Perfil:** Usuários podem editar seu nome e avatar.
-   **Dashboard de Estatísticas:** Visualize um resumo da sua atividade.

## Configuração Local

1.  **Pré-requisitos:**
    *   Um servidor web local (a extensão **Live Server** para VS Code é recomendada).
    *   Uma conta no [Supabase](https://supabase.com/).

2.  **Configuração do Supabase:**
    *   Crie um novo projeto no Supabase.
    *   Vá para o **SQL Editor** e execute o script SQL completo fornecido durante o desenvolvimento para criar todas as tabelas e funções.
    *   Vá para **Storage** e crie dois buckets públicos: `content-media` e `avatars`.

3.  **Configuração do Projeto:**
    *   Clone ou baixe este repositório.
    *   Crie um arquivo `config.js` na raiz do projeto.
    *   Adicione suas credenciais do Supabase ao `config.js`:
        ```javascript
        // config.js
        const SUPABASE_CONFIG = {
            URL: 'SUA_URL_SUPABASE_VAI_AQUI',
            ANON_KEY: 'SUA_CHAVE_ANON_SUPABASE_VAI_AQUI'
        };
        ```

4.  **Executando:**
    *   Abra o projeto no VS Code com a extensão **Live Server** instalada.
    *   Clique com o botão direito no `index.html` e selecione "Open with Live Server".

## Deploy no Netlify (Deploy Automático via GitHub)

1.  **Conecte o Repositório:**
    *   Faça login no [Netlify](https://app.netlify.com/).
    *   Clique em **"Add new site"** -> **"Import an existing project"**.
    *   Conecte com o **GitHub** e selecione seu repositório `agendador-de-conteudo`.

2.  **Configure o Deploy:**
    *   Na tela de configurações, deixe o **Build command** e o **Publish directory** em branco. O Netlify irá detectar que é um site estático e usar a raiz do projeto.

3.  **Adicione as Variáveis de Ambiente:**
    *   Antes de fazer o deploy, vá para **"Site settings"** -> **"Build & deploy"** -> **"Environment"**.
    *   Clique em **"Edit variables"** e adicione as duas variáveis a seguir:
        *   **Key:** `SUPABASE_URL`, **Value:** `SUA_URL_SUPABASE_VAI_AQUI`
        *   **Key:** `SUPABASE_ANON_KEY`, **Value:** `SUA_CHAVE_ANON_SUPABASE_VAI_AQUI`

4.  **Injete o Snippet de Configuração:**
    *   Vá para **"Site settings"** -> **"Build & deploy"** -> **"Post processing"**.
    *   Encontre a seção **"Snippet injection"** e clique em **"Add snippet"**.
    *   Configure da seguinte forma:
        *   **Inject before `</head>`**
        *   Cole o seguinte código no campo de script:
            ```html
            <script>
              const SUPABASE_CONFIG = {
                URL: '{{ env.SUPABASE_URL }}',
                ANON_KEY: '{{ env.SUPABASE_ANON_KEY }}'
              };
            </script>
            ```
    *   Salve o snippet.

5.  **Faça o Deploy:**
    *   Volte para a aba **"Deploys"** e clique em **"Trigger deploy"** -> **"Deploy site"** para publicar a versão mais recente com as novas configurações.

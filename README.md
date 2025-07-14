# Backend API Documentation

Este diretório contém a implementação do backend da aplicação, que é construído utilizando Node.js e Express. Abaixo estão as informações sobre a estrutura do backend e como utilizá-lo.

## Estrutura do Diretório

- **src/**: Contém o código-fonte do backend.
  - **app.ts**: Ponto de entrada da aplicação. Configura o servidor Express e as rotas.
  - **controllers/**: Contém os controladores que gerenciam a lógica de negócios.
  - **routes/**: Define as rotas da aplicação e as conecta aos controladores.
  - **types/**: Contém definições de tipos e interfaces utilizadas no backend.

## Instalação

Para instalar as dependências do backend, navegue até o diretório `backend` e execute:

```
npm install
```

## Execução

Para iniciar o servidor, execute o seguinte comando no diretório `backend`:

```
npm start
```

O servidor estará disponível em `http://localhost:3000` (ou outra porta configurada).

## Endpoints

A seguir estão os endpoints disponíveis na API, agrupados por funcionalidade.

### Autenticação (`/auth`)

- **POST /login**: Autentica um administrador.
- **POST /logout**: Desconecta um administrador.
- **POST /check**: Verifica se um administrador está autenticado.

### Agendamentos (`/appointments`)

- **POST /**: Cria um novo agendamento.
- **POST /available**: Obtém os horários disponíveis para agendamento.

### Administração (`/admin`)

- **POST /dashboard**: Acessa o painel de administração.
- **DELETE /deleteAppointment/:id**: Exclui um agendamento.
- **PATCH /updateAppointmentStatus/:id**: Atualiza o status de um agendamento.

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou correções. Para isso, faça um fork do repositório e envie um pull request.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.

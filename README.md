# Ficha de Personagem (Character Sheet)

## Aplicativo Web feito para jogadores e mestres, inspirado por "Ordem Paranormal" de Cellbit, e em Call of Cthulhu.

ACDS RPG foi desenvolvido da seguinte forma:
  - Backend: Node.js com banco de dados MySQL.
  - Frontend: HTML, CSS, Javascript, JQuery e Bootstrap.

O sistema usa APIs de terceiros, como a Random.org, responsável por gerar números aleatórios.

As variáveis de ambiente são:
  - PORT: A porta a ser vinculada.
  - DATABASE_URL: A URL do banco de dados MySQL.
  - EXPRESS_SESSION_SECRET: Um hash ou secret para o funcionamento do pacote "xpress-session".
  - RANDOM_ORG_KEY: A chave para uso do Random.org. Caso não exista, o sistema gerará números pseudo-aleatórios.

O SQL para criar o banco de dados está nomeado como "create database.sql", e pode ser tanto executado como importado pra criar o ambiente.

Há uma rota escondida só pra mestres, que é "/register/admin", onde a chave do mestre/adm é "123456", como definida no banco de dados.

É possível fazer um playtest em https://acdsrpg.herokuapp.com/.

## Imagens

Ficha do Jogador
![image](https://user-images.githubusercontent.com/71353674/123519169-0dc36800-d680-11eb-9ce7-4b7e235bd30c.png)
![image](https://user-images.githubusercontent.com/71353674/123519192-29c70980-d680-11eb-965b-501b226d1614.png)
![image](https://user-images.githubusercontent.com/71353674/123519198-3186ae00-d680-11eb-9d8e-e0b7b84e4b8d.png)
![image](https://user-images.githubusercontent.com/71353674/123519220-51b66d00-d680-11eb-9d7c-5af01460aaa3.png)

Ficha do Mestre (Os dados dos Jogadores visualizados são atualizados dinamicamente)
![image](https://user-images.githubusercontent.com/71353674/123519203-3b101600-d680-11eb-9977-ac1d13ed4b13.png)

O projeto ainda possui algumas falhas e otimizações a serem feitas, então sinta-se a vontade para fazer um PR.

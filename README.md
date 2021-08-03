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
![image](https://user-images.githubusercontent.com/71353674/128062727-a813062a-5419-4cae-aa6e-ccb5ac87b0ff.png)
![image](https://user-images.githubusercontent.com/71353674/128062793-11e0a8b6-2d3e-4d8a-af91-0647129db8fc.png)
![image](https://user-images.githubusercontent.com/71353674/128062838-7feca0d6-9aa6-4eaf-972b-b5994eb282a6.png)
![image](https://user-images.githubusercontent.com/71353674/128062874-11a699ff-2780-4460-a8b3-ca21bee89c03.png)
![image](https://user-images.githubusercontent.com/71353674/128063032-85a201e7-6074-4732-b825-5863efb879aa.png)

Ficha do Mestre (Os dados dos Jogadores visualizados são atualizados dinamicamente)
![image](https://user-images.githubusercontent.com/71353674/128062938-81cfb058-0123-47df-95d1-fd9d8055908a.png)
![image](https://user-images.githubusercontent.com/71353674/128062964-4a61bd54-0e07-4ca3-82c1-da9a03167181.png)


O projeto ainda possui algumas falhas e otimizações a serem feitas, então sinta-se a vontade para fazer um PR.

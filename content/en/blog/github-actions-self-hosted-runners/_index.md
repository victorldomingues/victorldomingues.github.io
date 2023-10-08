---
title: "Como configurar Github Actions Self-Hosted Runners no Docker Local para aplicações .NET na AWS."
description: "Vamos falar um pouco sobre o Self-Hosted  Runners do Github Actions, é um recursos que permite usar uma maquina na cloud ou local para executar as actions do github."
excerpt: "Vamos falar um pouco sobre o Self-Hosted  Runners do Github Actions, é um recursos que permite usar uma maquina na cloud ou local para executar as actions do github."
date: 2023-10-08T22:21:42+00:00
lastmod: 2023-10-08T22:21:42+00:00
draft: true
weight: 50
images: ["https://raw.githubusercontent.com/victorldomingues/lambda-extensions-net6/main/aws-lambda-extensions.png"]
categories: ["Novidades", "Tutoriais", "AWS", ".NET", "Terraform", "Github", "Github Actions", "Docker", "ARM64"]
tags: ["AWS",  "Self-Hosted", "Github", "Runners", "Self-Hosted Runners", "Docker", "Github Actions", "ARM64", "Terraform", "Workflow"]
contributors: ["Victor Domingues"]
pinned: false
homepage: false
---

Olá, muito prazer me chamo Victor e sou desenvolvedor .NET. Hoje vamos falar um pouco sobre o Self-Hosted  Runners do Github Actions, é um recursos que permite usar uma maquina na cloud ou local para executar as actions do github você pode ver mais detalhes na documentação oficial About self-hosted runners - GitHub Docs.

Aqui está o passo a passo de como configurar Adding self-hosted runners - GitHub Docs.

Caso de uso

Por exemplo: Imagine que você precise executar o build de uma aplicação que necessite de configurações bem especificas que os runners padrão do Github não atende ou que você tenha uma imagem Docker pré-configurada com tudo que você precisa para rodar os steps de build. Até mesmo em casos que você tenha limitações de arquitetura de CPU em seu ambiente de desenvolvimento local.


1 – Ambiente

Instale o Docker
Get Docker | Docker Docs

Instale o Docker composse
Install the Compose plugin | Docker Docs


2 – Instrumentação

Vamos ver como configuramos o ambiente local e Docker para rodar o Github Actions Self-Hosted Runner junto de uma imagem de .NET 7 na arquitetura ARM na AWS.



2.1 Docker-compose

Estamos subindo uma imagem Docker .NET 7 da AWS.

Código 

Execute o comando Docker-compose up 

2.2 Configuração do Github Actions

Nas configurações da página da sua organização, acessa o submenu actions e em seguida acesse a opção runners, depois adicione um novo Self-hosted Runner

https://github.com/organizations/[SUA_ORGANIZACAO]/settings/actions/runners/new

Para esse exemplo configurei um Linux na arquitetura ARM64

2.3 Configurando o container

Siga as instruções descritas na própria documentação e não terá erro, para esse caso que estamos rodando em um container Docker precisamos acessar o bash do container e executar os comandos para configurar e executar os serviços do github

Copie exatamente os valores que o github vai gerar automaticamente para você os comandos demonstrados a seguir são apenas de exemplo:

Download
# Create a folder
$ mkdir actions-runner && cd actions-runner# Download the latest runner package
$ curl -o actions-runner-linux-arm64-2.309.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.309.0/actions-runner-linux-arm64-2.309.0.tar.gz# Optional: Validate the hash
$ echo "XYZ  actions-runner-linux-arm64-2.309.0.tar.gz" | shasum -a 256 -c# Extract the installer
$ tar xzf ./actions-runner-linux-arm64-2.309.0.tar.gz

Configure
# Create the runner and start the configuration experience
$ ./config.sh --url https://github.com/domingues-vi --token MEU_TOKEN# Last step, run it!
$ ./run.sh

Using your self-hosted runner
# Use this YAML in your workflow file for each job
runs-on: self-hosted

Depois de configurado no Job do seu workflow basta informar que quer executa-lo como self-hosted 

runs-on: self-hosted

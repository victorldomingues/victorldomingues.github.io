---
title: "AWS-Parameters-and-Secrets-Lambda-Extension e .NET 6"
description: "Introducing Doks, a Hugo theme helping you build modern documentation websites that are secure, fast, and SEO-ready — by default."
excerpt: "Introducing Doks, a Hugo theme helping you build modern documentation websites that are secure, fast, and SEO-ready — by default."
date: 2023-04-04T22:21:42+00:00
lastmod: 2023-04-04T22:21:42+00:00
draft: false
weight: 50
images: []
categories: ["News"]
tags: ["AWS", "AWS ParameterStore", "AWS SecretsManager", "SecretsManager", "Secrets Manager", "ParameterStore", "Parameter Store" , "SystemsManager", "AWS Systems Manager", "AWS Lambda", "AWS Serverless", "Serverless", "AWS Lambda Extensions", "Lambda", "Extensions"]
contributors: ["Victor Domingues"]
pinned: false
homepage: false
---

Em meados de novembro de 2022 os arquiteto e engenheiro da AWS publicaram um artigo no blog oficial da Amazon sobre como contornar o problema proposto no caso de uso. Em resumo o artigo em questão sugere a implementação de cache em memória utilizando um lambda layer (AWS Parameter Store and Secrets Manager Lambda Extension) que expõe um servidor HTTP que abstrai a implementação de cache as chamadas para os recursos AWS que o SDK normalmente faria. Essa proposta sugere a diminuição de custo financeiro, redução nas chamadas para os recursos AWS e propõe uma possível redução de latência uma vez que o acesso dos para recursos estão cacheados na memória desse layer.

Aqui vamos propor a implementação dessa solução em .NET 6, utilizando Terraform para automação da infraestrutura da função lambda.


```csharp
public class Teste {
    
}
```
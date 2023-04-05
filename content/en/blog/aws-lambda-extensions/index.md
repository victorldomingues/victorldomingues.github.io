---
title: "AWS-Parameters-and-Secrets-Lambda-Extension e .NET 6"
description: "A ideia desse artigo é apresentar uma alternativa para reduzir custos e requisições feitas para os recursos AWS (Secrets e Systems Manager) e entender quais os benefícios da solução proposta. A seguir podemos entender como é possível."
excerpt: "A ideia desse artigo é apresentar uma alternativa para reduzir custos e requisições feitas para os recursos AWS (Secrets e Systems Manager) e entender quais os benefícios da solução proposta. A seguir podemos entender como é possível."
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

Olá, muito prazer me chamo Victor e sou desenvolvedor .NET. Esse é meu primeiro artigo então não posso dispensar as apresentações. Obrigado por chegar até aqui, espero que goste desse formato de artigo.

Hoje vamos falar sobre como você pode reduzir custos tanto de acesso quanto financeiro para sua empresa em um cenário que você utilize os recursos _**AWS Lambda**_, _**AWS Systems Manager - Parameter Store**_, **_AWS Secrets Manager_** e claro a **Stack .NET** dentro da AWS. 

A ideia desse artigo é apresentar uma alternativa para reduzir custos e requisições feitas para os recursos AWS (Secrets e Systems Manager) e entender quais os benefícios da solução proposta. A seguir podemos entender como é possível.

Em meados de novembro de 2022 os _**Pal Patel** (Arquiteto)_ e  _**Saud ul Khalid** (Engenheiro)_ da AWS publicaram um artigo no blog oficial da Amazon sobre como contornar o problema proposto no caso de uso. Em resumo o artigo em questão sugere a implementação de cache em memória utilizando um lambda layer **(_AWS Parameter Store and Secrets Manager Lambda Extension_)** que expõe um servidor HTTP que abstrai a implementação de cache as chamadas para os recursos AWS que o SDK normalmente faria. Essa proposta sugere a diminuição de custo financeiro, redução nas chamadas para os recursos AWS e propõe uma possível redução de latência uma vez que o acesso dos para recursos estão cacheados na memória desse layer.

Aqui vamos propor a implementação dessa solução em .NET 6, utilizando Terraform para automação da infraestrutura da função lambda, seguindo as orientações do artigo oficial da AWS:
[Using the AWS Parameter and Secrets Lambda extension to cache parameters and secrets | AWS Compute Blog (amazon.com)](https://aws.amazon.com/blogs/compute/using-the-aws-parameter-and-secrets-lambda-extension-to-cache-parameters-and-secrets/)

<br/>

![Imagem](./images/aws-parameters-and-secrets-lambda-extension.png)

<br/>

## Caso de uso

<br/>

> **Caso de uso:** Imagine que você tem uma função lambda na AWS implementada em .NET cujo a mesma aplicação é executada após o recebimento de um Evento SQS e deve realizar uma consulta na WEB API de um parceiro. As informações referente a comunicação HTTP como servidor (HOST) e rota para as chamada dessa API estão armazenadas na **Parameter Store** e a chave de acesso gerado pelo seu parceiro está armazenada de forma segura no **Secrets Manager**, podemos facilmente recuperar os parâmetros e segredos através do SDK da AWS **(_AWSSDK.SimpleSystemsManagement, AWSSDK.SecretsManager_)**, porém o SDK realiza requisições para as APIS de recursos da Amazon conforme o número de instancias da função lambda aumenta, no pior dos casos a medida em que o Handler da função lambda é executado.

<br/>

## 1. Ambiente

Como mencionado o lambda layer irá expor um servidor local que armazenara os valores de parâmetros e segredo em cache, o servidor é exposto no host local na porta 2773 
(http:localhost: 2773)

<br/>

### 1.2 Variaveis de ambiente

Para preencher o header **_X-Aws-Parameters-Secrets-Token_** é necessário recuperar o valor da variável de ambiente **_AWS_SESSION_TOKEN_** fornecida em tempo de execução dentro do ambiente da AWS, para testes você pode mockar esse valor ou se tiver a AWS CLI configurada corretamente em sua máquina após fazer login e configurar o seu perfil esse valor é definido automaticamente, também deve estar atento ao valor da variável de ambiente **_PARAMETERS_SECRETS_EXTENSION_CACHE_ENABLED_** que habilita o cache.

[Outras configurações e variáveis de ambiente você pode acompanhar na integra através da documentação oficial da AWS: Using Parameter Store parameters in AWS Lambda functions - AWS Systems Manager (amazon.com)](https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html)

### 1.2.1 launchSettings.json

Para rodar localmente configure o launchSettings.json

```json
{
  "profiles": {
    "Mock Lambda Test Tool": {
      "commandName": "Executable",
      "commandLineArgs": "--port 5050",
      "workingDirectory": ".\\bin\\$(Configuration)\\net6.0",
      "executablePath": "%USERPROFILE%\\.dotnet\\tools\\dotnet-lambda-test-tool-6.0.exe",
      "environmentVariables": {
        "PARAMETERS_SECRETS_EXTENSION_HTTP_PORT": "2773",
        // "AWS_SESSION_TOKEN": "AWS_TOKEN" 
        // caso não esteja com as credenciais da AWS em sua maquina.
      }
    }
  }
}
```


<br/>

## 2. Contratos

### 2.1 Recuperar Segredos

```
GET

/secretsmanager/get

Parâmetros: 
* secretId: [ID_DO_SEGREDO] 

Headers: 
  Content-Type: application/json
* X-Aws-Parameters-Secrets-Token: VALOR_AWS_SESSION_TOKEN
```
<font size="1">(* Obrigatório)</font>

**Curl de exemplo**

```python
curl --location --request GET 'http://localhost:2773/secretsmanager/get?secretId=MEU_SEGREDO' \
--header 'X-Aws-Parameters-Secrets-Token: VALOR_AWS_SESSION_TOKEN'
```

**Resposta**

```json
{
  "ARN":"arn:aws:secretsmanager:us-west-2:123456789012:secret:MyTestDatabaseSecret-a1b2c3",
  "CreatedDate":1.523477145713E9,
  "Name":"MyTestDatabaseSecret",
  "SecretString":"{\n  \"username\":\"david\",\n  \"password\":\"EXAMPLE-PASSWORD\"\n}\n",
  "VersionId":"EXAMPLE1-90ab-cdef-fedc-ba987SECRET1"
} 
```
<font size="1">(* Obrigatório)</font>

### 2.2 Recuperar Parâmetros

```
GET

/systemsmanager/parameters/get

Parâmetros: 
* name: [NOME_DO_PARAMETRO] 
  version: [NÚMERO_VERSAO]
  label: [LABEL]
  withDecryption: [TRUE_FALSE]

Headers: 
  Content-Type: application/json
* X-Aws-Parameters-Secrets-Token: VALOR_AWS_SESSION_TOKEN

```
**Curl de exemplo**

```python
curl --location --request GET http://localhost:2773/systemsmanager/parameters/get?name=MEU_PARAMETRO' \
--header 'X-Aws-Parameters-Secrets-Token: VALOR_AWS_SESSION_TOKEN'
```

**Resposta**

```json
{
    "Parameter": {
        "ARN": "arn:aws:ssm:us-east-2:111122223333:parameter/MyGitHubPassword",
        "DataType": "text",
        "LastModifiedDate": 1582657288.8,
        "Name": "MyGitHubPassword",
        "Type": "SecureString",
        "Value": "AYA39c3b3042cd2aEXAMPLE/AKIAIOSFODNN7EXAMPLE/fh983hg9awEXAMPLE==",
        "Version": 3
    }
}
```


## 3. Implementação em .NET 6

### 3.1 Modelos

```csharp
public record Parameter(string Name, string Value, int Version);
public record GetParameterResponse(Parameter Parameter);
public record GetSecretValueResponse(string Name, string SecretString);
```

### 3.2 Function.cs

```csharp

public class Function
{

    public Function() { }

    public async Task FunctionHandler(SQSEvent evnt, ILambdaContext context)
    {
        var port = Environment.GetEnvironmentVariable("PARAMETERS_SECRETS_EXTENSION_HTTP_PORT");
        var sessionToken = Environment.GetEnvironmentVariable("AWS_SESSION_TOKEN");

        using var httpClientLayer = new HttpClient();
        httpClientLayer.BaseAddress = new Uri($"http://localhost:{port}");
        httpClientLayer.DefaultRequestHeaders.Add("X-Aws-Parameters-Secrets-Token", sessionToken);

        var pathSecret = BuildPath(path: "/secretsmanager/get",
                                key: "secretId",
                                value: "/Partner/ServiceToken");

        var pathParameter = BuildPath(path: "/systemsmanager/parameters/get",
                                    key: "name",
                                    value: "/Partner/Host");

        var serviceTokenSecret = await httpClientLayer.GetFromJsonAsync<GetSecretValueResponse>(pathSecret);
        var partnerHostParameter = await httpClientLayer.GetFromJsonAsync<GetParameterResponse>(pathParameter);

    }

    private static string BuildPath(string path, string key, string value)
    {
        var query = new Dictionary<string, string>(1)
        {
            [key] = value
        };
        return QueryHelpers.AddQueryString(path, query);
    }
}

```

## 4. Automação da Infraestrutura em terraform.

Para esse exemplo vamos criar a automação atravéz do Terraform. Não se preocupe mesma automação tem equivalência para CloudFormation.

É necessário configurar previamente a infraestrutura da lambda criando as roles com suas respectivas permissões. 

### 4.1 data.tf

```terraform
data "aws_iam_policy_document" "AWSLambdaTrustPolicy" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}
```

### 4.2 locals.tf

```terraform
locals {
  lambda_name = "lambda_extensions_net6"
  runtime     = "dotnet6"
  filename    = "${path.module}/../src/LambdaExtensions/bin/Release/net6.0/LambdaExtensions.zip" # dotnet lambda package
  file_exists = fileexists(local.filename)
}

```

Em seguida configurar a lambda com o layer necessário para que a utilização do cachê seja bem-sucedida. As versões da layer estão disponíveis na documentação oficial: [Using Parameter Store parameters in AWS Lambda functions - AWS Systems Manager (amazon.com)](https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html)

**adicione a layer** arn:aws:lambda:sa-east-1:933737806257:layer:AWS-Parameters-and-Secrets-Lambda-Extension:4 no recurso **aws_lambda_function**


### 4.3 main.tf

```terraform
resource "aws_iam_role" "lambda_role" {
  name               = "lambda_role"
  assume_role_policy = data.aws_iam_policy_document.AWSLambdaTrustPolicy.json
}

resource "aws_iam_role_policy_attachment" "terraform_lambda_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "lambda_extensions_net6" {
  function_name    = local.lambda_name
  handler          = "LambdaExtensions::LambdaExtensions.Function::FunctionHandler"
  runtime          = local.runtime
  role             = aws_iam_role.lambda_role.arn
  filename         = local.filename
  source_code_hash = filebase64sha256(local.filename)
  timeout          = 30
  memory_size      = 128
  environment {
    variables = {
      PARAMETERS_SECRETS_EXTENSION_CACHE_ENABLED = "TRUE"
      PARAMETERS_SECRETS_EXTENSION_HTTP_PORT     = "2773"
      # PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL     = "DEBUG"
      # veja todas as variaveis de ambiente
      # https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html

    }
  }
  layers = ["arn:aws:lambda:sa-east-1:933737806257:layer:AWS-Parameters-and-Secrets-Lambda-Extension:4"]
  # Escolha a ARN de sua região
  # https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html
}


output "lambda_file_exists" {
  value       = local.file_exists
  description = "Filename exists"
}
```

## Código fonte

[victorldomingues/lambda-extensions-net6: Implementação da AWS-Parameters-and-Secrets-Lambda-Extension em .NET 6 + terraform (github.com)](https://github.com/victorldomingues/lambda-extensions-net6)

## Conclusão

A solução proposta é bem promissora e fácil de se implementar por ser baseada em conceitos já bem definidos na computação como cache em memória e protocolo HTTP garantido que faça menos requisições para os recursos AWS (Systems e Secrets Manager). Apesar do exemplo em .NET 6 apresentado neste artigo a extensão AWS-Parameters-and-Secrets-Lambda-Extension é agnóstica a linguagem ou Stack uma vez que ela é um lambda layer e pode ser vinculada a qualquer função lambda usando o runtime de sua preferência. 


**Principais Benefícios**

* Redução de latência
* Redução de chamadas para AWS Systems e Secrets Manager
* Redução de custos para AWS Systems e Secrets Manager

**Referências**

[Using the AWS Parameter and Secrets Lambda extension to cache parameters and secrets | AWS Compute Blog (amazon.com)](https://aws.amazon.com/blogs/compute/using-the-aws-parameter-and-secrets-lambda-extension-to-cache-parameters-and-secrets/)


[Using Parameter Store parameters in AWS Lambda functions - AWS Systems Manager (amazon.com)](https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html)

[GetSecretValue - AWS Secrets Manager (amazon.com)](https://aws.amazon.com/blogs/compute/using-the-aws-parameter-and-secrets-lambda-extension-to-cache-parameters-and-secrets/)

[GetParameter - AWS Systems Manager (amazon.com)](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParameter.html)

[AWS Systems Manager Parameter Store - AWS Systems Manager (amazon.com)](https://docs.aws.amazon.com/pt_br/systems-manager/latest/userguide/systems-manager-parameter-store.html)

[Gerenciamento de senhas de credenciais - AWS Secrets Manager - Amazon Web Services](https://aws.amazon.com/pt/secrets-manager/)

[aws-lambda-dotnet/README.md at master · aws/aws-lambda-dotnet · GitHub](https://github.com/aws/aws-lambda-dotnet/blob/master/Tools/LambdaTestTool/README.md)

[Create mock APIs in seconds with Mockoon](https://mockoon.com/)

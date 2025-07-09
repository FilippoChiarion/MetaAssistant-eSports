const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

const askAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash"
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const asking = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento no jogo, estratégias, builds e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não
    tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com
    'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na
    data atual, para dar uma resposta coerente.
    - Nunca responde itens que você não tenha certeza de que
    existe no pacht atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres 
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build de rengar jungle
    resposta: A build mais atual é: \n\n *Itens: coloque
    os itens aqui.\n\n**Runas:**\n\nexemplos de runas\n\ntambem fale sobre win rate no patch atual

    ---
    Aqui está a pergunta do usuário: ${question}
  `
  const contents = [{
    role: "user",
    parts: [{
      text: asking
    }]
  }]

  const tools = [{
    google_search: {}
  }]

  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const sendForm = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const game = gameSelect.value
  const question = questionInput.value

  if(apiKey == '' || game == '' || question == '') {
    alert('Please, fill in all fields.')
    return 
  }

  askButton.disabled = true
  askButton.textContent = 'Asking...'
  askButton.classList.add('loading')

  try {
    const text = await askAI(question, game, apiKey)
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
    aiResponse.classList.remove('hidden')
  } 

  catch(error){
    console.log('Error: ', + error)
  } 

  finally {
    askButton.disabled = false
    askButton.textContent = "Ask"
    askButton.classList.remove('loading')
  }

}
form.addEventListener('submit', sendForm)
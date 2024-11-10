export type PromptCard = {
  id: string
  prompt: string
  model: string
  result?: string
}

export type Column = {
  id: string
  title: string
  cards: PromptCard[]
}

"use client"

import { useState, useEffect } from "react"
import { DragDropContext, DropResult } from "@hello-pangea/dnd"
import { Settings, Github } from "lucide-react"
import { Button } from "./components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Textarea } from "./components/ui/textarea"
import { useToast } from "./components/ui/use-toast"
import { Toaster } from "./components/ui/toaster"
import { DroppableColumn } from "./components/DroppableColumn"
import ReactMarkdown from 'react-markdown'
import OpenAI from 'openai'
import { Column, PromptCard } from "./types"

const STORAGE_KEY = 'ai_prompt_board_data'

export default function Home() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", cards: [] },
    { id: "inprogress", title: "In Progress", cards: [] },
    { id: "done", title: "Done", cards: [] },
  ])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState("")
  const [apiKey, setApiKey] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key')
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }

    const storedData = localStorage.getItem(STORAGE_KEY)
    if (storedData) {
      setColumns(JSON.parse(storedData))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
  }, [columns])

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  })

  const handleCreateCard = (card: PromptCard) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === "todo" ? { ...col, cards: [...col.cards, card] } : col
      )
    )
    setIsCreateDialogOpen(false)
    toast({
      title: "Success",
      description: "Prompt card created successfully",
    })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const sourceCards = Array.from(sourceColumn.cards)
    const destCards = Array.from(destColumn.cards)
    const [removed] = sourceCards.splice(source.index, 1)
    destCards.splice(destination.index, 0, removed)

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === source.droppableId) {
          return { ...col, cards: sourceCards }
        }
        if (col.id === destination.droppableId) {
          return { ...col, cards: destCards }
        }
        return col
      })
    )
  }

  const handleRunPrompt = async (card: PromptCard) => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please set your OpenAI API key in the settings",
        variant: "destructive",
      })
      return
    }

    try {
      // Move to In Progress
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === "todo") {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== card.id),
            }
          }
          if (col.id === "inprogress") {
            return {
              ...col,
              cards: [...col.cards, card],
            }
          }
          return col
        })
      )

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: card.model,
        messages: [{ role: 'user', content: card.prompt }],
      })

      const result = completion.choices[0].message.content || ''

      // Move to Done
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === "inprogress") {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== card.id),
            }
          }
          if (col.id === "done") {
            return {
              ...col,
              cards: [...col.cards, { ...card, result }],
            }
          }
          return col
        })
      )

      toast({
        title: "Success",
        description: "Prompt completed successfully",
      })
    } catch (error: any) {
      // Move back to Todo
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === "inprogress") {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== card.id),
            }
          }
          if (col.id === "todo") {
            return {
              ...col,
              cards: [...col.cards, card],
            }
          }
          return col
        })
      )

      toast({
        title: "Error",
        description: error.message || "Failed to run prompt",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (card: PromptCard) => {
    if (!card.result) return

    const blob = new Blob([card.result], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prompt_result_${card.id}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePreview = (content: string) => {
    setPreviewContent(content)
    setIsPreviewDialogOpen(true)
  }

  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey)
    localStorage.setItem('openai_api_key', newApiKey)
    setIsSettingsDialogOpen(false)
    toast({
      title: "Success",
      description: "API key saved successfully",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-500">
      <header className="bg-black bg-opacity-50 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Prompt Board</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-yellow-400 text-black hover:bg-yellow-500">
              New Prompt
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsSettingsDialogOpen(true)} className="bg-transparent border-white text-white hover:bg-white hover:text-black">
              <Settings className="h-4 w-4" />
            </Button>
            <a href="https://github.com/Justmalhar/promptboard" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                <Github className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8 bg-black bg-opacity-20 rounded-lg p-6 text-white text-opacity-90 max-w-none">
      <h1 className="text-2xl font-bold mb-4">Welcome to the AI Prompt Board</h1>
      <p className="mb-4">
        Your open-source solution for effortless AI prompt management and execution!
      </p>
      <h2 className="text-xl font-semibold mb-2">✨ Key Features</h2>
      <ul className="list-disc list-inside mb-4">
        <li>
          <strong>Drag & Drop Interface:</strong> Prompt organize themselves by moving across columns.
        </li>
        <li>
          <strong>Create New Prompts and Execute:</strong> Generate prompts tailored to your needs and execute with a single click.
        </li>
        <li>
          <strong>Watch AI Magic in Action:</strong> Run prompts and witness the results live!
        </li>
      </ul>
      <p>Get started now and streamline your AI workflow!</p>
    </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                onRunPrompt={handleRunPrompt}
                onPreview={handlePreview}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </DragDropContext>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-white bg-opacity-90 backdrop-blur-lg">
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const newCard: PromptCard = {
                id: Date.now().toString(),
                prompt: formData.get("prompt") as string,
                model: formData.get("model") as string,
              }
              handleCreateCard(newCard)
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea id="prompt" name="prompt" required className="bg-white bg-opacity-50" />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select name="model" defaultValue="gpt-4">
                    <SelectTrigger className="bg-white bg-opacity-50">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="o1-preview-2024-09-12">O1 Preview (2024-09-12)</SelectItem>
                      <SelectItem value="o1-preview">O1 Preview</SelectItem>
                      <SelectItem value="gpt-4o-2024-08-06">GPT-4O (2024-08-06)</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                      <SelectItem value="o1-mini-2024-09-12">O1 Mini (2024-09-12)</SelectItem>
                      <SelectItem value="o1-mini">O1 Mini</SelectItem>
                      <SelectItem value="chatgpt-4o-latest">ChatGPT-4O Latest</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="openai/custom_model">OpenAI Custom Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-500">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-3xl bg-white bg-opacity-90 backdrop-blur-lg">
            <DialogHeader>
              <DialogTitle>Markdown Preview</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <ReactMarkdown>{previewContent}</ReactMarkdown>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="bg-white bg-opacity-90 backdrop-blur-lg">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const newApiKey = formData.get("apiKey") as string
              handleSaveApiKey(newApiKey)
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">OpenAI API Key</Label>
                  <Input
                    id="apiKey"
                    name="apiKey"
                    type="password"
                    defaultValue={apiKey}
                    required
                    className="bg-white bg-opacity-50"
                  />
                </div>
                <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-500">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>

    
      <Toaster />
    </div>
  )
}

import { motion } from "framer-motion"
import { Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "./ui/card"
import { Button } from "./ui/button"
import { Eye, Download } from "lucide-react"
import { PromptCard } from "../types"

interface DraggableCardProps {
  card: PromptCard
  index: number
  columnId: string
  onRun: (card: PromptCard) => void
  onPreview: (content: string) => void
  onDownload: (card: PromptCard) => void
}

const MotionCard = motion(Card)

export function DraggableCard({
  card,
  index,
  columnId,
  onRun,
  onPreview,
  onDownload,
}: DraggableCardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <MotionCard
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-white bg-opacity-80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader>
              <CardDescription>{card.model}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{card.prompt}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              {columnId === "todo" && (
                <Button onClick={() => onRun(card)} className="bg-yellow-400 text-black hover:bg-yellow-500">
                  Run
                </Button>
              )}
              {columnId === "done" && card.result && (
                <>
                  <Button onClick={() => onPreview(card.result!)} className="bg-orange-400 text-white hover:bg-orange-500">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={() => onDownload(card)} className="bg-orange-400 text-white hover:bg-orange-500">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </CardFooter>
          </MotionCard>
        </div>
      )}
    </Draggable>
  )
}

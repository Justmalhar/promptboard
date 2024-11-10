import { motion } from "framer-motion"
import { Droppable } from "@hello-pangea/dnd"
import { ClipboardList, Loader2, CheckCircle } from "lucide-react"
import { Column, PromptCard } from "../types"
import { DraggableCard } from "./DraggableCard"
import { AnimatePresence } from "framer-motion"

interface DroppableColumnProps {
  column: Column
  onRunPrompt: (card: PromptCard) => void
  onPreview: (content: string) => void
  onDownload: (card: PromptCard) => void
}

const MotionDiv = motion.div

export function DroppableColumn({
  column,
  onRunPrompt,
  onPreview,
  onDownload,
}: DroppableColumnProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden"
    >
      <h2 className="text-xl font-semibold p-4 flex items-center text-white">
        {column.id === "todo" && <ClipboardList className="w-5 h-5 mr-2" />}
        {column.id === "inprogress" && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        {column.id === "done" && <CheckCircle className="w-5 h-5 mr-2" />}
        {column.title}
      </h2>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="p-4 space-y-4"
          >
            <AnimatePresence>
              {column.cards.map((card, index) => (
                <DraggableCard
                  key={card.id}
                  card={card}
                  index={index}
                  columnId={column.id}
                  onRun={onRunPrompt}
                  onPreview={onPreview}
                  onDownload={onDownload}
                />
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </MotionDiv>
  )
}

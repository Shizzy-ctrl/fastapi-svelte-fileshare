import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, LogIn } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'

interface SessionExpiredModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SessionExpiredModal({ isOpen, onClose }: SessionExpiredModalProps) {
  const navigate = useNavigate()

  const handleLoginRedirect = () => {
    onClose()
    navigate('/login')
  }

  useEffect(() => {
    if (isOpen) {
      // Prevent closing with escape key or outside click
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md" 
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
            <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-lg font-semibold">
            Session Expired
          </DialogTitle>
          <DialogDescription className="text-center">
            Your session has expired. Please log in again to continue using the application.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-center mt-6">
          <Button 
            onClick={handleLoginRedirect}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <LogIn size={16} />
            Go to Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

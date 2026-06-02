import { Router }        from 'express'
import { submitWaitlist } from '../controllers/waitlist.controller'
import { validate }       from '../middleware/validate.middleware'
import { waitlistSchema } from '../schemas/forms.schemas'

const router = Router()

// POST /waitlist
router.post('/', validate(waitlistSchema), submitWaitlist)

export default router

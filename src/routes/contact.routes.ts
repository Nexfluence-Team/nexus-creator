import { Router } from 'express'
import { submitContact } from '../controllers/contact.controller'
import { validate }      from '../middleware/validate.middleware'
import { contactSchema } from '../schemas/forms.schemas'

const router = Router()

// POST /contact
router.post('/', validate(contactSchema), submitContact)

export default router

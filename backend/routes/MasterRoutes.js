import MasterController from '../controllers/MasterController'
const express = require('express')
const router = express.Router()

router.get('/', MasterController.index)

const MasterRouter = router

export default MasterRouter

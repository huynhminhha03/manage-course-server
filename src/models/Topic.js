const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')

const Schema = mongoose.Schema

const TopicSchema = new Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, slug: 'name', unique: true },
})

mongoose.plugin(slug)

module.exports = mongoose.model('Topic', TopicSchema)

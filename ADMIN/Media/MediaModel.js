const { default: mongoose } = require("mongoose")


class MediaModel {
    constructor() {
        this.schema = new mongoose.Schema({
            name: { type: String, required: true },
            mimetype: { type: String, required: true },
            ext: { type: String, required: true },
            path: { type: String, required: true },
            size: { type: String, required: true },
            uploadedby: { type: String, default: null },
            filePurpose: { type: String, default: null },
        }, { timestamps: true })
    }
}

const Media = new MediaModel()
const mediamodel = mongoose.model("tbl_Media", Media.schema)

module.exports = mediamodel

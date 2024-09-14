const fs = require("fs");
const path = require("path");
const Randomstring = require("randomstring");
const mediamodel = require("./MediaModel");

class MediaController {
  async GetMedia(req, res) {
    try {
      let File = req.files.file;
      let { mimetype, size } = File;
      let name = File.name;
      let ext = name.split(".");
      ext = ext[ext.length - 1];

      name = Randomstring.generate({
        length: 12,
        charset: "alphabetic",
      }).toLowerCase();
      name = name + "." + ext;

      File.name = name;
      mimetype = mimetype.split("/")[0];

      if (mimetype !== "image" && mimetype !== "video") {
        mimetype = "application";
      }

      // Define the full folder path relative to the current file
      const folderName = path.resolve(__dirname, `../uploads/${mimetype}`);

      try {
        // Create directories recursively if they don't exist
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName, { recursive: true });
          console.log(`Directory created: ${folderName}`);
        }
      } catch (err) {
        console.error("Error creating directory:", err);
        return res.status(500).json({ message: "Failed to create directory" });
      }

      // Define the path to save the file
      const filePath = path.join(folderName, name);

      // Move the uploaded file to the specified path
      await File.mv(filePath);

      console.log("6___________________________");

      // Update path to be relative to your server
      const relativePath = `/uploads/${mimetype}/${name}`;
      const Media = await mediamodel.create({
        name,
        mimetype,
        ext,
        path: relativePath,
        size,
      });

      // Generate URL for accessing the media
      const url = `https://localhost:5100${relativePath}`;

      res.json({ success: true, media: { ...Media._doc, url } });
    } catch (error) {
      console.error("Error in GetMedia:", error);
      res
        .status(500)
        .json({ message: "Hello Tarun ---- Internal Server Error" });
    }
  }




  async ShowMedia(req, res) {
    try {
      const result = await mediamodel
        .find(
          {
            $or: [{ mimetype: "image" }, { mimetype: "video" }],
          },
          {
            _id: 1,
            mimetype: 1,
            url: {
              $concat: ["https://localhost:5100", "$path"], // Ensure path is correctly formatted
            },
          }
        )
        .sort({ createdAt: -1 });
  
      if (result.length > 0) {
        return res.status(200).json({ message: "Success", media: result });
      }
  
      return res.status(400).json({ message: "Something Went Wrong" });
    } catch (error) {
      console.error("Error in ShowMedia:", error); // Improved error message
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  

  


}

const mediaController = new MediaController();
module.exports = mediaController;






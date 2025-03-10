import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const FILE_UPLOAD_BASE = process.env['FILE_UPLOAD_BASE'] || path.resolve(process.cwd(), 'file-uploads')
const FILE_PATH_PREFIX = '/files'

function encodeFileName(filename: string){
  const t = path.parse(filename)
  const b = Buffer.from(t.name, 'utf8');
  return b.toString('hex') + t.ext;
}

function decodeFileName(filename: string){
  const t = path.parse(filename)
  const b = Buffer.from(t.name, 'hex');
  return b.toString('utf8') + t.ext;
}


/**
 * This is a simple file upload service based on Express which will be integrated to the sample server.
 */
export function setupFileService(app: any){

  console.log("initiated file service");
  app.use(cors({
    exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges']
  }))
  app.use(fileUpload({
    createParentPath: true,
    defParamCharset: 'utf8'
  }))

  app.post("/api/files/upload", function(req: any, res: any){
    console.log("start uploading files")

    let uploadFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        ret: -1,
        message: 'No files were uploaded.'
      });
    }

    uploadFile = req.files.file;
    const fileName = encodeFileName(uploadFile.name)
    const username = req.query.username
    uploadPath = path.resolve(FILE_UPLOAD_BASE, username, fileName);

    console.log("saving files to: ", uploadPath)

    // Use the mv() method to place the file somewhere on your server
    uploadFile.mv(uploadPath, (err) => {
      if (err){
        return res
          .status(500)
          .json({
            ret: -1,
            message: err.message
          })
      }
      res.json({
        ret: 0,
        message: 'success',
        data: {
          path: `${FILE_PATH_PREFIX}/${fileName}`
        }
      });
    });
  })

  app.get("/api/files/list", function(req: any, res: any){
    const username = req.query.username

    fs.readdir(FILE_UPLOAD_BASE + `/${username}`, (err, files) => {
      if(!files){
        res.json({
          ret: 0,
          data: []
        })
      }else{
        res.json({
          ret: 0,
          data: files.map(fileName => {
            return {
              name: decodeFileName(fileName),
              path: `${FILE_PATH_PREFIX}/${username}/${fileName}`
            }
          })
        })
      }
    })
  })

  app.use(FILE_PATH_PREFIX, express.static(path.resolve(FILE_UPLOAD_BASE), {
    // @ts-ignore
    acceptRanges: true,
    cacheControl: false,
    etag: false,
    lastModified: false
  }));
}
